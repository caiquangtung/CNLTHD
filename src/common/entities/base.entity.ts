import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

/**
 * Lớp cơ sở cho entity, hỗ trợ soft delete.
 * Tất cả entity nghiệp vụ nên kế thừa class này để hành vi thống nhất.
 *
 * Được dùng bởi các entity nghiệp vụ như Event, TicketType, User,...
 * để thống nhất các trường `id`, `createdAt`, `updatedAt`, `deletedAt`
 * giữa các module (events, ticket-types, users, ...).
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /** Cột dùng cho cơ chế soft delete, TypeORM sẽ tự ẩn bản ghi đã xóa. */
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
