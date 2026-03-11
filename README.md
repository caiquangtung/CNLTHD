# Hệ Thống Đặt Vé Sự Kiện - NestJS Event Booking System

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Tính năng chính](#-tính-năng-chính)
- [Kiến trúc hệ thống](#-kiến-trục-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt và chạy](#-cài-đặt-và-chạy)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Tác giả](#-tác-giả)

## 🌟 Tổng quan

Dự án này là hệ thống backend đặt vé sự kiện được xây dựng bằng **NestJS** với kiến trúc module-based và dependency injection.

**Ngôn ngữ chính:** Tiếng Việt (documentation) | English (code & comments)

### 🎯 Mục tiêu

- ✅ Tập trung nghiên cứu NestJS Framework và các tính năng core
- ✅ Áp dụng kiến trúc Module-based và Dependency Injection của NestJS
- ✅ Sử dụng Decorators, Guards, Pipes, Interceptors của NestJS
- ✅ Xây dựng kiến trúc backend enterprise với NestJS

### 📈 Lộ Trình Phát Triển

Dự án được phát triển theo 3 giai đoạn:

| Giai Đoạn     | Stack                    | Target Users | Status                 |
| ------------- | ------------------------ | ------------ | ---------------------- |
| **1. MVP**    | NestJS + PostgreSQL      | 500-1,000    | ⭐ **Đang triển khai** |
| **2. Growth** | + Redis                  | 1,000-10,000 | 🔮 Future              |
| **3. Scale**  | + Queue + Infrastructure | 10,000+      | 🔮 Future              |

> **Hiện tại**: Tập trung triển khai Giai đoạn 1 với NestJS + PostgreSQL thuần

## ✨ Tính năng chính

### 👤 Quản lý người dùng

- Đăng ký/đăng nhập với authentication
- Quản lý profile người dùng

### 🎪 Quản lý sự kiện

- Tạo và quản lý sự kiện
- Quản lý trạng thái sự kiện
- **Quan hệ User-Event**: Một user (role `organizer` hoặc `admin`) có thể tạo nhiều event
- Chỉ **owner** hoặc **admin** mới được sửa/xóa event của mình

### 🎫 Hệ thống vé

- Nhiều loại vé cho mỗi sự kiện
- Quản lý số lượng vé có sẵn

### 🛒 Đặt vé và thanh toán

- Đặt vé với validation
- Lưu payment trực tiếp vào database

## 🏗️ Kiến trúc hệ thống

```
src/
├── modules/
│   ├── auth/           # Authentication module
│   ├── users/          # User management
│   ├── events/         # Event management
│   ├── tickets/        # Ticket management
│   ├── bookings/       # Booking system
│   └── common/         # Shared utilities
├── core/               # Core configurations
├── decorators/         # Custom decorators
├── guards/             # Authentication guards
├── interceptors/       # Request/Response interceptors
├── pipes/              # Validation pipes
└── filters/            # Exception filters
```

### 📁 Cấu trúc Module

NestJS sử dụng kiến trúc module-based với:

- **Modules**: Tổ chức code thành các module độc lập
- **Controllers**: Xử lý HTTP requests
- **Services**: Chứa business logic
- **Providers**: Dependency injection

## 🛠️ Công nghệ sử dụng

### Giai Đoạn 1: MVP Stack (Hiện Tại)

#### Backend Framework

- **NestJS** - Enterprise Node.js framework
- **TypeScript** - Strict type checking
- **Node.js** - Runtime environment

#### Database

- **PostgreSQL 15+** - Production database
- **TypeORM** - ORM with full transaction support
- **Connection Pooling** - Optimized for 500-1,000 concurrent users

#### Core NestJS Features

- **Modules** - Application architecture
- **Controllers** - HTTP request handling
- **Services** - Business logic
- **Guards** - Authentication & Authorization (JWT)
- **Pipes** - Data validation & transformation
- **Interceptors** - Request/Response manipulation
- **Decorators** - Metadata programming
- **Scheduled Jobs** - Background cleanup tasks

#### Performance Optimizations

- ✅ **Pessimistic Locking** - Prevent race conditions
- ✅ **Optimistic Locking** - Backup strategy with retry
- ✅ **Transaction Management** - ACID compliance
- ✅ **In-Memory Cache** - Simple caching for static data
- ✅ **Database Indexes** - Optimized query performance
- ✅ **Connection Pooling** - Efficient database connections

### Giai Đoạn 2: Growth Stack (Future)

- ➕ **Redis** - Distributed caching & session management
- ➕ **Rate Limiting** - Request throttling

### Giai Đoạn 3: Scale Stack (Future)

- ➕ **Bull Queue** - Job processing system
- ➕ **PostgreSQL Replicas** - Read scaling
- ➕ **Prometheus + Grafana** - Monitoring & alerting
- ➕ **Load Balancer** - Horizontal scaling

## 🚀 Cài đặt và chạy

### Phương pháp 1: Sử dụng Docker (Khuyến nghị)

#### Yêu cầu hệ thống

- Docker >= 20.0
- Docker Compose >= 2.0

#### 1. Clone repository

```bash
git clone https://github.com/caiquangtung/CNLTHD.git
cd CNLTHD
```

#### 2. Cấu hình môi trường

```bash
cp .env.example .env
```

#### 3. Khởi động PostgreSQL với Docker

```bash
# Khởi động PostgreSQL (chỉ cần cho NestJS app)
docker-compose up -d postgres

# Chờ database sẵn sàng (khoảng 10-15 giây)
# Kiểm tra logs
docker-compose logs postgres
```

#### 4. Cài đặt dependencies và chạy ứng dụng

```bash
npm install

# Chạy migrations (tạo bảng + seed data)
npm run migration:run
```

#### 5. Khởi động ứng dụng

```bash
# Development mode
npm run start:dev

# Hoặc build và chạy production
npm run build
npm run start:prod
```

Server sẽ chạy tại: `http://localhost:3000`

#### Reset toàn bộ database

```bash
docker compose down
docker volume rm cnlthd_postgres_data
docker compose up -d postgres
npm run migration:run
```

### Phương pháp 2: Cài đặt thủ công

#### Yêu cầu hệ thống

- Node.js >= 18.0.0
- PostgreSQL >= 13.0

#### 1. Cài đặt PostgreSQL

Cài đặt PostgreSQL trên máy local hoặc sử dụng Docker như trên.

#### 2. Cài đặt dependencies

```bash
npm install
```

#### 3. Cấu hình môi trường

```bash
cp .env.example .env
# Chỉnh sửa .env theo cấu hình PostgreSQL của bạn
```

#### 4. Khởi tạo database

```bash
# Tạo database event_booking trong PostgreSQL
# (Hoặc sử dụng Docker như phương pháp 1)
createdb event_booking
```

#### 5. Chạy ứng dụng

```bash
npm run start:dev
```

## 📚 API Documentation

### API Response Format

All API responses follow a **standardized format** for consistency:

```json
{
  "success": true,
  "data": { ... },
  "message": null,
  "statusCode": 200,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users/123"
}
```

### Authentication Endpoints

```http
POST /auth/register
POST /auth/login
```

### Events Management

```http
GET    /events              # Lấy danh sách sự kiện (public)
POST   /events              # Tạo sự kiện mới (ADMIN, ORGANIZER) - tự động gắn organizerId
GET    /events/my-events    # Lấy các sự kiện do user hiện tại tạo (requires JWT)
GET    /events/:id          # Chi tiết sự kiện (public)
PATCH  /events/:id          # Cập nhật sự kiện (ADMIN hoặc owner)
DELETE /events/:id          # Xóa sự kiện - soft delete (ADMIN hoặc owner)
PATCH  /events/:id/restore  # Khôi phục sự kiện đã xóa (ADMIN)
GET    /events/deleted      # Danh sách sự kiện đã xóa (ADMIN)
```

#### Quy tắc phân quyền Events

| Hành động                | Quyền yêu cầu                            |
| ------------------------ | ---------------------------------------- |
| Xem danh sách / chi tiết | Public (không cần đăng nhập)             |
| Tạo event                | `ADMIN` hoặc `ORGANIZER`                 |
| Sửa / Xóa event          | `ADMIN` hoặc **người tạo event (owner)** |
| Xem events của mình      | Bất kỳ user đã đăng nhập                 |

> **Lưu ý**: Khi xóa user, các event do user đó tạo vẫn tồn tại trong hệ thống, chỉ `organizer_id` được set về `NULL`.

### Booking System

```http
POST   /bookings        # Tạo booking mới
GET    /bookings/my     # Lịch sử booking của user
GET    /bookings/:id    # Chi tiết booking
```

## 🧪 Testing với NestJS

NestJS cung cấp built-in testing utilities:

```bash
# Chạy tất cả tests
npm run test

# Chạy tests với coverage
npm run test:cov

# Chạy E2E tests
npm run test:e2e

# Chạy tests watch mode
npm run test:watch
```

### Testing Strategies trong NestJS:

- **Unit Tests** cho Services, Guards, Pipes
- **Integration Tests** cho Modules
- **E2E Tests** cho HTTP endpoints
- **TestingModule** để mock dependencies

## 📖 Documentation

### 🚀 Quick Start

**Mới vào dự án?** Đọc file này trước: [`doc/PROJECT_SUMMARY.md`](doc/PROJECT_SUMMARY.md) - Tóm tắt toàn bộ dự án

**Team 4 người (Tùng, Hoàng-19, Hoàng-20, Khánh)?** Đọc:

- ⭐ [`FEATURE_ASSIGNMENT.md`](FEATURE_ASSIGNMENT.md) - Phân công chi tiết (25% mỗi người, tự test)
- 🚀 [`QUICK_START.md`](QUICK_START.md) - Quick start 5 phút
- 🗑️ [`SOFT_DELETE_GUIDE.md`](SOFT_DELETE_GUIDE.md) - Soft delete (BaseEntity)
- 🔄 [`MIGRATION_GUIDE.md`](MIGRATION_GUIDE.md) - Auto-generate migrations

### 👥 Team Assignment (4 người: Tùng, Hoàng-19, Hoàng-20, Khánh)

⭐ [`FEATURE_ASSIGNMENT.md`](FEATURE_ASSIGNMENT.md) - Complete feature assignment (25% each):

- **Tùng**: Foundation + Auth + Reservations ⭐⭐⭐ CRITICAL
- **Hoàng-19**: Events + Ticket Types
- **Hoàng-20**: Orders + Payments + Admin ⭐⭐⭐ CRITICAL
- **Khánh**: Tickets + Bookings API + Admin

**Strategy**: Week 1-2 (Tùng SOLO) → Week 3-4 (ALL 4 core features) → MVP Complete!

🚀 [`QUICK_START.md`](QUICK_START.md) - Setup & run trong 5 phút

### 📚 Complete Documentation

```
📁 doc/ (7 technical documents)
├── 🎯 PROJECT_SUMMARY.md        ⭐ START HERE - Tổng quan toàn bộ dự án
├── 🎓 KNOWLEDGE.md              Kiến thức NestJS cần học
├── 🏗️ DATABASE_SCHEMA.md        Chi tiết 8 tables + relationships
├── 🚀 DATABASE_OPTIMIZATION.md  Lộ trình 3 giai đoạn (MVP→Growth→Scale)
├── 📅 IMPLEMENTATION_ROADMAP.md 8 tuần triển khai chi tiết
├── 🎯 TECHNICAL_DECISIONS.md    Quyết định kỹ thuật & lý do
└── ⚡ NESTJS_CLI_GUIDE.md       Hướng dẫn NestJS CLI commands
```

### 📖 Đọc Theo Thứ Tự

**Cho người mới:**

1. ⭐ [`PROJECT_SUMMARY.md`](doc/PROJECT_SUMMARY.md) - Overview nhanh 5 phút
2. 🚀 [`DATABASE_OPTIMIZATION.md`](doc/DATABASE_OPTIMIZATION.md) - Hiểu kiến trúc
3. 🎯 [`TECHNICAL_DECISIONS.md`](doc/TECHNICAL_DECISIONS.md) - Tại sao như vậy

**Cho developers (Team 4 người):**

1. ⭐ [`FEATURE_ASSIGNMENT.md`](FEATURE_ASSIGNMENT.md) - Complete task assignment (25% mỗi người)
2. 📅 [`IMPLEMENTATION_ROADMAP.md`](doc/IMPLEMENTATION_ROADMAP.md) - Làm gì từng tuần
3. 🏗️ [`DATABASE_SCHEMA.md`](doc/DATABASE_SCHEMA.md) - Reference database
4. ⚡ [`NESTJS_CLI_GUIDE.md`](doc/NESTJS_CLI_GUIDE.md) - NestJS CLI commands
5. 🎯 [`TECHNICAL_DECISIONS.md`](doc/TECHNICAL_DECISIONS.md) - Tại sao như vậy

**Cho learners:**

1. 🎓 [`KNOWLEDGE.md`](doc/KNOWLEDGE.md) - Học NestJS từ đầu
2. ⚡ [`NESTJS_CLI_GUIDE.md`](doc/NESTJS_CLI_GUIDE.md) - Sử dụng CLI hiệu quả

### 📊 Documentation Stats

- **Total Files**: 10 documents (7 technical + 3 project)
- **Total Words**: ~75,000+ words
- **Coverage**: 100% (Architecture + Implementation + Team)
- **Team**: 4 người (Tùng, Hoàng-19, Hoàng-20, Khánh)
- **Strategy**: Balanced workload (25% mỗi người, tự test)
- **Status**: ✅ Complete & Ready to Start

## 👨‍💻 Tác giả

**Tung Ca Quang**

- Email: [caitung8@gmail.com]
- GitHub: [@caiquangtung]

Dự án được phát triển như một phần của bài tập thực hành kiến trúc backend enterprise với NestJS.

---

⭐ **Lưu ý:** Dự án tập trung vào việc nghiên cứu và áp dụng các tính năng core của NestJS Framework.

**Happy coding! 🚀**
