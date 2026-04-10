import { FarmService } from './farm.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import type { AuthUser } from '../auth/auth-user.interface';
export declare class FarmController {
    private readonly farmService;
    constructor(farmService: FarmService);
    findAll(user: AuthUser): Promise<{
        userId: string;
        name: string;
        id: string;
        address: string | null;
        latitude: number | null;
        longitude: number | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(dto: CreateFarmDto, user: AuthUser): Promise<{
        userId: string;
        name: string;
        id: string;
        address: string | null;
        latitude: number | null;
        longitude: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
