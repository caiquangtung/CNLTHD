import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import type { Event } from '../../events/entities/event.entity';

export enum UserRole {
  ADMIN = 'admin',
  ORGANIZER = 'organizer',
  USER = 'user',
}

@Entity('users')
export class User extends BaseEntity {
  @Index('idx_users_email')
  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'refresh_token_hash', nullable: true })
  refreshTokenHash: string | null;

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

  @OneToMany('Event', (event: Event) => event.organizer)
  createdEvents: Event[];
}
