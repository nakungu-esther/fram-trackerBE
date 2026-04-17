import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { AuthUser } from './auth-user.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    login(dto: LoginDto): Promise<{
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
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        ok: true;
        message: string;
        devResetLink?: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        ok: boolean;
    }>;
    me(user: AuthUser): Promise<{
        id: string;
        email: string;
        role: string;
        name: string;
        phone: string;
        location: string;
        suiAddress: string;
    }>;
    patchProfile(user: AuthUser, dto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        role: string;
        name: string;
        phone: string;
        location: string;
        suiAddress: string;
    }>;
}
