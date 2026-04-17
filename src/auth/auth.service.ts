import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import type { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from './jwt.strategy';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const BCRYPT_ROUNDS = Math.min(14, Math.max(10, Number(process.env.BCRYPT_ROUNDS || 12)));

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

 private toPublicUser(user: User) {
 return {
 id: user.id,
 email: user.email,
 role: user.role,
 name: user.name,
 phone: user.phone ?? '',
 location: user.location ?? '',
 suiAddress: user.suiAddress ?? '',
 };
 }

  private signToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    return this.jwt.sign(payload);
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new ConflictException('An account with this email already exists');
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: dto.role,
        name: dto.name.trim(),
        phone: dto.phone?.trim() || null,
        location: dto.location?.trim() || null,
      },
    });
    const accessToken = this.signToken(user);
    return { accessToken, user: this.toPublicUser(user) };
  }

  async login(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalized },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const accessToken = this.signToken(user);
    return { accessToken, user: this.toPublicUser(user) };
  }

  async validateUserPayload(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Session no longer valid');
    return this.toPublicUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name != null ? { name: dto.name.trim() } : {}),
        ...(dto.phone !== undefined
          ? { phone: dto.phone.trim() || null }
          : {}),
        ...(dto.location !== undefined
          ? { location: dto.location.trim() || null }
          : {}),
        ...(dto.suiAddress !== undefined
          ? { suiAddress: dto.suiAddress.trim() || null }
          : {}),
      },
    });
    return this.toPublicUser(user);
  }

  /**
   * Always returns the same shape (do not leak whether the email exists).
   * Sends email when SMTP_* env is set; otherwise logs the link and may return devResetLink.
   */
  async requestPasswordReset(email: string): Promise<{
    ok: true;
    message: string;
    devResetLink?: string;
  }> {
    const generic = {
      ok: true as const,
      message:
        'If an account exists for that email, you will receive password reset instructions shortly.',
    };

    const normalized = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalized },
    });
    if (!user) {
      return generic;
    }

    const raw = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(raw).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });
    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const base = (
      process.env.APP_PUBLIC_URL || 'http://localhost:5173'
    ).replace(/\/$/, '');
    const resetUrl = `${base}/auth/reset-password?token=${encodeURIComponent(raw)}`;

    const emailed = await this.trySendPasswordResetEmail(
      user.email,
      user.name,
      resetUrl,
    );

    if (!emailed) {
      this.logger.warn(
        `Password reset for ${user.email}: no SMTP configured — link logged here for operators only.`,
      );
      this.logger.log(`RESET LINK: ${resetUrl}`);
      if (process.env.PASSWORD_RESET_EXPOSE_LINK === 'true') {
        return { ...generic, devResetLink: resetUrl };
      }
    }

    return generic;
  }

  private async trySendPasswordResetEmail(
    to: string,
    name: string,
    resetUrl: string,
  ): Promise<boolean> {
    const host = process.env.SMTP_HOST?.trim();
    if (!host) {
      return false;
    }
    try {
      const nodemailer = await import('nodemailer');
      const port = Number(process.env.SMTP_PORT || 587);
      const secure = process.env.SMTP_SECURE === 'true';
      const user = process.env.SMTP_USER?.trim();
      const pass = process.env.SMTP_PASS?.trim();
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth:
          user && pass
            ? { user, pass }
            : undefined,
      });
      const from =
        process.env.SMTP_FROM?.trim() || 'AgriTrack <noreply@localhost>';
      await transporter.sendMail({
        from,
        to,
        subject: 'Reset your AgriTrack password',
        text: `Hi ${name},\n\nUse this link to choose a new password (valid 1 hour):\n${resetUrl}\n\nIf you did not request this, you can ignore this email.\n`,
        html: `<p>Hi ${name},</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in one hour. If you did not request a reset, ignore this message.</p>`,
      });
      return true;
    } catch (e) {
      this.logger.error(`SMTP password reset failed: ${String(e)}`);
      return false;
    }
  }

  async resetPasswordWithToken(token: string, password: string) {
    const raw = token?.trim();
    if (!raw) {
      throw new BadRequestException('Reset token is required.');
    }
    const tokenHash = createHash('sha256').update(raw).digest('hex');
    const row = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
    if (!row || row.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset link. Request a new one.');
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: row.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.delete({ where: { id: row.id } }),
    ]);
    return { ok: true };
  }
}
