# 📖 Giải Thích Chi Tiết Source Code - Event Booking System

> Tài liệu này giải thích toàn bộ source code của hệ thống đặt vé sự kiện (Event Booking System) với kiến trúc NestJS.
> Last Updated: April 2026

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Kiến Trúc Ứng Dụng](#kiến-trúc-ứng-dụng)
3. [Entry Points & Bootstrap](#entry-points--bootstrap)
4. [Hạ Tầng Chung (Common)](#hạ-tầng-chung-common)
5. [Authentication & Authorization](#authentication--authorization)
6. [Các Module Chính](#các-module-chính)
7. [Lớp Database](#lớp-database)
8. [Luồng Dữ Liệu & Tương Tác](#luồng-dữ-liệu--tương-tác)
9. [Công Nghệ & Patterns](#công-nghệ--patterns)
10. [Bảo Mật](#bảo-mật)
11. [Tối Ưu Hóa Hiệu Năng](#tối-ưu-hóa-hiệu-năng)

---

## 🎯 Tổng Quan

### **Dự Án Là Gì?**

Đây là một **hệ thống đặt vé sự kiện trực tuyến** được xây dựng bằng **NestJS** (Node.js framework). Hệ thống cho phép:

- **Người dùng** xem danh sách sự kiện, mua vé, theo dõi đơn hàng
- **Tổ chức viên** tạo sự kiện, quản lý vé, xem doanh thu
- **Quản trị viên** quản lý toàn bộ hệ thống

### **Các Tính Năng Chính**

✅ Xác thực người dùng (JWT tokens)  
✅ Quản lý sự kiện và loại vé  
✅ Hệ thống đặt vé với khóa inventory  
✅ Thanh toán (hỗ trợ tiền mặt và chuyển khoản)  
✅ Tạo mã QR cho vé  
✅ Tự động hủy đơn hàng hết hạn (cron job)  
✅ Xóa mềm dữ liệu (không mất dữ liệu)

---

## 🏗️ Kiến Trúc Ứng Dụng

### **Cấu Trúc Thư Mục**

```
src/
├── main.ts                          # Khởi động ứng dụng
├── app.module.ts                    # Module gốc (root module)
├── app.controller.ts                # Controller gốc (health check)
├── app.service.ts                   # Service gốc
├── common/                          # Hạ tầng chung
│   ├── decorators/                  # @CurrentUser, @Public, @Roles
│   ├── guards/                      # JwtAuthGuard, RolesGuard
│   ├── interceptors/                # TransformResponseInterceptor
│   ├── filters/                     # HttpExceptionFilter
│   ├── entities/                    # BaseEntity
│   └── interfaces/                  # ApiResponse, PaginatedResponse
├── config/                          # Cấu hình
│   ├── configuration.ts             # Load biến môi trường (.env)
│   └── database.config.ts           # Cấu hình PostgreSQL & TypeORM
├── database/                        # Lớp dữ liệu
│   ├── data-source.ts               # Kết nối database
│   ├── database.module.ts           # Module TypeORM
│   └── migrations/                  # Các phiên bản schema
├── modules/                         # Các module chính (business logic)
│   ├── auth/                        # Đăng ký, đăng nhập, refresh token
│   ├── users/                       # Quản lý người dùng
│   ├── events/                      # Quản lý sự kiện
│   ├── ticket-types/                # Quản lý loại vé
│   ├── orders/                      # Quản lý đơn hàng (checkout)
│   ├── payments/                    # Quản lý thanh toán
│   └── tickets/                     # Quản lý vé (QR, trạng thái)
└── cron/                            # Công việc định kỳ
    └── order-cron.service.ts        # Tự động hủy đơn hàng hết hạn
```

### **Mô Hình Kiến Trúc**

```
┌────────────────────────────────────────────────────────────┐
│                      Client (Web/Mobile)                   │
└────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────┐
│              NestJS Application (main.ts)                  │
│  ├─ Validation Pipe (Whitelist, Transform)                 │
│  ├─ Response Transformer (Global Interceptor)              │
│  ├─ Exception Filter (HTTP + Catch-all)                    │
│  └─ Swagger Documentation                                  │
└────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────┐
│                    Controllers                              │
│  auth | users | events | tickets | orders | payments      │
└────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────┐
│              Services (Business Logic)                      │
│  Auth | Users | Events | Tickets | Orders | Payments      │
└────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────┐
│            TypeORM Repository Pattern                       │
│         Database Access & Transactions                      │
└────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────┐
│   PostgreSQL Database (Asia/Ho_Chi_Minh Timezone)          │
└────────────────────────────────────────────────────────────┘
```

---

## 🚀 Entry Points & Bootstrap

### **main.ts - Khởi Động Ứng Dụng**

**Nhiệm vụ**: Cấu hình và khởi động server NestJS

```typescript
// Tạo instance ứng dụng NestJS
const app = await NestFactory.create(AppModule);

// 1. Validation Pipe
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Chỉ chấp nhận fields định nghĩa trong DTO
    transform: true, // Tự động convert type (string → number)
    forbidNonWhitelisted: true, // Throw error nếu có fields không mong muốn
  }),
);

// 2. Global Interceptor - Transform response
app.useGlobalInterceptors(new TransformResponseInterceptor());

// 3. Exception Filters - Xử lý lỗi
app.useGlobalFilters(new HttpExceptionFilter());
app.useGlobalFilters(new AllExceptionsFilter());

// 4. CORS & Prefix
app.enableCors();
app.setGlobalPrefix('api'); // Tất cả routes bắt đầu bằng /api

// 5. Swagger (nếu không phải production)
if (process.env.NODE_ENV !== 'production') {
  const config = new DocumentBuilder()
    .setTitle('Event Booking System')
    .setDescription('API for event booking')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}

// Khởi động server
await app.listen(3000, '0.0.0.0');
```

**Cách Hoạt Động**:

1. Tạo ứng dụng với `app.module.ts`
2. Cấu hình validation cho tất cả request DTOs
3. Áp dụng Response Transformer cho tất cả responses
4. Thiết lập exception handlers toàn cục
5. Bật CORS và API prefix `/api`
6. Tạo Swagger docs nếu dev environment
7. Lắng nghe port 3000

---

### **app.module.ts - Module Gốc**

**Nhiệm vụ**: Cấu hình tất cả dependencies và modules

```typescript
@Module({
  imports: [
    // 1. Database Module (TypeORM)
    TypeOrmModule.forRoot(getDatabaseConfig()),

    // 2. Scheduling Module (Cho cron jobs)
    ScheduleModule.forRoot(),

    // 3. Config Module (Load .env)
    ConfigModule.forRoot({
      validationSchema: // Validate các env vars
      isGlobal: true,  // Có thể inject ở bất kỳ module nào
    }),

    // 4. Domain Modules
    UsersModule,
    AuthModule,
    EventsModule,
    TicketTypesModule,
    OrdersModule,
    PaymentsModule,
    TicketsModule,

    // 5. Cron/Scheduler Module
    OrderCronModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Cách Hoạt Động**:

- Trungloan tất cả modules từ `modules/` directory
- Khởi tạo database connection từ `getDatabaseConfig()`
- Bật scheduling service cho cron jobs
- Load environment variables từ `.env`

---

### **app.controller.ts & app.service.ts**

```typescript
// Controller - Health Check
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public() // Không cần authentication
  getHello(): string {
    return this.appService.getHello();
  }
}

// Service
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! Event Booking System is running...';
  }
}
```

**Mục đích**: Endpoint đơn giản để kiểm tra server có chạy hay không  
**Endpoint**: `GET /api` → Response: `"Hello World..."`

---

## 🔐 Hạ Tầng Chung (Common)

### **1. Decorators - Đánh Dấu & Trích Xuất Dữ Liệu**

#### **@CurrentUser(data?: string)** - Lấy Dữ Liệu User Hiện Tại

```typescript
// File: common/decorators/current-user.decorator.ts

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;  // Set bởi JwtAuthGuard

    // Nếu data = 'id', chỉ return ID
    // Nếu data = 'email', chỉ return email
    // Nếu không có data, return toàn bộ user object
    return data ? user?.[data] : user;
  }
);

// Cách sử dụng:
@Get('/my-orders')
getMyOrders(
  @CurrentUser('id') userId: string,  // Lấy user ID
  @CurrentUser() user: any,            // Lấy toàn bộ user object
) {
  return this.ordersService.findByUser(userId);
}
```

#### **@Public()** - Đánh Dấu Route Công Khai

```typescript
// File: common/decorators/public.decorator.ts

export const Public = () => SetMetadata('isPublic', true);

// Cách sử dụng:
@Get('/events')
@Public()  // Không cần JWT token
async getEvents() {
  return this.eventsService.findAll();  // Công khai cho tất cả
}
```

#### **@Roles(...roles: UserRole[])** - Yêu Cầu Vai Trò

```typescript
// File: common/decorators/roles.decorator.ts

export const Roles = (...roles: UserRole[]) =>
  SetMetadata('roles', roles);

// Cách sử dụng:
@Patch('/events/:id')
@Roles(UserRole.ADMIN, UserRole.ORGANIZER)  // Chỉ ADMIN hoặc ORGANIZER
async updateEvent(@Param('id') eventId: string) {
  // Chỉ users có role ADMIN hoặc ORGANIZER mới có thể gọi
}
```

---

### **2. Guards - Kiểm Tra Quyền Truy Cập**

#### **JwtAuthGuard - Xác Thực JWT Token**

```typescript
// File: common/guards/jwt-auth.guard.ts

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // Nếu route có @Public() decorator, skip authentication
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) {
      return true; // Cho phép không cần token
    }

    // Nếu không public, kiểm tra JWT token
    return super.canActivate(context);
  }
}

// Cách hoạt động:
// 1. Extract "Bearer <token>" từ header
// 2. Verify token signature
// 3. Validate token chưa hết hạn
// 4. Tìm user trong database (đảm bảo user còn tồn tại)
// 5. Attach user vào request.user
```

**JWT Token Payload**:

```json
{
  "sub": "uuid-123", // User ID
  "email": "user@example.com",
  "role": "USER",
  "iat": 1677721236, // Khi issue
  "exp": 1677807636 // Khi hết hạn (24 giờ sau)
}
```

#### **RolesGuard - Kiểm Tra Vai Trò Người Dùng**

```typescript
// File: common/guards/roles.guard.ts

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy roles yêu cầu từ @Roles() decorator
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );

    // Nếu không có @Roles() decorator, cho phép
    if (!requiredRoles) {
      return true;
    }

    // Lấy user từ request (set bởi JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    // Kiểm tra user có vai trò yêu cầu không
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập resource này'
      );
    }

    return true;
  }
}

// Cách sử dụng:
@Delete('/events/:id')
@Roles(UserRole.ADMIN)  // Chỉ ADMIN
async deleteEvent(@Param('id') id: string) {
  // RolesGuard kiểm tra user.role === ADMIN
  // Nếu không, throw ForbiddenException
}
```

**Flow Xác Thực & Phân Quyền**:

```
Request → JwtAuthGuard
         ├─ Có @Public()? → Skip
         └─ Không → Verify JWT & Attach user
         ↓
       RolesGuard (nếu có @Roles())
         ├─ Có @Roles()? → Check user.role
         └─ Không → Allow
         ↓
       Controller Handler
```

---

### **3. Interceptors - Transform Response**

```typescript
// File: common/interceptors/transform-response.interceptor.ts

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: context.switchToHttp().getResponse().statusCode,
        timestamp: DateFormatterHelper.getCurrentDatetimeString(),
        path: context.switchToHttp().getRequest().url,
        message: null,
        data: data,  // Response gốc
      })),
    );
  }
}

// Kết quả - Tất cả response được wrap:
{
  "success": true,
  "statusCode": 200,
  "timestamp": "2024-04-08T10:30:45.123Z",
  "path": "/api/events",
  "message": null,
  "data": {
    // Response thực tế
    "id": "123",
    "name": "Concert Event"
  }
}
```

---

### **4. Exception Filters - Xử Lý Lỗi**

```typescript
// File: common/filters/http-exception.filter.ts

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Flatten validation errors
    let message = exceptionResponse['message'];
    if (Array.isArray(message)) {
      message = message.join(', ');  // ["email required", "name required"]
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
      message: message,
      data: null,
    });
  }
}

// Ví dụ - Validation Error:
{
  "success": false,
  "statusCode": 400,
  "message": "email must be an email, password must be longer than or equal to 6 characters",
  "data": null
}
```

---

### **5. Base Entity - Lớp Cơ Sở Cho Tất Cả Entities**

```typescript
// File: common/entities/base.entity.ts

@Entity()
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string; // Unique identifier

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date; // Khi tạo

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date; // Cập nhật lần cuối

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date | null; // Xóa mềm (soft delete)
}

// Các entity khác kế thừa:
@Entity('users')
export class User extends BaseEntity {
  @Column()
  email: string;
  // ...
}

@Entity('events')
export class Event extends BaseEntity {
  @Column()
  name: string;
  // ...
}
```

**Soft Delete Hoạt Động Như Thế Nào**:

```typescript
// Xóa mềm - Không thực sự xóa
await repository.softRemove(user);
// Chỉ set deletedAt = current_timestamp, dữ liệu vẫn trong DB

// Query tự động filter deletedAt:
await repository.find(); // Chỉ trả về records có deletedAt = NULL
await repository.find({ withDeleted: true }); // Gồm deleted records

// Khôi phục
await repository.restore(user); // Set deletedAt = NULL
```

---

## 🔐 Authentication & Authorization

### **Flow Đăng Ký & Đăng Nhập**

```
1. Đăng Ký (Register)
   ├─ POST /api/auth/register
   ├─ Body: { email, password, fullName }
   └─ Service:
      ├─ Kiểm tra email chưa tồn tại
      ├─ Mã hóa password bằng bcrypt (10 rounds)
      ├─ Tạo User mới
      └─ Return: User object (không có password)

2. Đăng Nhập (Login)
   ├─ POST /api/auth/login
   ├─ Body: { email, password }
   └─ Service:
      ├─ Tìm user bằng email
      ├─ Kiểm tra password bằng bcrypt.compare()
      ├─ Tạo Access Token (24h - JWT_SECRET)
      ├─ Tạo Refresh Token (7d - JWT_REFRESH_SECRET)
      ├─ Lưu Refresh Token hash vào DB (để logout)
      └─ Return: { accessToken, refreshToken }

3. Refresh Token
   ├─ POST /api/auth/refresh
   ├─ Body: { refreshToken }
   └─ Service:
      ├─ Verify Refresh Token
      ├─ Kiểm tra hash trong DB (đảm bảo chưa được invalidate)
      ├─ Tạo cặp token mới (Access + Refresh)
      └─ Return: { accessToken, refreshToken }

4. Đăng Xuất (Logout)
   ├─ POST /api/auth/logout
   └─ Service:
      ├─ Xóa Refresh Token hash từ DB (invalidate)
      └─ Return: { message: "Logged out" }
```

### **Auth Module - Chi Tiết**

```typescript
// File: modules/auth/auth.service.ts

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 1. Đăng ký
  async register(dto: RegisterDto) {
    const { email, password, fullName } = dto;

    // Kiểm tra email chưa tồn tại
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Mã hóa password
    const passwordHash = await bcrypt.hash(password, 10);

    // Tạo user
    const user = new User();
    user.email = email;
    user.passwordHash = passwordHash;
    user.fullName = fullName;
    user.role = UserRole.USER; // Default role

    return this.usersService.save(user);
  }

  // 2. Đăng nhập
  async login(dto: LoginDto) {
    const { email, password } = dto;

    // Tìm user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Tạo tokens
    return this.generateTokens(user);
  }

  // Tạo cặp token
  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Access Token (24h)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '24h',
      secret: process.env.JWT_SECRET,
    });

    // Refresh Token (7d)
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    // Lưu Refresh Token hash vào DB
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshTokenHash(user.id, refreshTokenHash);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  // 3. Refresh
  async refresh(dto: RefreshDto) {
    const { refreshToken } = dto;

    try {
      // Verify token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // Tìm user
      const user = await this.usersService.findById(payload.sub);

      // Kiểm tra refresh token hash trong DB
      const isTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash,
      );
      if (!isTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Tạo tokens mới
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // 4. Logout
  async logout(userId: string) {
    // Xóa refresh token hash (invalidate token)
    await this.usersService.updateRefreshTokenHash(userId, null);
    return { message: 'Logged out successfully' };
  }
}
```

### **JWT Strategy - Passport Integration**

```typescript
// File: modules/auth/strategies/jwt.strategy.ts

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      // Lấy JWT_SECRET từ .env
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  // Validate token và attach user vào request
  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Attach user vào request object
    // Có thể access qua @CurrentUser() decorator
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
```

---

## 👥 Các Module Chính

### **1. Users Module - Quản Lý Người Dùng**

#### **User Entity**

```typescript
// File: modules/users/entities/user.entity.ts

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true, index: true })
  email: string; // Unique email

  @Column({ select: false }) // Không include mặc định khi query
  passwordHash: string; // Mã hóa bcrypt

  @Column({ nullable: true, select: false })
  refreshTokenHash: string | null; // Track refresh token for logout

  @Column()
  fullName: string;

  @Column({ type: 'jsonb', nullable: true })
  profileData: Record<string, any>; // JSONB cho dữ liệu bổ sung

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole; // ADMIN | ORGANIZER | USER

  @OneToMany(() => Event, (event) => event.organizer)
  createdEvents: Event[]; // Các sự kiện tổ chức viên tạo

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[]; // Các đơn hàng của user
}

// UserRole enum
enum UserRole {
  ADMIN = 'admin',
  ORGANIZER = 'organizer',
  USER = 'user',
}
```

#### **Users Service**

```typescript
// File: modules/users/users.service.ts

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Tạo user với password đã mã hóa (chỉ dùng từ Auth service)
  async createWithHashedPassword(
    email: string,
    passwordHash: string,
    fullName: string,
    role: UserRole = UserRole.USER,
  ): Promise<User> {
    const user = this.usersRepository.create({
      email,
      passwordHash,
      fullName,
      role,
    });
    return this.usersRepository.save(user);
  }

  // Tìm user bằng email
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'passwordHash', 'role', 'fullName'],
    });
  }

  // Tìm user bằng ID
  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  // Cập nhật refresh token hash
  async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.usersRepository.update({ id: userId }, { refreshTokenHash });
  }

  // Cập nhật thông tin user
  async update(id: string, dto: any): Promise<User> {
    await this.usersRepository.update({ id }, dto);
    return this.findById(id);
  }

  // Xóa mềm (soft delete)
  async softRemove(id: string): Promise<void> {
    await this.usersRepository.softDelete({ id });
  }

  // Khôi phục sau soft delete
  async restore(id: string): Promise<void> {
    await this.usersRepository.restore({ id });
  }

  // Lấy danh sách có phân trang
  async findAllPaged(
    page: number,
    limit: number,
  ): Promise<{
    items: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [items, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
```

#### **Users Controller**

```typescript
// File: modules/users/users.controller.ts

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Lấy thông tin user khác (chỉ ADMIN)
  @Get(':id')
  @Roles(UserRole.ADMIN)
  async getUser(@Param('id') userId: string) {
    return this.usersService.findById(userId);
  }

  // Danh sách users (chỉ ADMIN, có phân trang)
  @Get()
  @Roles(UserRole.ADMIN)
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.usersService.findAllPaged(page, limit);
  }

  // Cập nhật thông tin của chính mình
  @Patch(':id')
  async updateOwnProfile(
    @Param('id') userId: string,
    @CurrentUser('id') currentUserId: string,
    @Body() dto: UpdateUserDto,
  ) {
    // Chỉ được cập nhật chính mình hoặc là admin
    if (userId !== currentUserId) {
      throw new ForbiddenException('Cannot update other users');
    }

    return this.usersService.update(userId, dto);
  }

  // Xóa tài khoản (soft delete)
  @Delete(':id')
  async deleteAccount(
    @Param('id') userId: string,
    @CurrentUser('id') currentUserId: string,
  ) {
    if (userId !== currentUserId) {
      throw new ForbiddenException('Cannot delete other users');
    }

    await this.usersService.softRemove(userId);
    return { message: 'Account deleted' };
  }
}
```

---

### **2. Events Module - Quản Lý Sự Kiện**

#### **Event Entity**

```typescript
// File: modules/events/entities/event.entity.ts

@Entity('events')
export class Event extends BaseEntity {
  @Column({ unique: true, index: true })
  slug: string; // URL-friendly identifier (e.g., "concert-2024")

  @Column()
  name: string; // Tên sự kiện

  @Column({ type: 'text', nullable: true })
  description: string; // Mô tả chi tiết

  @Column()
  location: string; // Địa điểm

  @Column({ type: 'timestamp', index: true })
  startTime: Date; // Ngày bắt đầu

  @Column({ type: 'timestamp', index: true })
  endTime: Date; // Ngày kết thúc

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.DRAFT })
  status: EventStatus; // DRAFT | PUBLISHED | CANCELLED

  @Column({ nullable: true, index: true })
  organizerId: string | null; // Tổ chức viên (nullable nếu admin delete)

  @ManyToOne(() => User, (user) => user.createdEvents, {
    onDelete: 'SET NULL', // Nếu user xóa, set NULL
  })
  organizer: User;

  @OneToMany(() => TicketType, (ticketType) => ticketType.event)
  ticketTypes: TicketType[]; // Loại vé
}

enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
}
```

#### **Events Service**

```typescript
// File: modules/events/events.service.ts

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  // Tạo sự kiện
  async create(dto: CreateEventDto, organizerId?: string): Promise<Event> {
    // Kiểm tra slug chưa tồn tại
    const existingEvent = await this.eventsRepository.findOne({
      where: { slug: dto.slug },
      withDeleted: true, // Kiểm cả deleted events
    });

    if (existingEvent) {
      throw new ConflictException('Event slug already exists');
    }

    const event = this.eventsRepository.create({
      ...dto,
      organizerId, // Set người tổ chức
    });

    return this.eventsRepository.save(event);
  }

  // Lấy tất cả sự kiện (công khai, phân trang)
  async findAllPaged(
    page: number,
    limit: number,
    status?: EventStatus,
  ): Promise<PaginatedResponse<Event>> {
    const query = this.eventsRepository
      .createQueryBuilder('event')
      .where('event.deletedAt IS NULL'); // Loại deleted events

    if (status) {
      query.andWhere('event.status = :status', { status });
    }

    const [items, total] = await query
      .orderBy('event.startTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Tìm sự kiện bằng slug
  async findBySlug(slug: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { slug },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  // Tìm sự kiện của một tổ chức viên
  async findByOrganizer(organizerId: string): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { organizerId },
      order: { startTime: 'DESC' },
    });
  }

  // Cập nhật sự kiện
  async update(
    id: string,
    dto: any,
    userId?: string,
    userRole?: UserRole,
  ): Promise<Event> {
    const event = await this.findById(id);

    // Kiểm tra quyền: organizer của event hoặc admin
    if (userRole !== UserRole.ADMIN && event.organizerId !== userId) {
      throw new ForbiddenException(
        'Only organizer or admin can update this event',
      );
    }

    await this.eventsRepository.update({ id }, dto);
    return this.findById(id);
  }

  // Xóa mềm sự kiện
  async softRemove(id: string): Promise<void> {
    await this.eventsRepository.softDelete({ id });
  }

  // Khôi phục sự kiện
  async restore(id: string): Promise<void> {
    await this.eventsRepository.restore({ id });
  }

  // Internal: Tìm event theo ID
  private async findById(id: string): Promise<Event> {
    return this.eventsRepository.findOne({ where: { id } });
  }
}
```

#### **Events Controller**

```typescript
// File: modules/events/events.controller.ts

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  // Danh sách sự kiện (công khai)
  @Get()
  @Public()
  async getEvents(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: EventStatus,
  ) {
    return this.eventsService.findAllPaged(page, limit, status);
  }

  // Chi tiết sự kiện (công khai)
  @Get(':slug')
  @Public()
  async getEventBySlug(@Param('slug') slug: string) {
    return this.eventsService.findBySlug(slug);
  }

  // Sự kiện của tôi (chỉ organizer/admin)
  @Get('my-events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async getMyEvents(@CurrentUser('id') userId: string) {
    return this.eventsService.findByOrganizer(userId);
  }

  // Tạo sự kiện
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async createEvent(
    @Body() dto: CreateEventDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.eventsService.create(dto, userId);
  }

  // Cập nhật sự kiện
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateEvent(
    @Param('id') eventId: string,
    @Body() dto: any,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.eventsService.update(eventId, dto, userId, userRole);
  }

  // Xóa sự kiện
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteEvent(@Param('id') eventId: string) {
    await this.eventsService.softRemove(eventId);
    return { message: 'Event deleted' };
  }
}
```

---

### **3. Ticket-Types Module - Quản Lý Loại Vé**

#### **TicketType Entity**

```typescript
// File: modules/ticket-types/entities/ticket-type.entity.ts

@Entity('ticket_types')
export class TicketType extends BaseEntity {
  @Column({ index: true })
  eventId: string;

  @Column()
  name: string; // VIP, Regular, Student, etc.

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // Giá vé (e.g., 100.50)

  @Column({ type: 'integer' })
  quantity: number; // Số vé còn sẵn

  @Column({ type: 'integer', default: 10 })
  maxPerOrder: number; // Giới hạn vé per order

  @ManyToOne(() => Event, (event) => event.ticketTypes)
  event: Event;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.ticketType)
  orderItems: OrderItem[];

  @OneToMany(() => Ticket, (ticket) => ticket.ticketType)
  tickets: Ticket[];
}
```

#### **Ticket-Types Service**

```typescript
// File: modules/ticket-types/ticket-types.service.ts

@Injectable()
export class TicketTypesService {
  constructor(
    @InjectRepository(TicketType)
    private ticketTypesRepository: Repository<TicketType>,
  ) {}

  // Tạo loại vé
  async create(dto: CreateTicketTypeDto): Promise<TicketType> {
    // Kiểm tra tên loại vé chưa tồn tại cho sự kiện này
    const existing = await this.ticketTypesRepository.findOne({
      where: {
        eventId: dto.eventId,
        name: dto.name,
        deletedAt: IsNull(), // Chỉ check non-deleted
      },
    });

    if (existing) {
      throw new ConflictException('Ticket type already exists for this event');
    }

    const ticketType = this.ticketTypesRepository.create(dto);
    return this.ticketTypesRepository.save(ticketType);
  }

  // Lấy loại vé của sự kiện
  async findByEvent(eventId: string): Promise<TicketType[]> {
    return this.ticketTypesRepository.find({
      where: { eventId },
      order: { createdAt: 'ASC' },
    });
  }

  // Cập nhật loại vé
  async update(id: string, dto: any): Promise<TicketType> {
    if (dto.name) {
      const ticketType = await this.ticketTypesRepository.findOne({
        where: { id },
      });

      // Kiểm tra tên chưa tồn tại event này
      const existing = await this.ticketTypesRepository.findOne({
        where: {
          eventId: ticketType.eventId,
          name: dto.name,
          id: Not(id), // Loại bỏ record hiện tại
          deletedAt: IsNull(),
        },
      });

      if (existing) {
        throw new ConflictException('Ticket type name already exists');
      }
    }

    await this.ticketTypesRepository.update({ id }, dto);
    return this.ticketTypesRepository.findOne({ where: { id } });
  }

  // Xóa mềm
  async softRemove(id: string): Promise<void> {
    await this.ticketTypesRepository.softDelete({ id });
  }

  // Khôi phục
  async restore(id: string): Promise<void> {
    await this.ticketTypesRepository.restore({ id });
  }
}
```

---

### **4. Orders Module - Quản Lý Đơn Hàng (Checkout)**

#### **Order & OrderItem Entities**

```typescript
// File: modules/orders/entities/order.entity.ts

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ index: true })
  userId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number; // Tổng giá

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
    index: true,
  })
  status: OrderStatus; // PENDING | PAID | CANCELLED

  @Column({ type: 'timestamp' })
  paymentDeadline: Date; // Thời hạn thanh toán

  @Column({ type: 'text', nullable: true })
  cancelReason: string; // Lý do hủy (nếu hủy)

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  orderItems: OrderItem[];

  @OneToOne(() => Payment, (payment) => payment.order, { cascade: true })
  payment: Payment;

  @OneToMany(() => Ticket, (ticket) => ticket.order)
  tickets: Ticket[];
}

// OrderItem - Chi tiết từng loại vé trong order
@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Column({ index: true })
  orderId: string;

  @Column()
  ticketTypeId: string;

  @Column({ type: 'integer' })
  quantity: number; // Số lượng vé đặt

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number; // Giá khi đặt (capture price)

  @ManyToOne(() => Order, (order) => order.orderItems)
  order: Order;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.orderItems)
  ticketType: TicketType;
}

enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}
```

#### **Orders Service - Phần Phức Tạp Nhất**

```typescript
// File: modules/orders/orders.service.ts

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(TicketType)
    private ticketTypesRepository: Repository<TicketType>,
  ) {}

  // Tạo đơn hàng (Checkout) - MỸ NHÂN QUY
  async create(dto: CreateOrderDto, userId: string): Promise<Order | null> {
    // ==========================================
    // TẤT CẢ TRONG MỘT TRANSACTION
    // ==========================================
    const order = await this.ordersRepository.manager.transaction(
      async (entityManager) => {
        // BẠO VỆ 1: Kiểm tra pending orders
        const pendingOrdersCount = await entityManager
          .createQueryBuilder(Order, 'order')
          .where('order.userId = :userId', { userId })
          .where('order.status = :status', { status: OrderStatus.PENDING })
          .getCount();

        if (pendingOrdersCount >= 2) {
          throw new BadRequestException('Max 2 pending orders at a time');
        }

        // BẠO VỆ 2: Kiểm tra duplicate items
        const itemIds = dto.items.map((item) => item.ticketTypeId);
        if (new Set(itemIds).size !== itemIds.length) {
          throw new BadRequestException('Duplicate ticket types in order');
        }

        let totalAmount = 0;
        const orderItems: OrderItem[] = [];

        // BẠO VỆ 3: Lock & decrement inventory
        for (const item of dto.items) {
          // PESSIMISTIC_WRITE lock - race condition protection
          const ticketType = await entityManager
            .createQueryBuilder(TicketType, 'ticketType')
            .where('ticketType.id = :id', { id: item.ticketTypeId })
            .setLock('pessimistic_write') // LOCK ĐỨA
            .getOne();

          if (!ticketType) {
            throw new NotFoundException(
              `Ticket type ${item.ticketTypeId} not found`,
            );
          }

          // Kiểm tra số lượng
          if (item.quantity > ticketType.quantity) {
            throw new BadRequestException(
              `Not enough tickets for ${ticketType.name}`,
            );
          }

          // Kiểm tra max per order
          if (item.quantity > ticketType.maxPerOrder) {
            throw new BadRequestException(
              `Max ${ticketType.maxPerOrder} tickets per order`,
            );
          }

          // Giảm inventory
          ticketType.quantity -= item.quantity;
          await entityManager.save(TicketType, ticketType);

          // Tính tổng tiền
          totalAmount += ticketType.price * item.quantity;

          // Tạo order item
          const orderItem = new OrderItem();
          orderItem.ticketTypeId = item.ticketTypeId;
          orderItem.quantity = item.quantity;
          orderItem.unitPrice = ticketType.price; // Capture price
          orderItems.push(orderItem);
        }

        // Tạo order
        const newOrder = new Order();
        newOrder.userId = userId;
        newOrder.totalAmount = totalAmount;
        newOrder.paymentDeadline = new Date(
          Date.now() + 5 * 60 * 1000, // 5 phút từ giờ
        );
        newOrder.orderItems = orderItems;

        // Tạo payment
        const payment = new Payment();
        payment.amount = totalAmount;
        payment.paymentMethod = dto.paymentMethod;
        payment.status = PaymentStatus.PENDING;

        // Nếu thanh toán tiền mặt, đặt thành SUCCESS ngay
        if (dto.paymentMethod === PaymentMethod.CASH) {
          payment.status = PaymentStatus.SUCCESS;
          newOrder.status = OrderStatus.PAID;
        }

        newOrder.payment = payment;

        // Save - Tất cả cascade
        return entityManager.save(Order, newOrder);
      },
    );

    return order;
  }

  // Hủy đơn hàng
  async cancelOrder(
    orderId: string,
    userId: string,
    cancelReason?: string,
  ): Promise<void> {
    // TRANSACTION - hoàn vé
    await this.ordersRepository.manager.transaction(async (entityManager) => {
      const order = await entityManager
        .createQueryBuilder(Order, 'order')
        .setLock('pessimistic_write')
        .where('order.id = :id', { id: orderId })
        .getOne();

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.userId !== userId) {
        throw new ForbiddenException('Can only cancel own orders');
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException('Can only cancel pending orders');
      }

      // Khôi phục inventory
      for (const item of order.orderItems) {
        const ticketType = await entityManager.findOne(TicketType, {
          where: { id: item.ticketTypeId },
        });
        ticketType.quantity += item.quantity;
        await entityManager.save(TicketType, ticketType);
      }

      // Cập nhật order
      order.status = OrderStatus.CANCELLED;
      order.cancelReason = cancelReason;
      await entityManager.save(Order, order);
    });
  }

  // CRON Job - Hủy đơn hàng hết hạn
  async cancelExpiredOrders(): Promise<void> {
    const now = new Date();

    const expiredOrders = await this.ordersRepository.find({
      where: {
        status: OrderStatus.PENDING,
        paymentDeadline: LessThan(now),
      },
    });

    for (const order of expiredOrders) {
      await this.cancelOrder(
        order.id,
        order.userId,
        'Auto-cancelled - payment deadline expired',
      );
    }
  }

  // Lấy đơn hàng của user
  async findByUserId(userId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { userId },
      relations: ['orderItems', 'payment'],
      order: { createdAt: 'DESC' },
    });
  }

  // Danh sách tất cả (admin)
  async findAll(page: number, limit: number) {
    const [items, total] = await this.ordersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user', 'orderItems'],
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
```

#### **Orders Controller**

```typescript
// File: modules/orders/orders.controller.ts

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // Tạo đơn hàng
  @Post()
  async createOrder(
    @Body() dto: CreateOrderDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.create(dto, userId);
  }

  // Đơn hàng của tôi
  @Get('my-orders')
  async getMyOrders(@CurrentUser('id') userId: string) {
    return this.ordersService.findByUserId(userId);
  }

  // Tất cả đơn hàng (admin)
  @Get()
  @Roles(UserRole.ADMIN)
  async getAllOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.ordersService.findAll(page, limit);
  }

  // Chi tiết đơn hàng (admin)
  @Get(':id')
  @Roles(UserRole.ADMIN)
  async getOrder(@Param('id') orderId: string) {
    return this.ordersService.findById(orderId);
  }

  // Hủy đơn hàng
  @Patch(':id/cancel')
  async cancelOrder(
    @Param('id') orderId: string,
    @CurrentUser('id') userId: string,
    @Body('cancelReason') cancelReason?: string,
  ) {
    await this.ordersService.cancelOrder(orderId, userId, cancelReason);
    return { message: 'Order cancelled' };
  }
}
```

---

### **5. Payments Module - Quản Lý Thanh Toán**

#### **Payment Entity**

```typescript
// File: modules/payments/entities/payment.entity.ts

@Entity('payments')
export class Payment extends BaseEntity {
  @Column({ unique: true, index: true })
  orderId: string; // Unique - 1 order có 1 payment

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod; // BANK_TRANSFER | CASH

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus; // PENDING | SUCCESS | FAILED | CANCELLED | EXPIRED | REFUNDED

  @Column({ nullable: true })
  transactionId: string; // Mã giao dịch (transfer)

  @Column({ nullable: true, type: 'timestamp' })
  paymentTime: Date; // Thời gian thanh toán

  @OneToOne(() => Order, (order) => order.payment)
  order: Order;
}

enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
}

enum PaymentStatus {
  PENDING = 'pending', // Chờ thanh toán
  SUCCESS = 'success', // Thành công
  FAILED = 'failed', // Thất bại
  CANCELLED = 'cancelled', // Bị hủy
  EXPIRED = 'expired', // Hết hạn
  REFUNDED = 'refunded', // Hoàn tiền
}
```

#### **Payments Service**

```typescript
// File: modules/payments/payments.service.ts

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  // Hoàn tất thanh toán (xác nhận transfer)
  async completePayment(
    paymentId: string,
    dto: CompletePaymentDto,
    userId: string,
  ): Promise<Payment> {
    // TRANSACTION - Đảm bảo atomicity
    const payment = await this.paymentsRepository.manager.transaction(
      async (entityManager) => {
        // Lock payment
        const payment = await entityManager
          .createQueryBuilder(Payment, 'payment')
          .where('payment.id = :id', { id: paymentId })
          .setLock('pessimistic_write')
          .getOne();

        if (!payment) {
          throw new NotFoundException('Payment not found');
        }

        // Kiểm tra quyền ownership
        const order = await entityManager.findOne(Order, {
          where: { id: payment.orderId },
        });

        if (order.userId !== userId) {
          throw new ForbiddenException("Cannot complete other users' payment");
        }

        // Kiểm tra thời hạn
        if (new Date() > order.paymentDeadline) {
          throw new BadRequestException('Payment deadline has passed');
        }

        // Kiểm tra status
        if (payment.status !== PaymentStatus.PENDING) {
          throw new BadRequestException('Payment is not pending');
        }

        // Cập nhật payment
        payment.status = PaymentStatus.SUCCESS;
        payment.paymentTime = new Date();
        payment.transactionId = dto.transactionId;

        // Cập nhật order
        order.status = OrderStatus.PAID;

        await entityManager.save(Payment, payment);
        await entityManager.save(Order, order);

        return payment;
      },
    );

    return payment;
  }

  // Tìm payment
  async findById(id: string): Promise<Payment> {
    return this.paymentsRepository.findOne({ where: { id } });
  }

  async findByOrderId(orderId: string): Promise<Payment> {
    return this.paymentsRepository.findOne({
      where: { orderId },
    });
  }
}
```

#### **Payments Controller**

```typescript
// File: modules/payments/payments.controller.ts

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // Chi tiết payment (admin)
  @Get(':id')
  @Roles(UserRole.ADMIN)
  async getPayment(@Param('id') paymentId: string) {
    return this.paymentsService.findById(paymentId);
  }

  // Lấy payment của order
  @Get('/order/:orderId')
  async getPaymentByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrderId(orderId);
  }

  // Hoàn tất thanh toán (xác nhận transfer)
  @Patch(':id/complete')
  async completePayment(
    @Param('id') paymentId: string,
    @Body() dto: CompletePaymentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentsService.completePayment(paymentId, dto, userId);
  }
}
```

---

### **6. Tickets Module - Quản Lý Vé**

#### **Ticket Entity**

```typescript
// File: modules/tickets/entities/ticket.entity.ts

@Entity('tickets')
export class Ticket extends BaseEntity {
  @Column({ index: true })
  orderId: string;

  @Column()
  ticketTypeId: string;

  @Column({ unique: true, index: true })
  ticketCode: string; // Mã vé độc nhất (e.g., EVNT-2024-001)

  @Column({ type: 'text' })
  qrData: string; // Dữ liệu QR code (JSON string)

  @Column({ type: 'enum', enum: TicketStatus })
  status: TicketStatus; // ACTIVE | USED | CANCELLED

  @ManyToOne(() => Order, (order) => order.tickets)
  order: Order;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.tickets)
  ticketType: TicketType;
}

enum TicketStatus {
  ACTIVE = 'active', // Chưa dùng
  USED = 'used', // Đã quét
  CANCELLED = 'cancelled', // Bị hủy
}
```

#### **Tickets Service**

```typescript
// File: modules/tickets/tickets.service.ts

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  // Tạo vé
  async create(dto: CreateTicketDto): Promise<Ticket> {
    // Generate mã vé độc nhất
    const ticketCode = this.generateTicketCode();

    // Tạo QR data
    const qrData = JSON.stringify({
      ticketCode,
      eventId: dto.eventId,
      ticketTypeId: dto.ticketTypeId,
      orderId: dto.orderId,
    });

    const ticket = this.ticketsRepository.create({
      ...dto,
      ticketCode,
      qrData,
      status: TicketStatus.ACTIVE,
    });

    return this.ticketsRepository.save(ticket);
  }

  // Generate ticket code
  private generateTicketCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8);
    return `TICKET-${timestamp}-${random}`;
  }

  // Tìm vé theo code
  async findByCode(ticketCode: string): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { ticketCode },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  // Tạo QR code image
  async generateQrBase64(ticketCode: string): Promise<string> {
    const qrCode = await QRCode.toDataURL(ticketCode);
    return qrCode; // Data URL (base64)
  }

  // Đánh dấu vé đã dùng (tại cổng entry)
  async markAsUsed(ticketCode: string): Promise<Ticket> {
    const ticket = await this.findByCode(ticketCode);

    // State machine - không thể dùng lại
    if (ticket.status === TicketStatus.USED) {
      throw new BadRequestException('Ticket already used');
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      throw new BadRequestException('Ticket is cancelled');
    }

    ticket.status = TicketStatus.USED;
    return this.ticketsRepository.save(ticket);
  }

  // Hủy vé
  async markAsCancelled(ticketCode: string): Promise<Ticket> {
    const ticket = await this.findByCode(ticketCode);

    if (ticket.status === TicketStatus.USED) {
      throw new BadRequestException('Cannot cancel used ticket');
    }

    ticket.status = TicketStatus.CANCELLED;
    return this.ticketsRepository.save(ticket);
  }

  // Lấy vé của order
  async findByOrder(orderId: string): Promise<Ticket[]> {
    return this.ticketsRepository.find({
      where: { orderId },
    });
  }

  // Xóa mềm
  async softRemove(id: string): Promise<void> {
    await this.ticketsRepository.softDelete({ id });
  }

  // Khôi phục
  async restore(id: string): Promise<void> {
    await this.ticketsRepository.restore({ id });
  }
}
```

#### **Tickets Controller**

```typescript
// File: modules/tickets/tickets.controller.ts

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  // Chi tiết vé
  @Get(':id')
  async getTicket(@Param('id') ticketId: string) {
    return this.ticketsService.findById(ticketId);
  }

  // Tìm vé theo code
  @Get('/code/:ticketCode')
  @Public()
  async getTicketByCode(@Param('ticketCode') ticketCode: string) {
    return this.ticketsService.findByCode(ticketCode);
  }

  // Lấy QR code
  @Get(':id/qr')
  async getTicketQr(@Param('id') ticketId: string) {
    const ticket = await this.ticketsService.findById(ticketId);
    const qrBase64 = await this.ticketsService.generateQrBase64(
      ticket.ticketCode,
    );
    return { qrImage: qrBase64 };
  }

  // Vé của order
  @Get('/order/:orderId')
  async getTicketsByOrder(@Param('orderId') orderId: string) {
    return this.ticketsService.findByOrder(orderId);
  }

  // Tạo vé (admin)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async createTicket(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto);
  }

  // Đánh dấu vé đã dùng (cổng check-in)
  @Patch(':id/use')
  async useTicket(@Param('id') ticketId: string) {
    return this.ticketsService.markAsUsed(ticketId);
  }

  // Hủy vé
  @Patch(':id/cancel')
  async cancelTicket(@Param('id') ticketId: string) {
    return this.ticketsService.markAsCancelled(ticketId);
  }

  // Xóa vé
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteTicket(@Param('id') ticketId: string) {
    await this.ticketsService.softRemove(ticketId);
    return { message: 'Ticket deleted' };
  }
}
```

---

## 💾 Lớp Database

### **Database Config**

```typescript
// File: config/database.config.ts

export function getDatabaseConfig(): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,

    // Connection pooling
    maxQueryExecutionTime: 1000, // Log queries > 1s
    extra: {
      min: 5, // Min connections
      max: 20, // Max connections
      idleTimeoutMillis: 30000,
    },

    // TypeORM config
    synchronize: false, // Use migrations
    logging: process.env.NODE_ENV === 'development',
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/database/migrations/*.ts'],
    timezone: '+07:00', // Asia/Ho_Chi_Minh
  };
}
```

### **Database Schema - Tổng Quan Quan Hệ**

```
users (người dùng)
├── id (UUID, PK)
├── email (UNIQUE, INDEX)
├── passwordHash
├── refreshTokenHash (nullable)
├── fullName
├── role (ADMIN | ORGANIZER | USER)
└── timestamps

events (sự kiện)
├── id (UUID, PK)
├── slug (UNIQUE, INDEX)
├── name, description, location
├── startTime, endTime (INDEX)
├── status (DRAFT | PUBLISHED | CANCELLED)
├── organizerId (FK → users, onDelete: SET NULL)
└── timestamps

ticket_types (loại vé)
├── id (UUID, PK)
├── eventId (INDEX, FK → events)
├── name, description
├── price, quantity, maxPerOrder
└── timestamps

orders (đơn hàng)
├── id (UUID, PK)
├── userId (INDEX, FK → users)
├── totalAmount
├── status (PENDING | PAID | CANCELLED, INDEX)
├── paymentDeadline
├── cancelReason
└── timestamps

order_items (chi tiết đơn hàng)
├── id (UUID, PK)
├── orderId (FK → orders)
├── ticketTypeId (FK → ticket_types)
├── quantity
├── unitPrice (capture at order time)
└── timestamps

payments (thanh toán)
├── id (UUID, PK)
├── orderId (UNIQUE, INDEX, FK → orders)
├── amount
├── paymentMethod (BANK_TRANSFER | CASH)
├── status (PENDING | SUCCESS | FAILED | CANCELLED | EXPIRED | REFUNDED)
├── transactionId
├── paymentTime
└── timestamps

tickets (vé)
├── id (UUID, PK)
├── orderId (INDEX, FK → orders)
├── ticketTypeId (FK → ticket_types)
├── ticketCode (UNIQUE, INDEX)
├── qrData
├── status (ACTIVE | USED | CANCELLED)
└── timestamps
```

---

## 🔄 Luồng Dữ Liệu & Tương Tác

### **Luồng Đặt Vé Đầy Đủ (Full Checkout Flow)**

```
┌─────────────────────────────────────────────────────────────┐
│ USER - Muốn mua vé cho sự kiện                              │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ 1. Xem danh sách sự kiện                                     │
│    GET /api/events?page=1&limit=10                          │
│    Response: { success: true, data: [ events... ] }         │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Xem chi tiết sự kiện                                     │
│    GET /api/events/concert-2024 (by slug)                   │
│    Response: Event object + ticketTypes array               │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Chọn loại vé & số lượng, tạo đơn hàng (CHECKOUT)        │
│    POST /api/orders                                          │
│    Body: {                                                   │
│      "items": [                                              │
│        { "ticketTypeId": "abc-123", "quantity": 2 },        │
│        { "ticketTypeId": "def-456", "quantity": 1 }         │
│      ],                                                      │
│      "paymentMethod": "bank_transfer"                        │
│    }                                                         │
│                                                              │
│    ⚙️ Backend xử lý:                                         │
│    ├─ START TRANSACTION                                      │
│    ├─ Kiểm tra ≤ 2 pending orders của user                  │
│    ├─ LOCK ticket types (pessimistic write)                 │
│    ├─ Kiểm tra số lượng vé + max per order                  │
│    ├─ Giảm inventory                                         │
│    ├─ Tính tổng tiền                                        │
│    ├─ Tạo Order + OrderItems + Payment (cascade)            │
│    ├─ COMMIT TRANSACTION                                    │
│    └─ Response: Order object                                │
│                                                              │
│    💾 Database thay đổi:                                    │
│    ├─ INSERT order (status: PENDING)                        │
│    ├─ INSERT order_items                                    │
│    ├─ INSERT payment (status: PENDING)                      │
│    ├─ UPDATE ticket_types (quantity-=n)                     │
│    └─ SET paymentDeadline = now + 5 minutes                 │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Xác nhận thanh toán (nếu bank transfer)                  │
│    PATCH /api/payments/:paymentId/complete                  │
│    Body: { "transactionId": "FT123456" }                    │
│                                                              │
│    ⚙️ Backend xử lý:                                         │
│    ├─ START TRANSACTION                                      │
│    ├─ LOCK payment                                           │
│    ├─ Kiểm tra ownership (user chỉ xác nhận riêng của họ)  │
│    ├─ Kiểm tra payment deadline chưa qua                    │
│    ├─ UPDATE payment (status: SUCCESS, paymentTime: now)    │
│    ├─ UPDATE order (status: PAID)                           │
│    ├─ COMMIT TRANSACTION                                    │
│    └─ Response: Payment object                              │
│                                                              │
│    💾 Database thay đổi:                                    │
│    ├─ UPDATE payment (status: SUCCESS)                      │
│    └─ UPDATE order (status: PAID)                           │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Tạo vé (tự động hoặc manual)                             │
│    POST /api/tickets (admin tạo manual, hoặc auto)          │
│    Response: Vé được tạo với ticketCode & QR data           │
│                                                              │
│    💾 DATABASE:                                             │
│    ├─ INSERT tickets (status: ACTIVE)                       │
│    └─ ticketCode = unique generated code                    │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Lấy vé & QR code                                          │
│    GET /api/tickets/:id                                     │
│    GET /api/tickets/:id/qr                                  │
│    Response: QR image (base64)                              │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ USER - Đi tham dự sự kiện                                   │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Quét vé tại cổng check-in                               │
│    PATCH /api/tickets/:id/use                              │
│                                                              │
│    ⚙️ Backend xử lý:                                         │
│    ├─ Tìm ticket                                            │
│    ├─ Kiểm tra status (phải ACTIVE)                        │
│    ├─ UPDATE status: ACTIVE → USED                         │
│    └─ Response: Vé đã check-in thành công                   │
│                                                              │
│    💾 Database:                                             │
│    └─ UPDATE tickets (status: USED)                         │
└─────────────────────────────────────────────────────────────┘
```

### **Luồng Tự Động Hủy Đơn Hàng Hết Hạn (Cron Job)**

```
CRON JOB (Every minute)
      ↓
OrderCronService.handleExpireOrders()
      ↓
OrdersService.cancelExpiredOrders()
      ├─ Query: SELECT * FROM orders WHERE
      │  status = 'PENDING' AND paymentDeadline < NOW()
      ↓
For each expired order:
      ├─ START TRANSACTION
      ├─ LOCK order
      ├─ For each order_item:
      │  ├─ LOCK ticket_type
      │  ├─ Khôi phục inventory (quantity += n)
      │  └─ UPDATE ticket_type
      ├─ UPDATE order (status: CANCELLED)
      ├─ COMMIT
      └─ Continue with next order
      ↓
💾 Kết quả:
   ├─ Vé quay lại sẵn sàng
   ├─ Đơn hàng bị hủy
   └─ Tiền được hoàn lại (nếu cần)
```

---

## ⚙️ Công Nghệ & Patterns

### **Tech Stack**

| Lớp            | Công Nghệ                          |
| -------------- | ---------------------------------- |
| **Runtime**    | Node.js 18+                        |
| **Framework**  | NestJS 9+                          |
| **Language**   | TypeScript 5+                      |
| **Database**   | PostgreSQL 13+                     |
| **ORM**        | TypeORM                            |
| **Auth**       | Passport JWT                       |
| **Encryption** | bcrypt (passwords), JWT (tokens)   |
| **QR Codes**   | qrcode library                     |
| **Scheduling** | @nestjs/schedule                   |
| **API Docs**   | Swagger (@nestjs/swagger)          |
| **Validation** | class-validator, class-transformer |

### **Design Patterns Sử Dụng**

#### **1. Dependency Injection (DI)**

```typescript
// Service được inject vào Controller
@Injectable()
export class AuthService { ... }

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  // NestJS tự động tạo instance
}
```

#### **2. Repository Pattern**

```typescript
// Tất cả database access qua Repository
@InjectRepository(User)
private usersRepository: Repository<User>
// Giúp test và change database dễ
```

#### **3. Module Pattern**

```typescript
// Mỗi feature = 1 module độc lập
@Module({
  imports: [...],
  controllers: [...],
  providers: [...],
})
export class AuthModule {}

// App gồm nhiều modules
@Module({
  imports: [
    AuthModule,
    UsersModule,
    EventsModule,
    // ...
  ],
})
export class AppModule {}
```

#### **4. Guard & Interceptor Pattern**

```typescript
// Guards - Authentication/Authorization
@UseGuards(JwtAuthGuard, RolesGuard)

// Interceptors - Request/Response transformation
app.useGlobalInterceptors(new TransformResponseInterceptor());

// Exception Filters - Error handling
app.useGlobalFilters(new HttpExceptionFilter());
```

#### **5. Decorator Pattern**

```typescript
// Custom decorators
@CurrentUser() // Lấy user từ JWT
@Public() // Bỏ qua auth
@Roles(UserRole.ADMIN) // Kiểm tra role
```

#### **6. Strategy Pattern (Passport)**

```typescript
// JWT Strategy
export class JwtStrategy extends PassportStrategy(Strategy) {
  validates JWT token
}

// Có thể extend với OAuth, Google, etc.
```

#### **7. Transaction Pattern**

```typescript
// Database transactions cho data consistency
const result = await repository.manager.transaction(async (entityManager) => {
  // Tất cả operations trong transaction
  // Auto rollback nếu có error
});
```

#### **8. Soft Delete Pattern**

```typescript
// Không thực sự xóa, chỉ mark deletedAt
@DeleteDateColumn()
deletedAt: Date | null;

// Query tự động filter
repository.find() // Chỉ returnDeleted records
repository.find({ withDeleted: true }) // Gồm deleted
```

---

## 🔒 Bảo Mật

### **Các Tính Năng Bảo Mật Đã Triển Khai**

#### **1. Authentication**

✅ JWT tokens (access + refresh)  
✅ 24h access token expiration  
✅ 7d refresh token expiration  
✅ Refresh token hash tracking (logout support)  
✅ Bearer token extraction từ Authorization header

#### **2. Password Security**

✅ Bcrypt hashing (10 salt rounds)  
✅ Password không được truy vấn mặc định (SELECT false)  
✅ Password never returned in responses

#### **3. Authorization**

✅ Role-based access control (RBAC)  
✅ @Roles() decorator cho fine-grained control  
✅ @Public() decorator cho public routes  
✅ RolesGuard enforcement

#### **4. Data Protection**

✅ Soft delete (no data loss)  
✅ Timestamps (audit trail - createdAt, updatedAt, deletedAt)  
✅ Timezone-aware dates  
✅ UUID for primary keys (không sequential)

#### **5. Concurrency Control**

✅ Pessimistic write locks (race condition prevention)  
✅ Database transactions (ACID)  
✅ Inventory protection during checkout

#### **6. Input Validation**

✅ DTO validation (class-validator)  
✅ Whitelist mode (lỗi nếu fields không expected)  
✅ Type transformation  
✅ Error flattening & sanitization

#### **7. Error Handling**

✅ Global exception filters  
✅ No stack traces to client  
✅ Sanitized error messages  
✅ Proper HTTP status codes

#### **8. API Security**

✅ CORS enabled  
✅ API prefix (/api)  
✅ Swagger docs (conditional - disabled in production)  
✅ Input size limits (default NestJS)

### **Cần Cải Thiện (TODO)**

⚠️ Rate limiting (chống DDoS, brute force)  
⚠️ CSRF protection  
⚠️ Audit logging (track sensitive operations)  
⚠️ API key rotation  
⚠️ Database encryption at rest  
⚠️ Two-factor authentication (2FA)  
⚠️ HTTPS/TLS enforcement  
⚠️ Data masking for PII  
⚠️ SQL injection prevention (already good with ORM)  
⚠️ XSS protection (frontend concern)

---

## ⚡ Tối Ưu Hóa Hiệu Năng

### **Hiện Tại Đã Triển Khai**

✅ **Connection Pooling** - 5-20 DB connections (reuse)  
✅ **Indexed Columns** - email, slug, timestamps, IDs  
✅ **Soft Delete Optimization** - Queries auto-exclude deleted  
✅ **Pagination** - Tất cả list endpoints hỗ trợ skip/take  
✅ **Selective Queries** - SELECT false cho password, refresh token hash  
✅ **Lazy Loading** - Relations không load mặc định (use relations: [...])  
✅ **Transaction Scope** - Minimal transaction time

### **Query Optimization Examples**

```typescript
// ❌ Bad - N+1 query problem
const events = await eventsRepository.find();
events.forEach((e) => console.log(e.organizer.name)); // 1+N queries

// ✅ Good - Eager load
const events = await eventsRepository.find({
  relations: ['organizer'],
});

// ✅ Better - Selective columns
const events = await eventsRepository
  .createQueryBuilder('event')
  .leftJoinAndSelect('event.organizer', 'organizer')
  .select(['event.id', 'event.name', 'organizer.id', 'organizer.fullName'])
  .getMany();
```

### **Cần Cải Thiện (TODO)**

⚠️ Caching (Redis) - Frequently accessed data  
⚠️ Query result caching  
⚠️ Database query analysis & optimization  
⚠️ API response compression (gzip)  
⚠️ CDN for static assets  
⚠️ Load balancing  
⚠️ Database replication (read replicas)  
⚠️ Search optimization (full-text search)

---

## 📊 Configuration & Environment Variables

```bash
# .env file
NODE_ENV=development

# Server
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=cnlthd

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:3000

# Payment
PAYMENT_TIMEOUT=300000  # 5 minutes

# Swagger
SWAGGER_ENABLED=true
```

---

## 🎯 Tóm Tắt Kiến Trúc

```
                        Client Requests
                              ↓
                    ┌─────────────────────┐
                    │ Validation Pipe    │
                    │ (Whitelist, Cast)  │
                    └─────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │ JwtAuthGuard       │
                    │ (Token Validation) │
                    └─────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │ RolesGuard         │
                    │ (Permission Check) │
                    └─────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │ Controller Layer   │
                    │ (Request Handling) │
                    └─────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │ Service Layer      │
                    │ (Business Logic)   │
                    └─────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │ Repository Layer   │
                    │ (Data Access)      │
                    └─────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │ TypeORM Database   │
                    │ (PostgreSQL)       │
                    └─────────────────────┘
                              ↓
                    Success Response:
                    {
                      "success": true,
                      "statusCode": 200,
                      "data": {...},
                      "timestamp": "...",
                      "path": "/api/..."
                    }
```

---

## 🔗 Quan Hệ Giữa Các Module

```
┌──────────────┐
│    Auth      │ ← Tạo tokens, authenticate users
│   Module     │
└──────────────┘
      ↓
┌──────────────┐
│    Users     │ ← Quản lý user profiles, roles
│   Module     │
└──────────────┘
      ↓
┌──────────────┐     ┌──────────────┐
│   Events     │←────│ TicketTypes  │ ← Loại vé cho event
│   Module     │     │   Module     │
└──────────────┘     └──────────────┘
      ↓                      ↓
      └──────────────┬───────┘
                     ↓
          ┌──────────────────┐
          │    Orders        │ ← Checkout (inventory logic)
          │   Module         │
          └──────────────────┘
                     ↓
          ┌──────────────────┐
          │   Payments       │ ← Thanh toán
          │   Module         │
          └──────────────────┘
                     ↓
          ┌──────────────────┐
          │    Tickets       │ ← Vé với QR code
          │   Module         │
          └──────────────────┘
```

---

## 📝 Ghi Chú Quan Trọng

1. **Transaction Atomicity** - Orders sử dụng database transactions để đảm bảo tất cả hoặc không
2. **Inventory Protection** - Pessimistic write locks ngăn race conditions khi checkout
3. **Soft Delete** - Dữ liệu không bao giờ thực sự xóa, chỉ mark deletedAt
4. **Payment Deadline** - Orders tự động hủy sau 5 phút nếu không thanh toán
5. **Token Management** - Access tokens để authentication, refresh tokens để renewal
6. **Role-Based Access** - ADMIN, ORGANIZER, USER có permissions khác nhau

---

**Tài liệu này cung cấp giải thích toàn diện về source code. Nếu cần clarification chi tiết về bất kỳ phần nào, vui lòng tham khảo mã nguồn trực tiếp trong workspace.**
