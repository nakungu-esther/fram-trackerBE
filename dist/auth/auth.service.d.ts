import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
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
        };
    }>;
    validateUserPayload(userId: string): Promise<{
        id: string;
        email: string;
        role: string;
        name: string;
        phone: string;
        location: string;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        role: string;
        name: string;
        phone: string;
        location: string;
    }>;
}
