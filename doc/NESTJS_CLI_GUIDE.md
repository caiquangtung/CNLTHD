# NestJS CLI Guide - Hướng Dẫn Sử Dụng Cho Dự Án

> Tài liệu này liệt kê tất cả NestJS CLI commands sẽ được sử dụng trong quá trình triển khai dự án.

---

## 📋 Mục Lục

1. [Cài Đặt NestJS CLI](#-cài-đặt-nestjs-cli)
2. [Commands Cơ Bản](#-commands-cơ-bản)
3. [Generate Commands Cho Dự Án](#-generate-commands-cho-dự-án)
4. [Lộ Trình Sử Dụng CLI (8 Tuần)](#-lộ-trình-sử-dụng-cli-8-tuần)
5. [Best Practices](#-best-practices)
6. [Troubleshooting](#-troubleshooting)

---

## 🚀 Cài Đặt NestJS CLI

### Global Installation (Khuyến nghị)

```bash
# Cài đặt NestJS CLI globally
npm install -g @nestjs/cli

# Kiểm tra version
nest --version

# Xem tất cả commands
nest --help
```

### Project-specific Installation

```bash
# Nếu không muốn cài global
npx @nestjs/cli --version
```

---

## 📦 Commands Cơ Bản

### 1. Project Commands

```bash
# Tạo project mới (không cần cho project này)
nest new project-name

# Xem info về project
nest info
```

### 2. Generate Commands

**Syntax chung:**
```bash
nest generate <schematic> <name> [options]
# hoặc viết tắt
nest g <schematic> <name> [options]
```

**Options phổ biến:**
- `--dry-run` hoặc `-d`: Preview không tạo file
- `--flat`: Không tạo folder
- `--no-spec`: Không tạo test file
- `--spec-file-suffix`: Custom test suffix

---

## 🏗️ Generate Commands Cho Dự Án

### Tuần 1-2: Core Setup

#### 1. User Module (Tuần 1)

```bash
# Tạo module đầy đủ với controller, service, entity
nest g resource users

# CLI sẽ hỏi:
# ? What transport layer do you use? REST API
# ? Would you like to generate CRUD entry points? Yes

# Kết quả tạo:
# src/users/
# ├── dto/
# │   ├── create-user.dto.ts
# │   └── update-user.dto.ts
# ├── entities/
# │   └── user.entity.ts
# ├── users.controller.ts
# ├── users.controller.spec.ts
# ├── users.module.ts
# ├── users.service.ts
# └── users.service.spec.ts
```

**Alternative - Tạo từng file riêng:**
```bash
# Module
nest g module users

# Controller
nest g controller users

# Service
nest g service users

# Entity (tạo manual hoặc dùng TypeORM CLI)
```

#### 2. Auth Module (Tuần 1)

```bash
# Tạo auth resource
nest g resource auth --no-spec

# Tạo JWT Strategy
nest g class auth/strategies/jwt.strategy --no-spec --flat

# Tạo Local Strategy
nest g class auth/strategies/local.strategy --no-spec --flat

# Tạo Auth Guard
nest g guard auth/guards/jwt-auth --no-spec --flat

# Tạo Roles Guard
nest g guard auth/guards/roles --no-spec --flat

# Tạo DTOs
# (Tạo manual vì CLI không có DTO generator riêng)
```

#### 3. Events Module (Tuần 2)

```bash
# Tạo events resource
nest g resource events

# Kết quả:
# src/events/
# ├── dto/
# │   ├── create-event.dto.ts
# │   └── update-event.dto.ts
# ├── entities/
# │   └── event.entity.ts
# ├── events.controller.ts
# ├── events.controller.spec.ts
# ├── events.module.ts
# ├── events.service.ts
# └── events.service.spec.ts
```

#### 4. Ticket Types (Tuần 2)

```bash
# Tạo ticket-types resource (hoặc tích hợp vào events module)
nest g resource ticket-types

# Hoặc tạo trong events module:
nest g service events/ticket-types --flat
nest g controller events/ticket-types --flat
```

### Tuần 3-4: Booking System

#### 5. Bookings Module (Tuần 3)

```bash
# Tạo bookings resource
nest g resource bookings

# Tạo Reservation Service riêng
nest g service bookings/reservation --flat

# Tạo DTOs riêng
# src/bookings/dto/
# ├── reserve-ticket.dto.ts
# ├── complete-booking.dto.ts
# └── booking-response.dto.ts
```

#### 6. Order Reservations (Tuần 3)

```bash
# Tạo trong bookings module
nest g service bookings/order-reservation --flat

# Entity sẽ tạo manual với TypeORM decorators
```

#### 7. Orders Module (Tuần 4)

```bash
# Tạo orders resource
nest g resource orders

# Tạo Order Items service
nest g service orders/order-items --flat
```

#### 8. Payments Module (Tuần 4)

```bash
# Tạo payments resource
nest g resource payments

# Tạo Payment Processor service
nest g service payments/payment-processor --flat

# Tạo Payment Gateway interface
nest g interface payments/interfaces/payment-gateway --no-spec --flat
```

#### 9. Tickets Module (Tuần 4)

```bash
# Tạo tickets resource
nest g resource tickets

# Tạo Ticket Generator service
nest g service tickets/ticket-generator --flat

# Tạo QR Code service (optional)
nest g service tickets/qr-code --flat
```

### Tuần 5-6: Infrastructure

#### 10. Cache Module (Tuần 5)

```bash
# Tạo cache module
nest g module common/cache

# Tạo cache service
nest g service common/cache --flat

# Tạo cache interceptor
nest g interceptor common/cache/cache --flat
```

#### 11. Database Module (Tuần 5)

```bash
# Tạo database module
nest g module database

# Tạo database config
nest g class database/database.config --no-spec --flat
```

#### 12. Scheduled Jobs (Tuần 6)

```bash
# Tạo cleanup service
nest g service common/cleanup --flat

# Tạo scheduler module
nest g module scheduler
```

### Tuần 7-8: Cross-cutting Concerns

#### 13. Common Guards

```bash
# Tạo guards
nest g guard common/guards/jwt-auth --flat
nest g guard common/guards/roles --flat
nest g guard common/guards/throttle --flat
```

#### 14. Common Interceptors

```bash
# Tạo interceptors
nest g interceptor common/interceptors/logging --flat
nest g interceptor common/interceptors/transform --flat
nest g interceptor common/interceptors/timeout --flat
```

#### 15. Common Pipes

```bash
# Tạo pipes
nest g pipe common/pipes/parse-uuid --flat
nest g pipe common/pipes/validation --flat
```

#### 16. Common Filters

```bash
# Tạo exception filters
nest g filter common/filters/http-exception --flat
nest g filter common/filters/all-exceptions --flat
```

#### 17. Common Decorators

```bash
# Tạo decorators
nest g decorator common/decorators/current-user --flat
nest g decorator common/decorators/roles --flat
nest g decorator common/decorators/public --flat
```

---

## 📅 Lộ Trình Sử Dụng CLI (8 Tuần)

### Week 1: Foundation

```bash
# Day 1-2: Setup basic modules
nest g resource users
nest g resource auth --no-spec
nest g guard auth/guards/jwt-auth --flat
nest g guard auth/guards/roles --flat

# Day 3-4: Database setup
nest g module database
nest g class database/database.config --no-spec --flat
```

### Week 2: Events & Tickets

```bash
# Day 1-3: Events
nest g resource events

# Day 4-5: Ticket Types (trong events module)
nest g service events/ticket-types --flat
nest g controller events/ticket-types --flat
```

### Week 3: Booking Core

```bash
# Day 1-2: Reservations
nest g resource bookings
nest g service bookings/reservation --flat

# Day 3-5: Transaction handling
# (Mostly manual code, không dùng CLI nhiều)
```

### Week 4: Orders & Payments

```bash
# Day 1-2: Orders
nest g resource orders
nest g service orders/order-items --flat

# Day 3-4: Payments
nest g resource payments
nest g service payments/payment-processor --flat

# Day 5-7: Tickets
nest g resource tickets
nest g service tickets/ticket-generator --flat
```

### Week 5: Performance & Cache

```bash
# Day 1-2: Cache
nest g module common/cache
nest g service common/cache --flat
nest g interceptor common/cache/cache --flat

# Day 3-4: Database optimization
# (Manual SQL và config)

# Day 5-7: Query optimization
# (Manual code)
```

### Week 6: Background Jobs

```bash
# Day 1-3: Scheduled jobs
nest g module scheduler
nest g service scheduler/cleanup --flat

# Day 4-7: Testing & optimization
# (Manual testing)
```

### Week 7: Guards, Pipes, Interceptors

```bash
# Day 1-2: Guards
nest g guard common/guards/jwt-auth --flat
nest g guard common/guards/roles --flat

# Day 3-4: Interceptors
nest g interceptor common/interceptors/logging --flat
nest g interceptor common/interceptors/transform --flat

# Day 5-7: Pipes & Filters
nest g pipe common/pipes/parse-uuid --flat
nest g filter common/filters/http-exception --flat
```

### Week 8: Final Polish

```bash
# Day 1-3: Additional decorators & utilities
nest g decorator common/decorators/current-user --flat
nest g decorator common/decorators/roles --flat

# Day 4-7: Testing & documentation
# (Manual work)
```

---

## 🎯 Complete Command List (Copy-paste Ready)

### Phase 1: Core Modules

```bash
# Users & Auth
nest g resource users
nest g resource auth --no-spec

# Events & Tickets
nest g resource events
nest g resource ticket-types

# Bookings
nest g resource bookings
nest g resource orders
nest g resource payments
nest g resource tickets
```

### Phase 2: Infrastructure

```bash
# Database
nest g module database

# Cache
nest g module common/cache
nest g service common/cache --flat

# Scheduler
nest g module scheduler
nest g service scheduler/cleanup --flat
```

### Phase 3: Cross-cutting

```bash
# Guards
nest g guard common/guards/jwt-auth --flat
nest g guard common/guards/roles --flat

# Interceptors
nest g interceptor common/interceptors/logging --flat
nest g interceptor common/interceptors/transform --flat
nest g interceptor common/interceptors/timeout --flat

# Pipes
nest g pipe common/pipes/parse-uuid --flat
nest g pipe common/pipes/validation --flat

# Filters
nest g filter common/filters/http-exception --flat
nest g filter common/filters/all-exceptions --flat

# Decorators
nest g decorator common/decorators/current-user --flat
nest g decorator common/decorators/roles --flat
nest g decorator common/decorators/public --flat
```

---

## 💡 Best Practices

### 1. Dry Run Trước Khi Tạo

```bash
# Luôn xem trước những gì sẽ được tạo
nest g resource bookings --dry-run

# Output sẽ hiển thị:
# CREATE src/bookings/dto/create-booking.dto.ts
# CREATE src/bookings/dto/update-booking.dto.ts
# CREATE src/bookings/entities/booking.entity.ts
# CREATE src/bookings/bookings.controller.ts
# ...
```

### 2. Không Tạo Spec Files Không Cần Thiết

```bash
# Nếu sẽ viết tests sau hoặc không cần test
nest g service some-service --no-spec

# Tiết kiệm thời gian cleanup
```

### 3. Sử dụng --flat Cho Files Utilities

```bash
# Tốt: Không tạo folder riêng
nest g service utils/helper --flat
# → src/utils/helper.service.ts

# Không tốt: Tạo nested folder không cần thiết
nest g service utils/helper
# → src/utils/helper/helper.service.ts
```

### 4. Resource vs Separate Generation

**Dùng `nest g resource` khi:**
- Cần full CRUD
- Có controller + service + DTOs + entities
- Module hoàn chỉnh

**Dùng separate commands khi:**
- Chỉ cần 1-2 components
- Tùy chỉnh structure riêng
- Thêm vào module existing

### 5. Naming Conventions

```bash
# Module names: plural, lowercase
nest g module users
nest g module ticket-types

# Service names: singular or plural tùy context
nest g service user    # OK
nest g service users   # OK

# Controller names: plural
nest g controller users
nest g controller bookings

# File names: kebab-case
nest g service payment-processor
# → payment-processor.service.ts
```

---

## 🗂️ Project Structure Sau Khi Dùng CLI

```
src/
├── auth/
│   ├── dto/
│   ├── entities/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
│
├── users/
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.service.ts
│
├── events/
│   ├── dto/
│   ├── entities/
│   │   └── event.entity.ts
│   ├── ticket-types/
│   │   ├── dto/
│   │   ├── entities/
│   │   │   └── ticket-type.entity.ts
│   │   ├── ticket-types.controller.ts
│   │   └── ticket-types.service.ts
│   ├── events.controller.ts
│   ├── events.module.ts
│   └── events.service.ts
│
├── bookings/
│   ├── dto/
│   │   ├── reserve-ticket.dto.ts
│   │   └── complete-booking.dto.ts
│   ├── entities/
│   │   ├── order-reservation.entity.ts
│   │   └── booking.entity.ts
│   ├── reservation.service.ts
│   ├── bookings.controller.ts
│   ├── bookings.module.ts
│   └── bookings.service.ts
│
├── orders/
│   ├── dto/
│   ├── entities/
│   │   ├── order.entity.ts
│   │   └── order-item.entity.ts
│   ├── order-items.service.ts
│   ├── orders.controller.ts
│   ├── orders.module.ts
│   └── orders.service.ts
│
├── payments/
│   ├── dto/
│   ├── entities/
│   │   └── payment.entity.ts
│   ├── interfaces/
│   │   └── payment-gateway.interface.ts
│   ├── payment-processor.service.ts
│   ├── payments.controller.ts
│   ├── payments.module.ts
│   └── payments.service.ts
│
├── tickets/
│   ├── dto/
│   ├── entities/
│   │   └── ticket.entity.ts
│   ├── ticket-generator.service.ts
│   ├── tickets.controller.ts
│   ├── tickets.module.ts
│   └── tickets.service.ts
│
├── common/
│   ├── cache/
│   │   ├── cache.module.ts
│   │   ├── cache.service.ts
│   │   └── cache.interceptor.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── throttle.guard.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   ├── transform.interceptor.ts
│   │   └── timeout.interceptor.ts
│   ├── pipes/
│   │   ├── parse-uuid.pipe.ts
│   │   └── validation.pipe.ts
│   ├── filters/
│   │   ├── http-exception.filter.ts
│   │   └── all-exceptions.filter.ts
│   └── decorators/
│       ├── current-user.decorator.ts
│       ├── roles.decorator.ts
│       └── public.decorator.ts
│
├── database/
│   ├── database.config.ts
│   └── database.module.ts
│
├── scheduler/
│   ├── cleanup.service.ts
│   └── scheduler.module.ts
│
├── config/
│   └── configuration.ts
│
├── app.module.ts
└── main.ts
```

---

## 🔧 Useful CLI Options

### Generate Options

```bash
# Preview only (không tạo files)
--dry-run, -d

# Không tạo test files
--no-spec

# Không tạo folder mới
--flat

# Specify path khác
--path=src/modules

# Skip imports vào module
--skip-import

# Custom project
--project=my-app
```

### Examples

```bash
# Preview resource generation
nest g resource products --dry-run

# Generate service without test file
nest g service email --no-spec

# Generate guard in specific path
nest g guard auth/guards/api-key --flat

# Generate multiple items
nest g service users && nest g controller users
```

---

## 🐛 Troubleshooting

### Problem 1: Command Not Found

```bash
# Error: nest: command not found

# Solution 1: Cài global
npm install -g @nestjs/cli

# Solution 2: Dùng npx
npx @nestjs/cli generate resource users

# Solution 3: Add to PATH
export PATH="$PATH:./node_modules/.bin"
```

### Problem 2: Module Import Issues

```bash
# Nếu CLI không auto-import vào module

# Solution: Manually add vào module
@Module({
  imports: [NewModule],  // Add this
})
```

### Problem 3: TypeScript Errors After Generation

```bash
# Chạy lại TypeScript compiler
npm run build

# Hoặc restart dev server
npm run start:dev
```

### Problem 4: File Already Exists

```bash
# Error: File already exists

# Solution: Xóa file cũ hoặc dùng tên khác
nest g service users-v2

# Hoặc overwrite (cẩn thận!)
# Không có option overwrite - phải xóa manual
```

---

## 📝 Quick Reference Card

### Most Used Commands

```bash
# Generate full module with CRUD
nest g resource <name>

# Generate individual components
nest g module <name>
nest g controller <name>
nest g service <name>

# Generate utilities
nest g guard <name>
nest g interceptor <name>
nest g pipe <name>
nest g filter <name>
nest g decorator <name>

# Generate interfaces/classes
nest g interface <name>
nest g class <name>

# Useful options
--dry-run     # Preview
--no-spec     # No test files
--flat        # No folder
```

### Shortcuts

```bash
nest g mo users     # module
nest g co users     # controller
nest g s users      # service
nest g gu auth      # guard
nest g in logging   # interceptor
nest g pi uuid      # pipe
nest g f http       # filter
nest g d user       # decorator
```

---

## 🎓 Learning Resources

### Official Documentation
- [NestJS CLI Overview](https://docs.nestjs.com/cli/overview)
- [NestJS CLI Workspaces](https://docs.nestjs.com/cli/monorepo)
- [NestJS Schematics](https://docs.nestjs.com/recipes/nest-commander)

### Tips
1. Luôn dùng `--dry-run` trước khi generate
2. Sử dụng `--no-spec` để tránh clutter
3. Convention: Plural cho modules/controllers, singular cho services
4. Organize code theo feature modules

---

## 📋 Checklist Sử Dụng CLI

### Setup
- [ ] Cài đặt NestJS CLI globally
- [ ] Verify version
- [ ] Test với --dry-run

### Week 1
- [ ] Generate users resource
- [ ] Generate auth resource
- [ ] Generate auth guards

### Week 2
- [ ] Generate events resource
- [ ] Generate ticket-types

### Week 3-4
- [ ] Generate bookings resource
- [ ] Generate orders resource
- [ ] Generate payments resource
- [ ] Generate tickets resource

### Week 5-6
- [ ] Generate cache module
- [ ] Generate scheduler module
- [ ] Generate cleanup service

### Week 7-8
- [ ] Generate common guards
- [ ] Generate common interceptors
- [ ] Generate common pipes/filters
- [ ] Generate common decorators

---

## 🎯 Summary

**NestJS CLI giúp:**
- ⚡ Generate code nhanh
- 📦 Tạo structure nhất quán
- 🔧 Auto-import vào modules
- ✅ Follow best practices

**Commands quan trọng nhất:**
1. `nest g resource` - Full module với CRUD
2. `nest g service` - Service layer
3. `nest g controller` - HTTP endpoints
4. `nest g guard/interceptor/pipe` - Cross-cutting concerns

**Remember:**
- Dùng `--dry-run` để preview
- Dùng `--no-spec` nếu không cần tests
- Dùng `--flat` cho utilities
- Follow naming conventions

---

**Last Updated**: 2026-01-25  
**Next Review**: Khi bắt đầu Week 1 implementation
