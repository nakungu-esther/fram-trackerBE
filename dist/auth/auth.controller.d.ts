import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
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
        };
    }>;
    me(user: AuthUser): Promise<{
        id: string;
        email: string;
        role: string;
        name: string;
        phone: string;
        location: string;
    }>;
    patchProfile(user: AuthUser, dto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        role: string;
        name: string;
        phone: string;
        location: string;
    }>;
}
