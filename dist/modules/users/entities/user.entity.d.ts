import { BaseEntity } from '../../../common/entities';
export declare enum UserRole {
    ADMIN = "admin",
    ORGANIZER = "organizer",
    USER = "user"
}
export declare class User extends BaseEntity {
    email: string;
    passwordHash: string;
    fullName: string;
    profileData: Record<string, any>;
    role: UserRole;
}
