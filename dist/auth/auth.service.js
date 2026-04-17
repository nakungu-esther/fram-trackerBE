"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const BCRYPT_ROUNDS = Math.min(14, Math.max(10, Number(process.env.BCRYPT_ROUNDS || 12)));
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    toPublicUser(user) {
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
    signToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        };
        return this.jwt.sign(payload);
    }
    async register(dto) {
        const email = dto.email.trim().toLowerCase();
        const exists = await this.prisma.user.findUnique({ where: { email } });
        if (exists) {
            throw new common_1.ConflictException('An account with this email already exists');
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
    async login(email, password) {
        const normalized = email.trim().toLowerCase();
        const user = await this.prisma.user.findUnique({
            where: { email: normalized },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const accessToken = this.signToken(user);
        return { accessToken, user: this.toPublicUser(user) };
    }
    async validateUserPayload(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException('Session no longer valid');
        return this.toPublicUser(user);
    }
    async updateProfile(userId, dto) {
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
    async requestPasswordReset(email) {
        const generic = {
            ok: true,
            message: 'If an account exists for that email, you will receive password reset instructions shortly.',
        };
        const normalized = email.trim().toLowerCase();
        const user = await this.prisma.user.findUnique({
            where: { email: normalized },
        });
        if (!user) {
            return generic;
        }
        const raw = (0, crypto_1.randomBytes)(32).toString('hex');
        const tokenHash = (0, crypto_1.createHash)('sha256').update(raw).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await this.prisma.passwordResetToken.deleteMany({
            where: { userId: user.id },
        });
        await this.prisma.passwordResetToken.create({
            data: { userId: user.id, tokenHash, expiresAt },
        });
        const base = (process.env.APP_PUBLIC_URL || 'http://localhost:5173').replace(/\/$/, '');
        const resetUrl = `${base}/auth/reset-password?token=${encodeURIComponent(raw)}`;
        const emailed = await this.trySendPasswordResetEmail(user.email, user.name, resetUrl);
        if (!emailed) {
            this.logger.warn(`Password reset for ${user.email}: no SMTP configured — link logged here for operators only.`);
            this.logger.log(`RESET LINK: ${resetUrl}`);
            if (process.env.PASSWORD_RESET_EXPOSE_LINK === 'true') {
                return { ...generic, devResetLink: resetUrl };
            }
        }
        return generic;
    }
    async trySendPasswordResetEmail(to, name, resetUrl) {
        const host = process.env.SMTP_HOST?.trim();
        if (!host) {
            return false;
        }
        try {
            const nodemailer = await Promise.resolve().then(() => __importStar(require('nodemailer')));
            const port = Number(process.env.SMTP_PORT || 587);
            const secure = process.env.SMTP_SECURE === 'true';
            const user = process.env.SMTP_USER?.trim();
            const pass = process.env.SMTP_PASS?.trim();
            const transporter = nodemailer.createTransport({
                host,
                port,
                secure,
                auth: user && pass
                    ? { user, pass }
                    : undefined,
            });
            const from = process.env.SMTP_FROM?.trim() || 'AgriTrack <noreply@localhost>';
            await transporter.sendMail({
                from,
                to,
                subject: 'Reset your AgriTrack password',
                text: `Hi ${name},\n\nUse this link to choose a new password (valid 1 hour):\n${resetUrl}\n\nIf you did not request this, you can ignore this email.\n`,
                html: `<p>Hi ${name},</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in one hour. If you did not request a reset, ignore this message.</p>`,
            });
            return true;
        }
        catch (e) {
            this.logger.error(`SMTP password reset failed: ${String(e)}`);
            return false;
        }
    }
    async resetPasswordWithToken(token, password) {
        const raw = token?.trim();
        if (!raw) {
            throw new common_1.BadRequestException('Reset token is required.');
        }
        const tokenHash = (0, crypto_1.createHash)('sha256').update(raw).digest('hex');
        const row = await this.prisma.passwordResetToken.findUnique({
            where: { tokenHash },
        });
        if (!row || row.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired reset link. Request a new one.');
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map