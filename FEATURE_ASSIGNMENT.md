# Phân Công Features - Event Booking System

> **Strategy**: Tùng làm Foundation + Auth, sau đó 4 người chia đều features (25% mỗi người, tự test)

---

## 👥 Team Members

| Member | Workload | Focus Area |
|--------|----------|------------|
| **Tùng** | 25% | Foundation + Auth + Reservations |
| **Hoàng-19** | 25% | Events + Ticket Types |
| **Hoàng-20** | 25% | Orders + Payments + Admin |
| **Khánh** | 25% | Tickets + Bookings API + Admin |

---

## 🎯 Development Strategy

```
Phase 1: Foundation (Tùng SOLO) - Week 1-2
  ├─ Database schema (8 entities)
  ├─ Authentication system  
  └─ Core infrastructure

Phase 2: Core Features (ALL 4) - Week 3-4 ⭐ CRITICAL
  ├─ Tùng: Reservations
  ├─ Hoàng-19: Events
  ├─ Hoàng-20: Orders + Payments
  └─ Khánh: Tickets
  
  MVP Complete end of Week 4!

Phase 3: Secondary Features (ALL 4) - Week 5-6
  ├─ Tùng: Optimization
  ├─ Hoàng-19: Ticket Types
  ├─ Hoàng-20: Admin Orders
  └─ Khánh: Bookings API

Phase 4: Polish & Integration (ALL 4) - Week 6
  └─ Team integration testing
```

---

## 📅 PHASE 1: Foundation (Week 1-2) - TÙNG SOLO

> **Tùng làm tất cả base, team khác chờ đến Week 3**

### Week 1: Database & Infrastructure

#### Day 1-2: Database Foundation
**Branch**: `feature/tung/database-setup`

**Tasks**:
- [ ] Create 8 database entities với TypeORM:
  ```typescript
  1. User (id, email, passwordHash, fullName, role, profileData)
  2. Event (id, slug, name, description, location, startTime, endTime, status)
  3. TicketType (id, eventId, name, description, price, quantity, maxPerOrder)
  4. OrderReservation (id, userId, ticketTypeId, quantity, expiresAt, status)
  5. Order (id, userId, totalAmount, status)
  6. OrderItem (id, orderId, ticketTypeId, quantity, unitPrice)
  7. Payment (id, orderId, amount, paymentMethod, status, transactionId)
  8. Ticket (id, orderId, ticketTypeId, ticketCode, qrData, status)
  ```

- [ ] Setup all relationships
- [ ] Create initial migration
- [ ] Add indexes:
  ```sql
  -- Users
  CREATE INDEX idx_users_email ON users(email);
  CREATE INDEX idx_users_role ON users(role);
  
  -- Events
  CREATE INDEX idx_events_slug ON events(slug);
  CREATE INDEX idx_events_status ON events(status);
  CREATE INDEX idx_events_start_time ON events(start_time);
  
  -- TicketTypes
  CREATE INDEX idx_ticket_types_event_id ON ticket_types(event_id);
  
  -- OrderReservations
  CREATE INDEX idx_reservations_user_ticket ON order_reservations(user_id, ticket_type_id);
  CREATE INDEX idx_reservations_status_expires ON order_reservations(status, expires_at);
  
  -- Orders
  CREATE INDEX idx_orders_user_id ON orders(user_id);
  CREATE INDEX idx_orders_status ON orders(status);
  
  -- Payments
  CREATE INDEX idx_payments_order_id ON payments(order_id);
  CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
  
  -- Tickets
  CREATE INDEX idx_tickets_order_id ON tickets(order_id);
  CREATE INDEX idx_tickets_code ON tickets(ticket_code);
  ```

**Deliverables**:
- ✅ All 8 entities created
- ✅ Relationships configured
- ✅ Migration file
- ✅ All indexes added

**Commit**:
```bash
git commit -m "feat(database): add complete schema with 8 entities

- All entities with TypeORM decorators
- Relationships and foreign keys
- Indexes for performance
- Initial migration created"
```

#### Day 3-4: Core Infrastructure
**Branch**: `feature/tung/infrastructure`

**Tasks**:
- [ ] Connection pooling setup:
  ```typescript
  extra: {
    max: 20,           // Maximum connections
    min: 5,            // Minimum connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
  ```

- [ ] Common decorators:
  ```typescript
  @CurrentUser() - Get current user from JWT
  @Public() - Skip auth guard
  @Roles('admin') - Role-based access
  ```

- [ ] Exception filters
- [ ] Logging interceptor
- [ ] Validation pipes (global)
- [ ] Response format standardization

**Deliverables**:
- ✅ Database config optimized
- ✅ Common utilities created
- ✅ Error handling setup
- ✅ Logging configured

**Commit**:
```bash
git commit -m "feat(core): setup infrastructure and utilities

- Connection pooling configured
- Common decorators created
- Exception handling
- Global validation pipes"
```

#### Day 5-7: Generate Base Modules
**Branch**: `feature/tung/base-modules`

**Tasks**:
- [ ] Generate all modules:
  ```bash
  nest g module users
  nest g module auth
  nest g module events
  nest g module bookings
  nest g module orders
  nest g module payments
  nest g module tickets
  ```

- [ ] Create folder structure
- [ ] Add Swagger decorators to controllers
- [ ] Setup module imports/exports

**Deliverables**:
- ✅ All 7 modules generated
- ✅ Folder structure ready
- ✅ Swagger setup

**Commit**:
```bash
git commit -m "feat(modules): generate all base module structures

- 7 modules created
- Folder structure organized
- Swagger decorators added"
```

---

### Week 2: Authentication & Security

#### Day 1-3: Users Module
**Branch**: `feature/tung/users`

**Tasks**:
- [ ] Implement UsersService:
  ```typescript
  async create(dto: CreateUserDto): Promise<User>
  async findByEmail(email: string): Promise<User>
  async findById(id: string): Promise<User>
  async update(id: string, dto: UpdateUserDto): Promise<User>
  ```

- [ ] Password hashing với bcrypt (10 rounds)
- [ ] Email validation
- [ ] Password strength validation (min 8 chars, 1 letter, 1 number)

**DTOs**:
```typescript
class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/)
  password: string;

  @IsString()
  @MinLength(2)
  fullName: string;
}
```

**Tests**: 80%+ coverage

**Commit**:
```bash
git commit -m "feat(users): implement users CRUD operations

- Create, read, update users
- Password hashing with bcrypt
- Email and password validation
- Unit tests included (80%+ coverage)"
```

#### Day 4-6: Authentication System
**Branch**: `feature/tung/auth`

**Tasks**:
- [ ] Implement AuthService:
  ```typescript
  async register(dto: RegisterDto): Promise<AuthResponse>
  async login(dto: LoginDto): Promise<AuthResponse>
  async validateUser(email: string, password: string): Promise<User>
  ```

- [ ] JWT Strategy:
  ```typescript
  @Injectable()
  export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: configService.get('jwt.secret'),
      });
    }

    async validate(payload: JwtPayload): Promise<User> {
      return { id: payload.sub, email: payload.email, role: payload.role };
    }
  }
  ```

- [ ] JWT Auth Guard
- [ ] Roles Guard (RBAC)

**Endpoints**:
- `POST /auth/register`
- `POST /auth/login`

**Tests**: 80%+ coverage

**Commit**:
```bash
git commit -m "feat(auth): implement JWT authentication system

- Register/Login endpoints
- JWT token generation
- Auth guards (JWT + Roles)
- Role-based access control
- Unit tests included (80%+ coverage)"
```

#### Day 7: Security Hardening
**Branch**: `feature/tung/security`

**Tasks**:
- [ ] Rate limiting:
  ```typescript
  @UseGuards(ThrottlerGuard)
  @Throttle(10, 60) // 10 requests per minute
  ```

- [ ] Helmet middleware (security headers)
- [ ] CORS configuration
- [ ] Input sanitization
- [ ] SQL injection prevention (TypeORM handles this)

**Commit**:
```bash
git commit -m "feat(security): add security hardening

- Rate limiting (10 req/min)
- Helmet middleware
- CORS configured
- Input sanitization"
```

---

### End of Week 2: Handoff

**Tasks**:
- [ ] Merge all branches to `develop`
- [ ] Create HANDOFF_WEEK3.md
- [ ] Team meeting: explain structure
- [ ] Push to GitHub

**Deliverables**:
✅ Database schema complete  
✅ Authentication working  
✅ Security hardened  
✅ All base modules ready  
✅ Team can start Week 3  

---

## 📅 PHASE 2: Core Features (Week 3-4) - ALL 4 PEOPLE

> **Cả 4 người làm song song, MVP hoàn thành end of Week 4**

---

### 🔧 TÙNG - Reservations System (Week 3-4) ⭐⭐⭐ CRITICAL

**Priority**: 🔴 CRITICAL PATH

#### Week 3 Day 1-3: Pessimistic Locking
**Branch**: `feature/tung/reservations-core`

**Tasks**:
- [ ] Implement OrderReservationsService:
  ```typescript
  async reserveTicket(
    userId: string,
    dto: CreateReservationDto
  ): Promise<OrderReservation> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    
    try {
      // ⭐ Lock ticket type row với FOR UPDATE
      const ticketType = await queryRunner.manager.findOne(TicketType, {
        where: { id: dto.ticketTypeId },
        lock: { mode: 'pessimistic_write' } // SELECT ... FOR UPDATE
      });
      
      // Check availability
      if (ticketType.quantity < dto.quantity) {
        throw new BadRequestException('Not enough tickets available');
      }
      
      // Create reservation với 10-minute expiration
      const reservation = await queryRunner.manager.save(OrderReservation, {
        userId,
        ticketTypeId: dto.ticketTypeId,
        quantity: dto.quantity,
        unitPrice: ticketType.price,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
        status: 'ACTIVE'
      });
      
      // Decrease ticket quantity
      ticketType.quantity -= dto.quantity;
      await queryRunner.manager.save(ticketType);
      
      await queryRunner.commitTransaction();
      return reservation;
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  
  async getActiveReservation(userId: string, ticketTypeId: string)
  async cancelReservation(reservationId: string)
  ```

**Endpoints**:
- `POST /bookings/reserve`
- `GET /bookings/reservations/my`
- `DELETE /bookings/reservations/:id`

**Tests**: 90%+ coverage (critical path)
- [ ] Unit tests
- [ ] Concurrent request tests (100+ simultaneous)
- [ ] Race condition scenarios

**Commit**:
```bash
git commit -m "feat(bookings): implement reservation with pessimistic locking

- Pessimistic write lock (FOR UPDATE)
- 10-minute timeout mechanism
- Race condition prevention
- Quantity management
- Tests with concurrent requests (90%+ coverage)"
```

#### Week 3 Day 4-7: Cleanup Job
**Branch**: `feature/tung/cleanup-job`

**Tasks**:
- [ ] Scheduled job:
  ```typescript
  @Injectable()
  export class CleanupService {
    @Cron('*/5 * * * *') // Every 5 minutes
    async cleanupExpiredReservations() {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.startTransaction();
      
      try {
        // Find expired reservations
        const expired = await queryRunner.manager.find(OrderReservation, {
          where: {
            status: 'ACTIVE',
            expiresAt: LessThan(new Date())
          },
          relations: ['ticketType']
        });
        
        for (const reservation of expired) {
          // Restore ticket quantity
          const ticketType = await queryRunner.manager.findOne(TicketType, {
            where: { id: reservation.ticketTypeId },
            lock: { mode: 'pessimistic_write' }
          });
          
          ticketType.quantity += reservation.quantity;
          await queryRunner.manager.save(ticketType);
          
          // Mark reservation as EXPIRED
          reservation.status = 'EXPIRED';
          await queryRunner.manager.save(reservation);
        }
        
        await queryRunner.commitTransaction();
        this.logger.log(`Cleaned up ${expired.length} expired reservations`);
        
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error('Cleanup job failed', error);
      } finally {
        await queryRunner.release();
      }
    }
  }
  ```

**Commit**:
```bash
git commit -m "feat(bookings): add scheduled cleanup for expired reservations

- Runs every 5 minutes
- Restores ticket quantities
- Updates reservation status
- Error handling and logging"
```

#### Week 4: Testing & Optimization
**Branch**: `feature/tung/reservations-testing`

**Tasks**:
- [ ] Load testing với k6:
  ```javascript
  export let options = {
    stages: [
      { duration: '30s', target: 50 },
      { duration: '1m', target: 100 },
      { duration: '30s', target: 200 },
    ],
  };
  ```

- [ ] Performance optimization
- [ ] Query optimization
- [ ] Deadlock prevention

**Deliverables**:
- ✅ Reservation system working (zero race conditions)
- ✅ Cleanup job running every 5 min
- ✅ Load test passing (200 concurrent users)
- ✅ Tests: 90%+ coverage
- ✅ Response time < 2s

---

### 📅 HOÀNG-19 - Events + Ticket Types (Week 3-6)

**Priority**: 🔴 HIGH

#### Week 3-4: Events Management
**Branch**: `feature/hoang19/events`

**Tasks**:
- [ ] Implement EventsService:
  ```typescript
  async create(dto: CreateEventDto): Promise<Event> // Admin only
  async findAll(query: QueryEventDto): Promise<PaginatedResponse<Event>>
  async findOne(id: string): Promise<Event>
  async findBySlug(slug: string): Promise<Event>
  async update(id: string, dto: UpdateEventDto): Promise<Event> // Admin only
  async delete(id: string): Promise<void> // Soft delete, Admin only
  ```

- [ ] Auto slug generation:
  ```typescript
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  ```

- [ ] Status management (DRAFT, PUBLISHED, CANCELLED)
- [ ] Date validation (startTime < endTime)
- [ ] Pagination:
  ```typescript
  async findAll(query: QueryEventDto) {
    const { page = 1, limit = 10, status, search } = query;
    
    const queryBuilder = this.eventRepository.createQueryBuilder('event');
    
    if (status) {
      queryBuilder.andWhere('event.status = :status', { status });
    }
    
    if (search) {
      queryBuilder.andWhere(
        '(event.name ILIKE :search OR event.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    
    return { items, total, page, limit };
  }
  ```

**Endpoints**:
- `POST /events` (Admin)
- `GET /events` (Public)
- `GET /events/:id` (Public)
- `GET /events/slug/:slug` (Public)
- `PUT /events/:id` (Admin)
- `DELETE /events/:id` (Admin)

**Tests**: 80%+ coverage
- [ ] Unit tests cho EventsService
- [ ] Integration tests
- [ ] Admin guard tests

**Commit**:
```bash
git commit -m "feat(events): implement events management

- Events CRUD operations
- Slug generation
- Status management
- Pagination and search
- Admin authorization
- Tests included (80%+ coverage)"
```

#### Week 5-6: Ticket Types
**Branch**: `feature/hoang19/ticket-types`

**Tasks**:
- [ ] Implement TicketTypesService:
  ```typescript
  async create(dto: CreateTicketTypeDto): Promise<TicketType> // Admin only
  async findByEvent(eventId: string): Promise<TicketType[]>
  async findOne(id: string): Promise<TicketType>
  async update(id: string, dto: UpdateTicketTypeDto): Promise<TicketType>
  async checkAvailability(id: string): Promise<boolean>
  async delete(id: string): Promise<void>
  ```

- [ ] Validation:
  - quantity >= 0
  - price > 0
  - maxPerOrder <= quantity

- [ ] Link to events (foreign key)

**Endpoints**:
- `POST /ticket-types` (Admin)
- `GET /ticket-types/event/:eventId` (Public)
- `GET /ticket-types/:id` (Public)
- `PUT /ticket-types/:id` (Admin)
- `DELETE /ticket-types/:id` (Admin)

**Tests**: 80%+ coverage

**Commit**:
```bash
git commit -m "feat(tickets): implement ticket types management

- Ticket types CRUD
- Link to events
- Availability checking
- Validation (quantity, price)
- Tests included (80%+ coverage)"
```

**Deliverables**:
- ✅ Events CRUD complete
- ✅ Ticket Types CRUD complete
- ✅ Pagination working
- ✅ Admin features
- ✅ Tests: 80%+ coverage

---

### 💳 HOÀNG-20 - Orders + Payments + Admin (Week 3-6)

**Priority**: 🔴 CRITICAL PATH

#### Week 3-4: Complete Booking Flow ⭐⭐⭐
**Branch**: `feature/hoang20/orders-payment`

**Tasks**:
- [ ] Implement OrdersService:
  ```typescript
  async completeBooking(
    userId: string,
    dto: CompleteBookingDto
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    
    try {
      // 1. Verify reservation exists & not expired
      const reservation = await queryRunner.manager.findOne(OrderReservation, {
        where: { 
          userId, 
          ticketTypeId: dto.ticketTypeId, 
          status: 'ACTIVE' 
        }
      });
      
      if (!reservation) {
        throw new BadRequestException('No active reservation found');
      }
      
      if (new Date() > reservation.expiresAt) {
        throw new BadRequestException('Reservation expired');
      }
      
      // 2. Create Order
      const totalAmount = reservation.quantity * reservation.unitPrice;
      const order = await queryRunner.manager.save(Order, {
        userId,
        totalAmount,
        status: 'PENDING'
      });
      
      // 3. Create OrderItem
      await queryRunner.manager.save(OrderItem, {
        orderId: order.id,
        ticketTypeId: dto.ticketTypeId,
        quantity: reservation.quantity,
        unitPrice: reservation.unitPrice
      });
      
      // ⭐ 4. Create Payment (SUCCESS immediately - Phase 1)
      await queryRunner.manager.save(Payment, {
        orderId: order.id,
        amount: totalAmount,
        paymentMethod: dto.paymentMethod,
        status: 'SUCCESS',
        paymentTime: new Date(),
        transactionId: `TXN_${Date.now()}`
      });
      
      // 5. Mark reservation COMPLETED
      reservation.status = 'COMPLETED';
      await queryRunner.manager.save(reservation);
      
      await queryRunner.commitTransaction();
      
      // 6. Trigger async ticket generation
      this.ticketsService.generateTicketsAsync(order.id);
      
      return order;
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  
  async getMyOrders(userId: string, query: QueryOrdersDto)
  async getOrderDetails(orderId: string, userId: string)
  ```

**Endpoints**:
- `POST /orders/complete`
- `GET /orders/my`
- `GET /orders/:id`

**Tests**: 90%+ coverage (critical path)
- [ ] Unit tests
- [ ] E2E test complete booking flow
- [ ] Transaction rollback tests
- [ ] Error scenarios

**Commit**:
```bash
git commit -m "feat(orders): implement complete booking flow

- Complete booking transaction
- Create order + order items
- Create payment (direct DB)
- Mark reservation completed
- Trigger ticket generation
- E2E tests (90%+ coverage)"
```

#### Week 5: Payments Module
**Branch**: `feature/hoang20/payments`

**Tasks**:
- [ ] Implement PaymentsService:
  ```typescript
  async getPaymentByOrder(orderId: string): Promise<Payment>
  async getPaymentHistory(userId: string): Promise<Payment[]>
  ```

**Endpoints**:
- `GET /payments/order/:orderId`
- `GET /payments/my`

**Tests**: 80%+ coverage

**Commit**:
```bash
git commit -m "feat(payments): implement payment module

- Direct database payment (Phase 1)
- Multiple payment methods
- Transaction ID generation
- Payment history
- Tests (80%+ coverage)"
```

#### Week 6: Admin Orders
**Branch**: `feature/hoang20/admin-orders`

**Tasks**:
- [ ] Admin endpoints:
  ```typescript
  @Get('admin/orders')
  @Roles('admin')
  async getAllOrders(@Query() query: AdminQueryDto)
  
  @Get('admin/orders/revenue')
  @Roles('admin')
  async getRevenue(@Query() query: RevenueQueryDto)
  ```

- [ ] Revenue reports:
  - Daily/Weekly/Monthly revenue
  - Revenue by event
  - Payment method breakdown

**Endpoints**:
- `GET /admin/orders`
- `GET /admin/orders/revenue`
- `GET /admin/orders/:id`

**Tests**: 80%+ coverage

**Commit**:
```bash
git commit -m "feat(orders): add admin orders and revenue features

- Admin view all orders
- Revenue reports
- Payment statistics
- Tests (80%+ coverage)"
```

**Deliverables**:
- ✅ Complete booking flow working
- ✅ Payment saved to DB
- ✅ Order management complete
- ✅ Admin features ready
- ✅ Tests: 90%+ coverage

---

### 🎟️ KHÁNH - Tickets + Bookings API + Admin (Week 3-6)

**Priority**: 🔴 HIGH

#### Week 3-4: Tickets Generation
**Branch**: `feature/khanh/tickets`

**Tasks**:
- [ ] Implement TicketsService:
  ```typescript
  async generateTicketsAsync(orderId: string): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderItems', 'orderItems.ticketType']
    });
    
    for (const item of order.orderItems) {
      for (let i = 0; i < item.quantity; i++) {
        await this.ticketRepository.save({
          orderId: order.id,
          ticketTypeId: item.ticketTypeId,
          ticketCode: this.generateTicketCode(),
          qrData: ticketCode, // Same as code, QR generated on-demand
          status: 'ACTIVE'
        });
      }
    }
    
    // Update order status
    await this.orderRepository.update(order.id, { status: 'PAID' });
  }
  
  generateTicketCode(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `TKT-${timestamp}-${random}`.toUpperCase();
  }
  
  async validateTicket(code: string): Promise<Ticket>
  async useTicket(code: string): Promise<Ticket>
  async getUserTickets(userId: string): Promise<Ticket[]>
  ```

- [ ] QR code generation (on-demand):
  ```typescript
  import * as QRCode from 'qrcode';
  
  @Get(':id/qr')
  async getTicketQR(@Param('id') id: string): Promise<string> {
    const ticket = await this.ticketsService.findOne(id);
    const qrCodeBase64 = await QRCode.toDataURL(ticket.ticketCode);
    return qrCodeBase64; // Return base64 for Postman testing
  }
  ```

**Endpoints**:
- `GET /tickets/my`
- `GET /tickets/:id`
- `GET /tickets/:id/qr` (QR code base64)
- `POST /tickets/:id/validate`
- `POST /tickets/:id/use`

**Tests**: 80%+ coverage
- [ ] Unit tests
- [ ] Ticket code uniqueness tests
- [ ] QR code generation tests

**Commit**:
```bash
git commit -m "feat(tickets): implement ticket generation system

- Async ticket generation
- Unique ticket codes
- QR code generation (on-demand)
- Ticket validation
- Tests (80%+ coverage)"
```

#### Week 5-6: Bookings API + Admin
**Branch**: `feature/khanh/bookings-api`

**Tasks**:
- [ ] Implement BookingsController:
  ```typescript
  @Get('my')
  async getMyBookings(
    @CurrentUser() user: User,
    @Query() query: QueryBookingsDto
  ): Promise<PaginatedResponse<Order>>
  
  @Get(':id')
  async getBookingDetails(
    @Param('id') id: string,
    @CurrentUser() user: User
  ): Promise<OrderDetailResponse>
  ```

- [ ] Pagination & filters (status, date range)
- [ ] Admin bookings management
- [ ] Booking statistics

**Endpoints**:
- `GET /bookings/my`
- `GET /bookings/:id`
- `GET /admin/bookings` (Admin)
- `GET /admin/bookings/stats` (Admin)

**Tests**: 80%+ coverage

**Commit**:
```bash
git commit -m "feat(bookings): add bookings API and admin features

- User bookings with pagination
- Booking details
- Admin bookings management
- Booking statistics
- Tests (80%+ coverage)"
```

**Deliverables**:
- ✅ Tickets generation working
- ✅ QR codes on-demand
- ✅ Bookings API complete
- ✅ Admin features
- ✅ Tests: 80%+ coverage

---

## 📊 Feature Ownership Summary

| Feature | Owner | Week | Tests |
|---------|-------|------|-------|
| Foundation + Auth | Tùng | 1-2 | 80%+ |
| Reservations | Tùng | 3-4 | 90%+ |
| Events | Hoàng-19 | 3-4 | 80%+ |
| Ticket Types | Hoàng-19 | 5-6 | 80%+ |
| Orders + Payment | Hoàng-20 | 3-4 | 90%+ |
| Admin Orders | Hoàng-20 | 5-6 | 80%+ |
| Tickets | Khánh | 3-4 | 80%+ |
| Bookings API | Khánh | 5-6 | 80%+ |

**Total**: 4 người × 25% = 100%

---

## 🔥 Critical Path

```
Week 1-2: Foundation (Tùng SOLO)
  ↓
Week 3-4: Core Features ⭐⭐⭐ CRITICAL
  ├─ Tùng: Reservations MUST COMPLETE
  ├─ Hoàng-19: Events MUST COMPLETE
  ├─ Hoàng-20: Orders + Payment MUST COMPLETE
  └─ Khánh: Tickets MUST COMPLETE
  
  End of Week 4 = MVP Working!
  ↓
Week 5-6: Secondary Features + Admin
  ├─ Tùng: Optimization + Support
  ├─ Hoàng-19: Ticket Types
  ├─ Hoàng-20: Admin Orders + Revenue
  └─ Khánh: Bookings API + Admin
  ↓
Week 6: Team Integration Testing
```

---

## 📋 Daily Workflow

### Morning (All)
```bash
git checkout develop
git pull origin develop
git checkout feature/<name>/<feature>
git rebase develop
```

### During Day
```bash
# Commit frequently
git add .
git commit -m "feat(module): description"
git push origin feature/<name>/<feature>
```

### End of Day
- [ ] Push all code
- [ ] Update team:
  ```
  ✅ Today: Completed ReservationsService
  🎯 Tomorrow: Write tests
  🚧 Blockers: None
  ```

---

## 🎯 Success Criteria

### Week 2 Complete:
- [ ] Tùng: Foundation + Auth ready
- [ ] Team: Can start features

### Week 4 Complete (MVP):
- [ ] Events CRUD working
- [ ] Ticket Types CRUD working
- [ ] Reservations working (zero race conditions) ⭐
- [ ] Complete booking flow working ⭐
- [ ] Payment saving to DB ⭐
- [ ] Tickets generating ⭐

### Week 6 Complete (Production Ready):
- [ ] All CRUD endpoints working
- [ ] Admin features complete
- [ ] 80%+ test coverage overall
- [ ] Integration test passing
- [ ] Performance < 2s
- [ ] Load test: 200 concurrent users
- [ ] Documentation complete (Swagger + Postman)

---

## 📚 Testing Strategy

### Each Person Tests Own Code

**Tùng**:
- Unit tests (90%+ coverage - critical path)
- E2E reservation flow
- Concurrent requests (100+)
- Load testing với k6

**Hoàng-19**:
- Unit tests (80%+ coverage)
- Integration tests
- API endpoint tests

**Hoàng-20**:
- Unit tests (90%+ coverage - critical path)
- E2E complete booking flow
- Transaction tests

**Khánh**:
- Unit tests (80%+ coverage)
- Integration tests
- QR code tests

### Team Integration Test (Week 6)
- [ ] Complete E2E: Register → Login → View Events → Reserve → Book → Pay → Get Tickets
- [ ] Tùng + Hoàng-20 pair testing (Critical path)
- [ ] Performance testing

---

## 💬 Communication

**Daily Standup**: 9:00 AM (15 min)

**Code Review**:
- Tùng reviews: Hoàng-20 (Orders - critical dependency)
- Hoàng-19 reviews: Hoàng-20
- Hoàng-20 reviews: Khánh
- Khánh reviews: Hoàng-19

**Pair Programming**:
- Week 4: Tùng + Hoàng-20 (Reservations ↔ Orders integration)
- Week 6: All team (Integration testing)

---

## 📞 Who to Ask

- **Foundation/Architecture**: Tùng
- **Database/Performance**: Tùng
- **Events/Ticket Types**: Hoàng-19
- **Orders/Payments**: Hoàng-20
- **Tickets/Bookings**: Khánh
- **Git Issues**: Tùng

---

**Repository**: https://github.com/caiquangtung/CNLTHD

**Team**: Tùng, Hoàng-19, Hoàng-20, Khánh

**Strategy**: Foundation first, balanced features, each tests own code

**Duration**: 6 weeks to MVP

**Let's build! 🚀**
