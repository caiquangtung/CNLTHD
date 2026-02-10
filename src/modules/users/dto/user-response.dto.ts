import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '../entities/user.entity';

@Expose()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  fullName: string;

  @Expose()
  role: UserRole;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  passwordHash: string;

  @Exclude()
  profileData: Record<string, any>;

  @Exclude()
  deletedAt?: Date;
}
