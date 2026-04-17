import { FarmService } from './farm.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import type { AuthUser } from '../auth/auth-user.interface';
export declare class FarmController {
    private readonly farmService;
    constructor(farmService: FarmService);
    findAll(user: AuthUser): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        address: string | null;
        latitude: number | null;
        longitude: number | null;
    }[]>;
    create(dto: CreateFarmDto, user: AuthUser): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        address: string | null;
        latitude: number | null;
        longitude: number | null;
    }>;
}
