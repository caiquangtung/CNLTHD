# Quyết Định Kỹ Thuật - Technical Decisions

> Document này ghi lại các quyết định kỹ thuật quan trọng và lý do đằng sau chúng.

---

## 🎯 Tổng Quan Chiến Lược

### Quyết Định Chính: 3-Phase Approach

**Quyết định**: Phát triển theo 3 giai đoạn thay vì build full stack ngay từ đầu

**Lý do**:
1. ✅ **Faster Time to Market**: MVP trong 8 tuần thay vì 6 tháng
2. ✅ **Lower Risk**: Test thị trường trước khi invest nhiều
3. ✅ **Learn & Adapt**: Có data thực tế để quyết định scale
4. ✅ **Cost Effective**: Chi phí thấp khi bắt đầu ($40-90/month)
5. ✅ **Simpler Stack**: Dễ maintain và debug

**Trade-offs**:
- ⚠️ Sẽ cần refactor khi scale
- ⚠️ Giới hạn performance ở giai đoạn đầu
- ⚠️ Không support multi-region ngay

---

## 📊 Giai Đoạn 1: Chỉ NestJS + PostgreSQL

### 1.1 Tại Sao KHÔNG Dùng Redis Ngay?

**Quyết định**: Không dùng Redis trong giai đoạn 1

**Lý do**:
1. ✅ **Complexity**: Redis thêm 1 layer phức tạp
2. ✅ **Cost**: Thêm $10-30/month
3. ✅ **Overhead**: Setup, maintain, monitor Redis
4. ✅ **Not Needed**: In-memory cache đủ cho 500-1,000 users
5. ✅ **KISS Principle**: Keep It Simple, Stupid

**Khi nào thêm Redis**:
- Traffic > 500 concurrent users
- Response time > 2s
- Cần scale horizontal (multiple instances)
- Cần distributed cache

**Alternative trong Phase 1**:
```typescript
// In-memory cache với Map
private cache = new Map<string, CacheEntry>();
```

---

### 1.2 Tại Sao KHÔNG Dùng Bull Queue Ngay?

**Quyết định**: Không dùng Bull Queue trong giai đoạn 1

**Lý do**:
1. ✅ **Dependencies**: Bull cần Redis
2. ✅ **Complexity**: Job queue architecture phức tạp
3. ✅ **Not Critical**: Async operations không critical cho MVP
4. ✅ **Workaround**: Có thể dùng Promise.all() cho simple tasks

**Khi nào thêm Bull**:
- Có nhiều long-running tasks
- Cần retry mechanism phức tạp
- Cần job priority
- Cần job monitoring

**Alternative trong Phase 1**:
```typescript
// Simple async processing
Promise.all([
  this.sendEmail(orderId),
  this.generateTickets(orderId),
]).catch(error => this.logger.error(error));
```

---

### 1.3 Tại Sao KHÔNG Dùng Microservices?

**Quyết định**: Monolithic architecture trong giai đoạn 1

**Lý do**:
1. ✅ **Simplicity**: Monolith đơn giản hơn nhiều
2. ✅ **Development Speed**: Deploy nhanh, debug dễ
3. ✅ **No Network Overhead**: Không có inter-service communication
4. ✅ **Transactions**: ACID transactions dễ dàng trong monolith
5. ✅ **Small Team**: Không cần nhiều người

**Khi nào chuyển sang Microservices**:
- Team > 10 người
- Different scaling requirements cho từng service
- Need independent deployment
- Clear bounded contexts

---

## 🔒 Race Condition Prevention

### 2.1 Pessimistic Locking (Primary Strategy)

**Quyết định**: Dùng pessimistic locking (`SELECT ... FOR UPDATE`) làm primary strategy

**Lý do**:
1. ✅ **Simple**: Dễ hiểu, dễ implement
2. ✅ **Reliable**: PostgreSQL handle locks rất tốt
3. ✅ **No Retries**: Không cần retry logic
4. ✅ **ACID**: Transaction safety đầy đủ

**Implementation**:
```typescript
const ticketType = await queryRunner.manager.findOne(TicketType, {
  where: { id: ticketTypeId },
  lock: { mode: 'pessimistic_write' }, // FOR UPDATE
});
```

**Trade-offs**:
- ⚠️ Lock contention khi traffic cao
- ⚠️ Có thể deadlock nếu không cẩn thận
- ⚠️ Performance impact khi concurrent users cao

---

### 2.2 Optimistic Locking (Backup Strategy)

**Quyết định**: Implement optimistic locking với version column như backup

**Lý do**:
1. ✅ **Fallback**: Khi pessimistic locking có issues
2. ✅ **Performance**: Tốt hơn cho read-heavy workloads
3. ✅ **Learning**: Hiểu cả 2 strategies

**Implementation**:
```typescript
@VersionColumn()
version: number;

// Update với version check
const result = await queryRunner.manager.update(
  TicketType,
  { id: ticketTypeId, version: ticketType.version },
  { availableQuantity: newQuantity, version: version + 1 }
);

if (result.affected === 0) {
  // Conflict - retry
}
```

**Khi nào dùng**:
- Read-heavy workloads
- Conflicts ít xảy ra
- Có thể afford retry logic

---

## 💾 Database Decisions

### 3.1 PostgreSQL vs MySQL

**Quyết định**: PostgreSQL 15+

**Lý do**:
1. ✅ **JSONB**: Native JSON support tốt hơn
2. ✅ **Full-text Search**: GIN indexes
3. ✅ **Transaction Isolation**: Tốt hơn MySQL
4. ✅ **Extensions**: pg_trgm, uuid-ossp
5. ✅ **Community**: Active development

**Trade-offs**:
- ⚠️ Hơi phức tạp hơn MySQL
- ⚠️ Configuration phức tạp hơn

---

### 3.2 UUID vs Auto-increment ID

**Quyết định**: Dùng UUID cho tất cả primary keys

**Lý do**:
1. ✅ **Security**: Không lộ số lượng records
2. ✅ **Distributed**: Dễ merge data từ nhiều sources
3. ✅ **No Collision**: Không bao giờ conflict
4. ✅ **URL-safe**: Có thể dùng trong URLs

**Trade-offs**:
- ⚠️ 16 bytes vs 4 bytes (storage)
- ⚠️ Index performance hơi kém hơn
- ⚠️ Khó debug (không readable)

```sql
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
```

---

### 3.3 Indexes Strategy

**Quyết định**: Add indexes aggressive cho tất cả foreign keys và query columns

**Indexes được tạo**:
- All foreign keys
- Status columns
- Timestamp columns (created_at, expires_at)
- Composite indexes cho common queries
- Partial indexes (WHERE available_quantity > 0)
- Full-text search indexes (GIN)

**Lý do**:
1. ✅ **Performance**: Query nhanh hơn nhiều
2. ✅ **Cheap**: Storage rẻ
3. ✅ **Worth It**: Trade storage for speed

**Trade-offs**:
- ⚠️ Slower writes (minimal impact)
- ⚠️ More storage (acceptable)

---

## ⏱️ Timeout & Reservation Strategy

### 4.1 Order Reservations Table

**Quyết định**: Tạo bảng `order_reservations` riêng thay vì dùng trực tiếp `orders`

**Lý do**:
1. ✅ **Separation of Concerns**: Reservation vs Order
2. ✅ **Easy Cleanup**: Scheduled job đơn giản
3. ✅ **Audit Trail**: Track reservation history
4. ✅ **Flexibility**: Có thể extend features

**Flow**:
```
1. User clicks "Đặt vé"
2. Create reservation (expires in 10 min)
3. User fills form + payment info
4. Convert reservation → order
5. If timeout: Auto release
```

**Alternative rejected**:
- ❌ Lock trong `orders` table → Phức tạp
- ❌ Lock trong `ticket_types` → Không scale

---

### 4.2 Reservation Timeout: 10 Minutes

**Quyết định**: Reservation expires sau 10 phút

**Lý do**:
1. ✅ **User Experience**: Đủ thời gian điền form
2. ✅ **Inventory Release**: Không giữ vé quá lâu
3. ✅ **Industry Standard**: Ticketing sites thường dùng 10-15 phút

**Cleanup Strategy**:
- Scheduled job mỗi 5 phút
- Release expired reservations
- Return quantity về ticket_types

```typescript
@Cron(CronExpression.EVERY_5_MINUTES)
async releaseExpiredReservations() {
  // Release logic
}
```

---

## 🔄 Transaction Management

### 5.1 Transaction Isolation Level

**Quyết định**: Dùng default isolation level (READ COMMITTED)

**Lý do**:
1. ✅ **Good Enough**: Đủ cho most cases
2. ✅ **Performance**: Không lock quá nhiều
3. ✅ **PostgreSQL Default**: Well-tested

**Khi nào dùng SERIALIZABLE**:
- Critical financial transactions
- Absolutely no conflicts allowed
- Can afford performance hit

---

### 5.2 QueryRunner vs @Transactional

**Quyết định**: Dùng QueryRunner thay vì @Transactional decorator

**Lý do**:
1. ✅ **Explicit Control**: Biết chính xác khi nào transaction start/end
2. ✅ **Lock Support**: Có thể dùng pessimistic locking
3. ✅ **Error Handling**: Fine-grained control
4. ✅ **TypeORM Recommended**: Official recommendation

```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();

try {
  // operations
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
} finally {
  await queryRunner.release();
}
```

---

## 📦 Caching Strategy

### 6.1 In-Memory Cache (Phase 1)

**Quyết định**: Dùng simple Map-based cache trong phase 1

**Cached Data**:
- ✅ Event listings (TTL: 5 minutes)
- ✅ Event details (TTL: 5 minutes)
- ❌ KHÔNG cache ticket availability (thay đổi liên tục)
- ❌ KHÔNG cache user data (privacy)

**Lý do**:
1. ✅ **Simple**: Không cần dependencies
2. ✅ **Fast**: In-memory access
3. ✅ **Good Enough**: Cho 500-1,000 users

**Limitations**:
- ⚠️ Không share giữa instances
- ⚠️ Mất khi restart
- ⚠️ Phải tự quản lý TTL

---

## 🔧 Connection Pool Settings

**Quyết định**: Connection pool settings cho 500-1,000 concurrent users

```typescript
extra: {
  max: 20,        // Maximum connections
  min: 5,         // Minimum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}
```

**Lý do**:
- **max: 20**: Đủ cho workload, không overwhelm database
- **min: 5**: Keep warm connections
- **idleTimeout: 30s**: Release unused connections
- **connectionTimeout: 2s**: Fail fast

**Scaling Guide**:
- 1,000 users → max: 50
- 5,000 users → max: 100
- 10,000+ users → Read replicas

---

## 🚀 Deployment Strategy

### 7.1 Single Instance (Phase 1)

**Quyết định**: Deploy single instance trong phase 1

**Lý do**:
1. ✅ **Simple**: Dễ deploy, dễ debug
2. ✅ **Cost**: 1 server = rẻ
3. ✅ **No Complexity**: Không cần load balancer
4. ✅ **Good Enough**: Đủ cho 500-1,000 users

**When to scale horizontal**:
- Traffic > 1,000 concurrent
- Single instance CPU > 80%
- Need zero-downtime deployment

---

### 7.2 Docker Deployment

**Quyết định**: Dùng Docker từ đầu

**Lý do**:
1. ✅ **Reproducible**: Same environment everywhere
2. ✅ **Easy Deploy**: docker-compose up
3. ✅ **Industry Standard**: Widely adopted
4. ✅ **Easy Scale**: Có thể scale sau

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
  postgres:
    image: postgres:15-alpine
```

---

## 📈 Performance Targets

### Phase 1 Targets

| Metric | Target | How to Achieve |
|--------|--------|----------------|
| Response Time | < 2s | Indexes + connection pool |
| Concurrent Users | 500-1,000 | Pessimistic locking |
| Transactions/sec | 50-200 | PostgreSQL optimization |
| Error Rate | < 1% | Comprehensive error handling |
| Uptime | 99% | Monitoring + auto-restart |

---

## 🔍 Monitoring Strategy (Phase 1)

**Quyết định**: Simple logging trong phase 1, full monitoring ở phase 3

**Phase 1 Monitoring**:
- ✅ Application logs (Winston/NestJS logger)
- ✅ PostgreSQL slow query log
- ✅ Docker logs
- ✅ Basic health checks

**Phase 3 Monitoring** (Future):
- Prometheus + Grafana
- APM tools (DataDog/New Relic)
- Error tracking (Sentry)
- Log aggregation (ELK)

---

## 🎓 Lessons from Similar Systems

### What We Learned From:

1. **Ticketmaster**: Reservation timeout approach
2. **Eventbrite**: Multi-phase payment flow
3. **Shopee Flash Sale**: Pessimistic locking
4. **E-commerce Sites**: 10-minute cart timeout

### Anti-patterns to Avoid:

1. ❌ **No Locking**: Race conditions everywhere
2. ❌ **Optimistic Only**: Too many conflicts
3. ❌ **Long Reservations**: Inventory stuck
4. ❌ **Premature Optimization**: Redis/Queue too early
5. ❌ **No Timeout**: Dead reservations

---

## 📝 Decision Log Template

```markdown
## Decision: [Title]

**Date**: YYYY-MM-DD
**Status**: Accepted | Rejected | Deprecated
**Context**: Why we needed to make this decision
**Decision**: What we decided
**Consequences**: 
  - Positive: ...
  - Negative: ...
**Alternatives Considered**: ...
**Related Decisions**: Links to related decisions
```

---

## 🔄 Decision Review Schedule

- **Monthly**: Review phase 1 decisions
- **Quarterly**: Plan phase 2/3 decisions
- **When Traffic > Target**: Re-evaluate architecture

---

**Last Updated**: 2026-01-25
**Next Review**: End of Phase 1 (Week 8)
