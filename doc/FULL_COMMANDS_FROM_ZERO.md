# FULL COMMANDS FROM ZERO

## 0) Vao project

```powershell
cd D:\CCNLTHD\CNLTHD
```

## 1) Tao file env

```powershell
Copy-Item .env.example .env
```

## 2A) Tao DB bang Docker (khuyen nghi)

```powershell
docker-compose up -d postgres
docker-compose logs postgres
```

## 2B) Tao DB thu cong (neu khong dung Docker)

```powershell
createdb -h localhost -p 5432 -U postgres event_booking
```

## 3) Cai dependencies

```powershell
npm install
```

## 4) Chay migration

```powershell
npm run migration:run
```

## 5) Chay source (dev)

```powershell
npm run start:dev
```

## 6) Build + run production

```powershell
npm run build
npm run start:prod
```

## 7) Swagger

```powershell
start http://localhost:3000/api/docs
```

## 8) Migration commands khac

```powershell
npm run migration:show
npm run migration:revert
npm run migration:generate -- src/database/migrations/NewMigration
```

## 9) Reset database bang Docker

```powershell
docker compose down
docker volume rm cnlthd_postgres_data
docker compose up -d postgres
npm run migration:run
```

## 10) Test commands

```powershell
npm run test
npm run test:e2e
npm run test:cov
```
