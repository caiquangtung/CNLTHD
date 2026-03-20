/**
 * Barrel file cho guards dùng chung (auth + role).
 *
 * Được import vào các module/domain (events, ticket-types, users,...)
 * để apply `@UseGuards(JwtAuthGuard, RolesGuard)` ở level controller.
 */
export { JwtAuthGuard } from './jwt-auth.guard';
export { RolesGuard } from './roles.guard';
