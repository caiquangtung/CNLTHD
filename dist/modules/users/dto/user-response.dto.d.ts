import { UserRole } from '../entities/user.entity';
export declare class UserResponseDto {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    passwordHash: string;
    profileData: Record<string, any>;
}
