# Kiến Thức Cần Học Để Thực Hiện Dự Án

## Mục lục

1. [TypeScript Cơ Bản & Nâng Cao](#1-typescript-cơ-bản--nâng-cao)
2. [NestJS Framework](#2-nestjs-framework)
3. [TypeORM & PostgreSQL](#3-typeorm--postgresql)
4. [Authentication với JWT](#4-authentication-với-jwt)
5. [Validation & Data Transformation](#5-validation--data-transformation)
6. [Testing với Jest](#6-testing-với-jest)
7. [Công Cụ Hỗ Trợ](#7-công-cụ-hỗ-trợ)

---

## 1. TypeScript Cơ Bản & Nâng Cao

### 1.1 Kiến thức cơ bản cần nắm

#### Types cơ bản

```typescript
// Primitive types
let name: string = "John";
let age: number = 25;
let isActive: boolean = true;

// Arrays
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];

// Object type
let user: { name: string; age: number } = {
  name: "John",
  age: 25,
};
```

#### Interface vs Type

```typescript
// Interface - dùng cho object shape, có thể extend
interface User {
  id: string;
  email: string;
  name: string;
}

interface Admin extends User {
  permissions: string[];
}

// Type - linh hoạt hơn, dùng cho union, intersection
type Role = "admin" | "user" | "guest";
type UserWithRole = User & { role: Role };
```

#### Generics

```typescript
// Generic function
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

// Generic interface
interface Repository<T> {
  findOne(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
```

#### Decorators (quan trọng cho NestJS)

```typescript
// Class decorator
function Controller(prefix: string) {
  return function (target: Function) {
    Reflect.defineMetadata("prefix", prefix, target);
  };
}

// Method decorator
function Get(path: string) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata("path", path, target, key);
    Reflect.defineMetadata("method", "GET", target, key);
  };
}

// Property decorator
function Column() {
  return function (target: any, propertyKey: string) {
    // Logic xử lý
  };
}
```

### 1.2 Strict Mode Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 1.3 Tài liệu học

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

---

## 2. NestJS Framework

### 2.1 Core Concepts

#### Module

```typescript
import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [], // Import các module khác
  controllers: [UserController], // Đăng ký controllers
  providers: [UserService], // Đăng ký services
  exports: [UserService], // Export để module khác sử dụng
})
export class UserModule {}
```

#### Controller

```typescript
import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";

@Controller("users") // Route prefix: /users
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get() // GET /users
  findAll() {
    return this.userService.findAll();
  }

  @Get(":id") // GET /users/:id
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @Post() // POST /users
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}
```

#### Service (Provider)

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }
}
```

### 2.2 Dependency Injection

```typescript
// NestJS tự động inject dependencies dựa trên type

// Service A
@Injectable()
export class ServiceA {
  doSomething() {
    return "Hello from A";
  }
}

// Service B inject Service A
@Injectable()
export class ServiceB {
  constructor(private serviceA: ServiceA) {}

  doSomethingElse() {
    return this.serviceA.doSomething() + " and B";
  }
}

// Module đăng ký
@Module({
  providers: [ServiceA, ServiceB],
})
export class AppModule {}
```

### 2.3 Request Lifecycle

```
Request → Middleware → Guards → Interceptors (before) → Pipes → Controller → Service → Interceptors (after) → Exception Filters → Response
```

### 2.4 Guards (Bảo vệ routes)

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      return false;
    }

    // Verify token logic
    return true;
  }
}

// Sử dụng
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile() {
  // Chỉ authenticated users mới vào được
}
```

### 2.5 Interceptors

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";

// Transform response
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

// Logging interceptor
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const now = Date.now();

    console.log(`[${request.method}] ${request.url} - Start`);

    return next.handle().pipe(
      tap(() => {
        console.log(
          `[${request.method}] ${request.url} - ${Date.now() - now}ms`,
        );
      }),
    );
  }
}
```

### 2.6 Exception Filters

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      success: false,
      statusCode: status,
      message:
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : (exceptionResponse as any).message,
      timestamp: new Date().toISOString(),
    });
  }
}

// Áp dụng global
// main.ts
app.useGlobalFilters(new HttpExceptionFilter());
```

### 2.7 Custom Decorators

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Decorator lấy current user từ request
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Sử dụng
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

### 2.8 Tài liệu học NestJS

- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS Fundamentals Course](https://courses.nestjs.com/)

---

## 3. TypeORM & PostgreSQL

### 3.1 Cài đặt và cấu hình

```typescript
// app.module.ts
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "password",
      database: "event_booking",
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      synchronize: true, // Chỉ dùng trong development
    }),
  ],
})
export class AppModule {}
```

### 3.2 Entity Definition

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: "full_name" })
  fullName: string;

  @Column({ type: "enum", enum: ["admin", "user"], default: "user" })
  role: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];
}

@Entity("events")
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ name: "event_date", type: "timestamp" })
  eventDate: Date;

  @Column()
  location: string;

  @Column({
    type: "enum",
    enum: ["draft", "published", "cancelled"],
    default: "draft",
  })
  status: string;

  @OneToMany(() => TicketType, (ticketType) => ticketType.event)
  ticketTypes: TicketType[];
}

@Entity("ticket_types")
export class TicketType {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string; // VIP, Standard, Economy

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ name: "total_quantity" })
  totalQuantity: number;

  @Column({ name: "remaining_quantity" })
  remainingQuantity: number;

  @ManyToOne(() => Event, (event) => event.ticketTypes)
  @JoinColumn({ name: "event_id" })
  event: Event;

  @Column({ name: "event_id" })
  eventId: string;
}
```

### 3.3 Repository Pattern

```typescript
// user.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

// user.service.ts
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Các phương thức cơ bản
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.userRepository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
```

### 3.4 Query Builder

```typescript
// Các query phức tạp
async findEventsWithTickets(): Promise<Event[]> {
  return this.eventRepository
    .createQueryBuilder('event')
    .leftJoinAndSelect('event.ticketTypes', 'ticketType')
    .where('event.status = :status', { status: 'published' })
    .andWhere('event.eventDate > :now', { now: new Date() })
    .orderBy('event.eventDate', 'ASC')
    .getMany();
}

async getBookingStatistics(eventId: string) {
  return this.bookingRepository
    .createQueryBuilder('booking')
    .select('ticketType.name', 'ticketName')
    .addSelect('SUM(booking.quantity)', 'totalBooked')
    .addSelect('SUM(booking.totalPrice)', 'totalRevenue')
    .innerJoin('booking.ticketType', 'ticketType')
    .where('ticketType.eventId = :eventId', { eventId })
    .groupBy('ticketType.name')
    .getRawMany();
}
```

### 3.5 Transactions

```typescript
import { DataSource } from "typeorm";

@Injectable()
export class BookingService {
  constructor(private dataSource: DataSource) {}

  async createBooking(userId: string, dto: CreateBookingDto): Promise<Booking> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Kiểm tra số lượng vé
      const ticketType = await queryRunner.manager.findOne(TicketType, {
        where: { id: dto.ticketTypeId },
        lock: { mode: "pessimistic_write" }, // Lock để tránh race condition
      });

      if (!ticketType || ticketType.remainingQuantity < dto.quantity) {
        throw new BadRequestException("Không đủ vé");
      }

      // 2. Cập nhật số lượng vé
      ticketType.remainingQuantity -= dto.quantity;
      await queryRunner.manager.save(ticketType);

      // 3. Tạo booking
      const booking = queryRunner.manager.create(Booking, {
        userId,
        ticketTypeId: dto.ticketTypeId,
        quantity: dto.quantity,
        totalPrice: ticketType.price * dto.quantity,
        status: "pending",
      });
      await queryRunner.manager.save(booking);

      // 4. Tạo payment record
      const payment = queryRunner.manager.create(Payment, {
        bookingId: booking.id,
        amount: booking.totalPrice,
        status: "pending",
      });
      await queryRunner.manager.save(payment);

      await queryRunner.commitTransaction();
      return booking;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
```

### 3.6 Migrations

```bash
# Tạo migration
npx typeorm migration:create src/migrations/CreateUsersTable

# Generate migration từ entities
npx typeorm migration:generate src/migrations/InitialMigration -d src/data-source.ts

# Chạy migrations
npx typeorm migration:run -d src/data-source.ts

# Revert migration
npx typeorm migration:revert -d src/data-source.ts
```

### 3.7 Tài liệu học

- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)

---

## 4. Authentication với JWT

### 4.1 Cài đặt packages

```bash
npm install @nestjs/passport @nestjs/jwt passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

### 4.2 JWT Strategy

```typescript
// jwt.strategy.ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "your-secret-key",
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user; // Được gắn vào request.user
  }
}
```

### 4.3 Auth Service

```typescript
// auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Kiểm tra email đã tồn tại
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException("Email đã được sử dụng");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Tạo user
    const user = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });

    // Trả về token
    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }

    return this.generateTokens(user);
  }

  private generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: "1h" }),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
```

### 4.4 Auth Module

```typescript
// auth.module.ts
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key",
      signOptions: { expiresIn: "1h" },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### 4.5 Role-based Authorization

```typescript
// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}

// Sử dụng
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Post('events')
createEvent(@Body() dto: CreateEventDto) {
  return this.eventService.create(dto);
}
```

### 4.6 Tài liệu học

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [JWT.io](https://jwt.io/introduction)

---

## 5. Validation & Data Transformation

### 5.1 Cài đặt

```bash
npm install class-validator class-transformer
```

### 5.2 Global Validation Pipe

```typescript
// main.ts
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ properties không có trong DTO
      forbidNonWhitelisted: true, // Throw error nếu có properties lạ
      transform: true, // Tự động transform types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(3000);
}
```

### 5.3 DTO với Validation

```typescript
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsNumber,
  IsPositive,
  IsUUID,
  IsEnum,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  Max,
  ValidateNested,
  IsArray,
} from "class-validator";
import { Type, Transform } from "class-transformer";

// Register DTO
export class RegisterDto {
  @IsEmail({}, { message: "Email không hợp lệ" })
  email: string;

  @IsString()
  @MinLength(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" })
  @MaxLength(50)
  password: string;

  @IsString()
  @IsNotEmpty({ message: "Họ tên không được để trống" })
  fullName: string;
}

// Create Event DTO
export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  eventDate: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsEnum(["draft", "published"], { message: "Status không hợp lệ" })
  @IsOptional()
  status?: string;
}

// Create Booking DTO
export class CreateBookingDto {
  @IsUUID()
  ticketTypeId: string;

  @IsInt()
  @Min(1, { message: "Số lượng tối thiểu là 1" })
  @Max(10, { message: "Số lượng tối đa là 10" })
  quantity: number;
}

// Query DTO với transform
export class GetEventsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number) // Transform string to number
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  @IsEnum(["draft", "published", "cancelled"])
  status?: string;
}

// Nested validation
export class CreateEventWithTicketsDto {
  @ValidateNested()
  @Type(() => CreateEventDto)
  event: CreateEventDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTicketTypeDto)
  ticketTypes: CreateTicketTypeDto[];
}
```

### 5.4 Custom Validators

```typescript
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from "class-validator";

// Custom validator: kiểm tra date trong tương lai
@ValidatorConstraint({ name: "isFutureDate", async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(date: string, args: ValidationArguments) {
    return new Date(date) > new Date();
  }

  defaultMessage(args: ValidationArguments) {
    return "Ngày sự kiện phải trong tương lai";
  }
}

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureDateConstraint,
    });
  };
}

// Sử dụng
export class CreateEventDto {
  @IsDateString()
  @IsFutureDate({ message: "Ngày sự kiện phải trong tương lai" })
  eventDate: string;
}
```

### 5.5 Tài liệu học

- [class-validator](https://github.com/typestack/class-validator)
- [class-transformer](https://github.com/typestack/class-transformer)

---

## 6. Testing với Jest

### 6.1 Cấu hình Jest

```javascript
// jest.config.js
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
};
```

### 6.2 Unit Testing Service

```typescript
// booking.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { BookingService } from "./booking.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Booking } from "./entities/booking.entity";
import { TicketType } from "../ticket/entities/ticket-type.entity";
import { BadRequestException } from "@nestjs/common";

describe("BookingService", () => {
  let service: BookingService;
  let bookingRepository: any;
  let ticketTypeRepository: any;

  const mockBookingRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockTicketTypeRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepository,
        },
        {
          provide: getRepositoryToken(TicketType),
          useValue: mockTicketTypeRepository,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    bookingRepository = module.get(getRepositoryToken(Booking));
    ticketTypeRepository = module.get(getRepositoryToken(TicketType));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createBooking", () => {
    const userId = "user-123";
    const dto = { ticketTypeId: "ticket-123", quantity: 2 };

    it("should create booking successfully", async () => {
      const ticketType = {
        id: "ticket-123",
        price: 100,
        remainingQuantity: 10,
      };

      const expectedBooking = {
        id: "booking-123",
        userId,
        ticketTypeId: dto.ticketTypeId,
        quantity: dto.quantity,
        totalPrice: 200,
        status: "pending",
      };

      ticketTypeRepository.findOne.mockResolvedValue(ticketType);
      bookingRepository.create.mockReturnValue(expectedBooking);
      bookingRepository.save.mockResolvedValue(expectedBooking);

      const result = await service.createBooking(userId, dto);

      expect(result).toEqual(expectedBooking);
      expect(ticketTypeRepository.save).toHaveBeenCalledWith({
        ...ticketType,
        remainingQuantity: 8,
      });
    });

    it("should throw error when not enough tickets", async () => {
      const ticketType = {
        id: "ticket-123",
        remainingQuantity: 1,
      };

      ticketTypeRepository.findOne.mockResolvedValue(ticketType);

      await expect(service.createBooking(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw error when ticket type not found", async () => {
      ticketTypeRepository.findOne.mockResolvedValue(null);

      await expect(service.createBooking(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
```

### 6.3 Testing Controller

```typescript
// booking.controller.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { BookingController } from "./booking.controller";
import { BookingService } from "./booking.service";

describe("BookingController", () => {
  let controller: BookingController;
  let service: BookingService;

  const mockBookingService = {
    createBooking: jest.fn(),
    findUserBookings: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: BookingService,
          useValue: mockBookingService,
        },
      ],
    }).compile();

    controller = module.get<BookingController>(BookingController);
    service = module.get<BookingService>(BookingService);
  });

  describe("create", () => {
    it("should create a booking", async () => {
      const user = { id: "user-123" };
      const dto = { ticketTypeId: "ticket-123", quantity: 2 };
      const expected = { id: "booking-123", ...dto };

      mockBookingService.createBooking.mockResolvedValue(expected);

      const result = await controller.create(user, dto);

      expect(result).toEqual(expected);
      expect(service.createBooking).toHaveBeenCalledWith(user.id, dto);
    });
  });
});
```

### 6.4 E2E Testing

```typescript
// test/booking.e2e-spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

describe("BookingController (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "test@test.com", password: "password" });

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /bookings", () => {
    it("should create booking with valid token", () => {
      return request(app.getHttpServer())
        .post("/bookings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ticketTypeId: "valid-ticket-id", quantity: 2 })
        .expect(201);
    });

    it("should return 401 without token", () => {
      return request(app.getHttpServer())
        .post("/bookings")
        .send({ ticketTypeId: "valid-ticket-id", quantity: 2 })
        .expect(401);
    });

    it("should return 400 with invalid quantity", () => {
      return request(app.getHttpServer())
        .post("/bookings")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ticketTypeId: "valid-ticket-id", quantity: -1 })
        .expect(400);
    });
  });
});
```

### 6.5 Commands

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Run specific test file
npm run test -- booking.service.spec.ts

# Watch mode
npm run test:watch
```

### 6.6 Tài liệu học

- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

---

## 7. Công Cụ Hỗ Trợ

### 7.1 Environment Configuration

```typescript
// Cài đặt
// npm install @nestjs/config

// app.module.ts
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
  ],
})
export class AppModule {}

// .env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=event_booking
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=1h

// Sử dụng
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfig {
  constructor(private configService: ConfigService) {}

  get host(): string {
    return this.configService.get<string>('DATABASE_HOST');
  }
}
```

### 7.2 Swagger API Documentation

```typescript
// Cài đặt
// npm install @nestjs/swagger swagger-ui-express

// main.ts
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("Event Booking API")
    .setDescription("API cho hệ thống đặt vé sự kiện")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(3000);
}

// Sử dụng decorators trong DTO
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateEventDto {
  @ApiProperty({ example: "Tech Conference 2024" })
  title: string;

  @ApiPropertyOptional({ example: "Annual technology conference" })
  description?: string;
}

// Trong controller
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";

@ApiTags("Events")
@Controller("events")
export class EventController {
  @ApiOperation({ summary: "Tạo sự kiện mới" })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: "Sự kiện được tạo thành công" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @Post()
  create(@Body() dto: CreateEventDto) {}
}
```

### 7.3 Docker Setup

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main"]
```

```yaml
# docker-compose.yml
version: "3.8"
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_HOST=postgres
      - DATABASE_PORT=5432
      - DATABASE_USERNAME=postgres
      - DATABASE_PASSWORD=password
      - DATABASE_NAME=event_booking
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=event_booking
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 7.4 Useful NestJS CLI Commands

```bash
# Tạo resource đầy đủ (module, controller, service, dto, entities)
nest g resource events

# Tạo từng thành phần
nest g module events
nest g controller events
nest g service events

# Tạo guard
nest g guard common/guards/jwt-auth

# Tạo interceptor
nest g interceptor common/interceptors/logging

# Tạo filter
nest g filter common/filters/http-exception

# Tạo pipe
nest g pipe common/pipes/parse-uuid
```

---

## 8. Lộ Trình Học Tập Đề Xuất

### Tuần 1-2: Nền tảng

- [ ] TypeScript cơ bản và nâng cao
- [ ] Hiểu về Decorators
- [ ] PostgreSQL cơ bản

### Tuần 3-4: NestJS Core

- [ ] Module, Controller, Service
- [ ] Dependency Injection
- [ ] Request lifecycle

### Tuần 5-6: Database & ORM

- [ ] TypeORM entities và relations
- [ ] Repository pattern
- [ ] Transactions

### Tuần 7-8: Security

- [ ] JWT Authentication
- [ ] Guards và Authorization
- [ ] Password hashing

### Tuần 9-10: Advanced

- [ ] Validation và DTOs
- [ ] Interceptors và Filters
- [ ] Error handling

### Tuần 11-12: Testing & Deployment

- [ ] Unit testing
- [ ] E2E testing
- [ ] Docker deployment

---

## Tài Liệu Tham Khảo Chính

1. **NestJS Official Docs**: https://docs.nestjs.com/
2. **TypeScript Handbook**: https://www.typescriptlang.org/docs/
3. **TypeORM Docs**: https://typeorm.io/
4. **PostgreSQL Tutorial**: https://www.postgresqltutorial.com/
5. **JWT Introduction**: https://jwt.io/introduction
6. **Jest Docs**: https://jestjs.io/docs/getting-started
