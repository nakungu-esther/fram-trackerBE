import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly logger;
    constructor(prisma: PrismaService, jwt: JwtService);
    private toPublicUser;
    private signToken;
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: string;
            name: string;
            phone: string;
            location: string;
            suiAddress: string;
        };
    }>;
    login(email: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: string;
            name: string;
            phone: string;
            location: string;
            suiAddress: string;
        };
    }>;
    validateUserPayload(userId: string): Promise<{
        id: string;
        email: string;
        role: string;
        name: string;
        phone: string;
        location: string;
        suiAddress: string;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        role: string;
        name: string;
        phone: string;
        location: string;
        suiAddress: string;
    }>;
    requestPasswordReset(email: string): Promise<{
        ok: true;
        message: string;
        devResetLink?: string;
    }>;
    private trySendPasswordResetEmail;
    resetPasswordWithToken(token: string, password: string): Promise<{
        ok: boolean;
    }>;
}
