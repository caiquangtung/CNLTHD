# BAI 09 - THONG KE BOOKINGS THEO KHOANG NGAY

## 1) Muc tieu
Xay dung API thong ke booking cho admin theo bo loc ngay va status.

## 2) File can sua
- `src/modules/bookings/dto/query-booking-stats.dto.ts` (tao moi neu chua co)
- `src/modules/bookings/bookings.controller.ts`
- `src/modules/bookings/bookings.service.ts`

## 3) Cac buoc lam chi tiet

### Buoc 1: Tao DTO query
Field:
- `fromDate?: string`
- `toDate?: string`
- `status?: BookingStatus`
Validator:
- `@IsDateString` cho date
- `@IsEnum` cho status

### Buoc 2: Them endpoint admin
- Route: `GET /admin/bookings/stats`
- Guard + role admin.
- Nhan query dto.

### Buoc 3: Query aggregate
Trong service:
1. Tao base query theo date/status.
2. Tong booking: `COUNT(*)`.
3. Tong tien: `SUM(amount)`.
4. Breakdown theo status: `GROUP BY status`.

### Buoc 4: Tra response ro rang
Tra object:
- `totalBookings`
- `totalAmount`
- `byStatus: [{ status, count }]`

## 4) Mau ham day du
```ts
async getAdminBookingsStats(query: QueryBookingStatsDto): Promise<{
  totalBookings: number;
  totalAmount: number;
  byStatus: Array<{ status: BookingStatus; count: number }>;
}> {
  const baseQb = this.bookingRepo.createQueryBuilder('b');
  if (query.fromDate) {
    baseQb.andWhere('b.createdAt >= :fromDate', { fromDate: query.fromDate });
  }
  if (query.toDate) {
    baseQb.andWhere('b.createdAt <= :toDate', { toDate: query.toDate });
  }
  if (query.status) {
    baseQb.andWhere('b.status = :status', { status: query.status });
  }

  const summary = await baseQb
    .clone()
    .select('COUNT(b.id)', 'totalBookings')
    .addSelect('COALESCE(SUM(b.amount), 0)', 'totalAmount')
    .getRawOne();

  const byStatusRaw = await baseQb
    .clone()
    .select('b.status', 'status')
    .addSelect('COUNT(b.id)', 'count')
    .groupBy('b.status')
    .getRawMany();

  return {
    totalBookings: Number(summary.totalBookings ?? 0),
    totalAmount: Number(summary.totalAmount ?? 0),
    byStatus: byStatusRaw.map((x) => ({
      status: x.status as BookingStatus,
      count: Number(x.count),
    })),
  };
}
```

## 5) Test nhanh
- Khong truyen filter -> thong ke toan bo.
- Truyen date range + status -> so lieu giam dung nhu du kien.
