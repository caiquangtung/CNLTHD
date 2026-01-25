# 🚀 Quick Start Guide

> Get started in 5 minutes

---

## ⚡ Super Quick Start

```bash
# 1. Start PostgreSQL
docker-compose up -d postgres

# 2. Start app
npm run start:dev

# 3. Open Swagger
open http://localhost:3000/api/docs

# 4. Generate first module
nest g resource users
```

---

## 📋 Checklist

### Setup (Done ✅)
- [x] NestJS project initialized
- [x] Dependencies installed
- [x] Database config created
- [x] Environment variables set
- [x] Project structure created
- [x] Documentation complete

### Next (To Do)
- [ ] Start Docker Desktop
- [ ] Start PostgreSQL container
- [ ] Test app startup
- [ ] Generate Users module
- [ ] Create User entity
- [ ] Test Users CRUD endpoints

---

## 🎯 Week 1 Goals

### Day 1-2: Users Module
```bash
nest g resource users
# Edit: src/users/entities/user.entity.ts
# Edit: src/users/users.service.ts
# Test: http://localhost:3000/api/users
```

### Day 3-4: Auth Module
```bash
nest g module auth
nest g service auth
nest g controller auth
# Implement: JWT strategy
# Implement: Login/Register
```

### Day 5-7: Events Module
```bash
nest g resource events
# Implement: Event CRUD
# Add: Event validation
# Test: Create events
```

---

## 💳 Payment Implementation

**Phase 1 Strategy**: Lưu trực tiếp vào DB

```typescript
// In transaction
const payment = queryRunner.manager.create(Payment, {
  orderId: order.id,
  amount: totalAmount,
  paymentMethod: dto.paymentMethod,
  status: 'SUCCESS', // ⭐ Direct SUCCESS
  paymentTime: new Date(),
  transactionId: `TXN_${Date.now()}`,
});
```

See `PAYMENT_QUICK_REF.md` for full example.

---

## 📚 Docs to Read

**Must Read**:
1. SETUP_COMPLETE.md - Detailed guide
2. PAYMENT_QUICK_REF.md - Payment code
3. doc/IMPLEMENTATION_ROADMAP.md - 8-week plan

**Reference**:
4. doc/NESTJS_CLI_GUIDE.md - CLI commands
5. doc/DATABASE_SCHEMA.md - Database design
6. doc/PAYMENT_STRATEGY.md - Payment phases

---

## 🐛 Common Issues

### PostgreSQL not starting
```bash
# Check Docker is running
docker ps

# Restart container
docker-compose restart postgres
```

### Port 3000 in use
```bash
# Change in .env
PORT=3001
```

### Module generation fails
```bash
# Check you're in project root
pwd  # Should show: .../CNLTHD

# Try with full path
nest g resource src/users
```

---

## 🔥 Hot Commands

```bash
# Development
npm run start:dev

# Generate module
nest g resource <name>

# Database migrations
npm run migration:generate src/database/migrations/InitialMigration
npm run migration:run

# Tests
npm run test
npm run test:e2e

# Docker
docker-compose up -d postgres
docker-compose logs -f postgres
docker-compose down
```

---

## ✅ Success Checklist

Week 1 Complete When:
- [ ] Users CRUD working
- [ ] JWT authentication working
- [ ] Events CRUD working
- [ ] Swagger docs accessible
- [ ] All tests passing

Week 4 Complete When:
- [ ] Booking reservation working
- [ ] Order creation working
- [ ] Payment saving to DB ⭐
- [ ] Ticket generation working
- [ ] Complete flow tested

---

**Ready? Start with**: `docker-compose up -d postgres` 🚀
