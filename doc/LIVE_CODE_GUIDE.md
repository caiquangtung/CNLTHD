# LIVE CODE GUIDE (NestJS Source)

Tài liệu này giúp bạn có thể “live code” bất kỳ đoạn nào trong source NestJS của dự án này theo đúng pattern đang dùng.

## 1) Tư duy khi live code

Bạn luôn đi qua 2 câu hỏi:

1. Thay đổi này thuộc “layer” nào?
   - `common/` (cross-cutting): decorator/guard/interceptor/filter/entity-base/contract response
   - `modules/<domain>/` (business): controller/service/entity/dto/mapper/module wiring
   - `src/app.module.ts` hoặc `src/main.ts` (global config)
2. Thay đổi này ảnh hưởng “hợp đồng” nào?
   - response format (`ApiResponse`)
   - auth/roles (JWT + metadata)
   - schema DB (TypeORM entity + migration)

## 2) Chạy dự án & config nhanh

### 2.1 Cấu hình môi trường

- Copy từ `.env.example` sang `.env`
- Các biến quan trọng:
  - `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
  - `JWT_SECRET`, `JWT_EXPIRES_IN`
  - `CORS_ORIGIN`
  - `API_DOCS_ENABLED`, `API_DOCS_PATH`
  - `PAYMENT_TIMEOUT`

### 2.2 Start

- Dev: `npm run start:dev`
- Prod: `npm run build && npm run start:prod`
- Build: `npm run build`

### 2.3 Migrations (TypeORM)

Các script trong `package.json`:

- Generate: `npm run migration:generate`
- Run: `npm run migration:run`
- Revert: `npm run migration:revert`
- Show: `npm run migration:show`

Workflow chuẩn khi thay đổi DB:

1. Sửa `*.entity.ts` (thêm/cập nhật column, relation, enum, index…)
2. Generate migration
3. Run migration
4. Live-code tiếp controller/service/mapper (nếu API cần phản ánh field mới)

## 3) Chuẩn request/response toàn hệ thống

### 3.1 `main.ts`: global pipeline

`src/main.ts` cấu hình:

- `app.setGlobalPrefix('api')`
- `ValidationPipe` global:
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
  - `transform: true` (+ `enableImplicitConversion`)
- `TransformResponseInterceptor` global: bọc mọi response success vào `ApiResponse<T>`
- Global exception filters:
  - `AllExceptionsFilter` (catch tất cả lỗi không phải HttpException)
  - `HttpExceptionFilter` (catch HttpException)

### 3.2 Contract response: `ApiResponse<T>`

Interface ở `src/common/interfaces/api-response.interface.ts`:

- `success: boolean`
- `data: T | null`
- `message: string | null`
- `statusCode: number`
- `timestamp: string`
- `path: string`

`TransformResponseInterceptor` sẽ:

- set `success: true`
- `data` = payload controller trả về (hoặc `null` nếu falsy)
- format mọi `Date` trong payload sang timezone `Asia/Ho_Chi_Minh (+07:00)`

Lưu ý khi live code:

- Nếu controller chỉ `return dto/entity` bình thường: interceptor sẽ bọc `ApiResponse`.
- Nếu controller dùng `@Res()` và `return void` (ví dụ endpoints callback/redirect payment): interceptor có thể KHÔNG bọc `ApiResponse` (vì bạn tự điều khiển response).

## 4) Auth & RBAC theo dự án này

### 4.1 `JwtStrategy` tạo `request.user`

`src/modules/auth/strategies/jwt.strategy.ts`:

- JWT lấy từ header `Authorization: Bearer <token>`
- `validate(payload)`:
  - fetch user từ `UsersService` theo `payload.sub`
  - trả về object gắn vào `request.user`:
    - `id`, `email`, `role`

### 4.2 `JwtAuthGuard` (bật/tắt theo `@Public()`)

`src/common/guards/jwt-auth.guard.ts`:

- kế thừa `AuthGuard('jwt')`
- trong `canActivate`:
  - đọc metadata `IS_PUBLIC_KEY` từ route/class
  - nếu có `@Public()` thì `return true` (không cần JWT)
  - ngược lại thì chạy auth guard của Passport

### 4.3 `RolesGuard` dùng `@Roles(...)`

`src/common/guards/roles.guard.ts`:

- đọc metadata `ROLES_KEY` do `@Roles(...)` set
- nếu không set roles => cho qua
- nếu set roles => yêu cầu `request.user.role` nằm trong danh sách roles
- nếu không đủ => throw `ForbiddenException('Insufficient permissions')`

### 4.4 `@CurrentUser()` lấy user từ `request.user`

`src/common/decorators/current-user.decorator.ts`:

- `@CurrentUser()` trả về toàn bộ `request.user`
- `@CurrentUser('id')` trả về trường `id` (tương tự cho `role`, `email`…)

### 4.5 Apply guard đúng “chỗ”

Pattern trong controller:

- `@Controller('events')`
- `@UseGuards(JwtAuthGuard, RolesGuard)` ở cấp controller
- route công khai dùng `@Public()`
- route nhạy dùng `@Roles(UserRole.ADMIN, UserRole.ORGANIZER)`

Enum roles nằm ở `src/modules/users/entities/user.entity.ts`:

- `UserRole.ADMIN = 'admin'`
- `UserRole.ORGANIZER = 'organizer'`
- `UserRole.USER = 'user'`

## 5) Pattern Business Module: Controller / Service / Entity / DTO / Mapper / Module

Trong các module domain (vd `events`, `ticket-types`, `orders`, `payments`), bạn live-code theo layout sau.

### 5.1 `entities/`: TypeORM + BaseEntity + soft delete

`src/common/entities/base.entity.ts`:

- `id: uuid`
- `createdAt`, `updatedAt`
- `deletedAt` dùng `@DeleteDateColumn({ name: 'deleted_at', nullable: true })`

Chỉ cần follow:

- entity nghiệp vụ `extends BaseEntity`
- soft delete: service dùng `repo.softRemove()`
- restore: service dùng `repo.restore(id)` sau khi query có `withDeleted: true`

### 5.2 `dto/`: input validation & output DTO

Input:

- `CreateXxxDto` dùng `class-validator` (`IsString`, `IsUUID`, `IsDateString`, …)
- `UpdateXxxDto` thường `extends PartialType(CreateXxxDto)` để update patch

Output:

- `XxxResponseDto` dùng `class-transformer`
- mapping dùng `plainToInstance(..., { excludeExtraneousValues: true })`
- để “lộ” field ra JSON: dùng `@Expose()`
- để “che” field: dùng `@Exclude()` (hoặc không `@Expose()` + `excludeExtraneousValues: true`)

### 5.3 `mappers/`: tách logic map DTO <-> Entity <-> Response DTO

Các hàm mapping nằm trong `mappers/<x>.mapper.ts`.

Pattern phổ biến:

- `mapCreateXxxDtoToEntity(dto, extraIds)`:
  - tạo `new Entity()`
  - gán field từ dto
  - convert kiểu (`startTime/endTime` => `new Date(...)`)
- `applyUpdateXxxDtoToEntity(entity, dto)`:
  - chỉ update khi `dto.field !== undefined`
- `mapXxxToResponseDto(entity)`:
  - `plainToInstance(ResponseDto, entity, { excludeExtraneousValues: true })`

### 5.4 `services/`: business logic + business exceptions

Trong service:

- inject repo: `@InjectRepository(Entity)` và dùng `Repository<Entity>`
- ném lỗi HTTP bằng `NotFoundException`, `BadRequestException`, `ConflictException`, `ForbiddenException`…
- luôn trả về Entity hoặc Response DTO đã map (tùy module)

Ví dụ pattern quan trọng:

- “ownership check” trong `EventsService.update/softRemove`:
  - nếu không phải `ADMIN` thì bắt buộc `event.organizerId === currentUser.id`
- “slug uniqueness” trong `EventsService.create` (throw ConflictException)

### 5.5 `controllers/`: chỉ orchestration

Controller thường làm:

- parse param/pipes: `@Param('id', ParseUUIDPipe)`
- nhận body DTO: `@Body() createDto/updateDto`
- lấy user: `@CurrentUser('id')`, `@CurrentUser()`
- gọi service
- map entity => response DTO

Controller KHÔNG nên:

- tự logic DB phức tạp
- tự định dạng response sang `ApiResponse` (global interceptor đã làm)

### 5.6 `*.module.ts`: wire DI và TypeORM

Module chuẩn:

- `imports: [TypeOrmModule.forFeature([Entity]), ...]`
- `controllers: [...]`
- `providers: [...]`
- `exports: [...]` nếu module khác cần service/provider

## 6) Soft delete workflow (BaseEntity)

Pattern đúng để live-code soft delete:

1. Listing deleted: dùng `repo.find({ withDeleted: true, ... })`
2. Restore: dùng `repo.findOne({ where: { id }, withDeleted: true })` để tìm được bản ghi đã xóa
3. Soft remove: dùng `repo.softRemove(entity)` (TypeORM tự set `deleted_at`)

Endpoint mẫu trong dự án:

- `GET /events/deleted`
- `PATCH /events/:id/restore`
- `GET /ticket-types/deleted`
- `PATCH /ticket-types/:id/restore`

## 7) Transaction & pessimistic locking (điểm “dễ bug”)

Trong dự án này, chỗ nhạy nhất là “inventory/tồn kho” khi tạo order/payment.

Các pattern đang dùng:

- `OrdersService.create(...)`:
  - dùng `this.dataSource.transaction(async (manager) => { ... })`
  - khi đọc `TicketType` để trừ số lượng:
    - dùng `lock: { mode: 'pessimistic_write' }`
    - đảm bảo race condition không xảy ra khi nhiều user mua cùng lúc
- `PaymentsService.completePayment(...)`:
  - dùng transaction
  - lock payment bằng query builder:
    - `setLock('pessimistic_write')` nhưng “không join” để tránh lỗi lock với nullable outer join
  - idempotency: chỉ update khi `payment.status === PENDING`

Khi bạn live-code phần liên quan tiền/tồn kho:

- luôn cân nhắc transaction boundary
- luôn cân nhắc lock mode và nơi lock

## 8) Scheduler jobs

`src/cron/order-cron.service.ts`:

- `@Cron(CronExpression.EVERY_MINUTE)`
- gọi `OrdersService.cancelExpiredOrders()`
- chức năng: tự động cancel `PENDING` quá hạn thanh toán

Nếu bạn thêm cron khác:

- tạo service trong `src/cron/` hoặc module scheduler tương tự
- đăng provider vào `AppModule` (vì cron cần Nest DI)

## 9) Checklist “live code bất kỳ đoạn”

### 9.1 Nếu bạn thêm endpoint mới

1. Xác định domain (events/ticket-types/orders/payments/users/auth/…)
2. Mở controller của domain đó và xem pattern:
   - route nào public => có `@Public()`
   - route nào cần RBAC => có `@Roles(...)`
3. Tạo DTO input nếu cần validation mới (`dto/`)
4. Nếu schema thay đổi => sửa entity + tạo migration
5. Viết mapper nếu response cần shape khác DB
6. Thêm method vào service
7. Wire lại module (nếu provider/service mới)
8. Test bằng Swagger hoặc gọi endpoint trực tiếp

### 9.2 Nếu bạn sửa logic DB (thay đổi field/cột/relationship)

1. Sửa entity trong `modules/<domain>/entities/*.entity.ts`
2. Generate migration
3. Run migration
4. Cập nhật mapper và Response DTO (nếu API cần field mới)
5. Kiểm tra mọi nơi đang dùng entity (service/query)

### 9.3 Nếu bạn sửa auth/roles

1. `JwtStrategy`: thay đổi payload/validate => kiểm tra lại `CurrentUser` và các controller dùng `@CurrentUser('id'|'role')`
2. `JwtAuthGuard`: chỉ ảnh hưởng “JWT required hay không”
3. `RolesGuard` và `@Roles`: ảnh hưởng “đủ role hay không”
4. Thêm role mới => cập nhật enum `UserRole` và migration/schema (nếu DB enum bị ràng buộc)

## 10) Cheat-sheet: bạn nên nhìn file nào trước?

- “Response format/exception format”: `src/common/interceptors/transform-response.interceptor.ts`, `src/common/filters/http-exception.filter.ts`, `src/common/interfaces/api-response.interface.ts`
- “Auth & RBAC”: `src/modules/auth/strategies/jwt.strategy.ts`, `src/common/guards/jwt-auth.guard.ts`, `src/common/guards/roles.guard.ts`, `src/common/decorators/public.decorator.ts`, `src/common/decorators/roles.decorator.ts`, `src/common/decorators/current-user.decorator.ts`
- “Entity + soft delete”: `src/common/entities/base.entity.ts`
- “Module wiring”: `src/modules/<domain>/<domain>.module.ts`
- “API endpoint”: `src/modules/<domain>/<domain>.controller.ts`
- “Business logic”: `src/modules/<domain>/<domain>.service.ts`
- “Input/output shape”: `src/modules/<domain>/dto/*.dto.ts`
- “DTO<->Entity mapping”: `src/modules/<domain>/mappers/*.mapper.ts`
- “Inventory/payment transaction”: `src/modules/orders/orders.service.ts`, `src/modules/payments/payments.service.ts`
- “Cron cleanup”: `src/cron/order-cron.service.ts`

