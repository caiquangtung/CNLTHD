import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User extends BaseEntity {
  @Index('idx_users_email')
  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ type: 'jsonb', default: {} })
  profileData: Record<string, any>;

  @Index('idx_users_role')
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;
}