import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/users/entities/user.entity';

/**
 * Decorator `@Roles(...)` cấu hình role required cho route.
 *
 * Được `RolesGuard` (common/guards) đọc qua metadata `ROLES_KEY`
 * để chặn/cho phép các action như tạo/sửa/xóa event, ticket-type,...
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
