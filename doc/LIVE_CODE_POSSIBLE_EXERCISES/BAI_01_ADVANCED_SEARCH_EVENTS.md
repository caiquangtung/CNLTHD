# BAI 01 - ADVANCED SEARCH EVENTS

## 1) Muc tieu
Tao endpoint tim kiem su kien nang cao theo nhieu tieu chi, co pagination + sorting.

## 2) File can sua
- `src/modules/events/dto/advanced-search-events.dto.ts` (tao moi)
- `src/modules/events/events.controller.ts`
- `src/modules/events/events.service.ts`

## 3) Cac buoc lam chi tiet

### Buoc 1: Tao DTO query
Tao `AdvancedSearchEventsDto` voi cac field:
- `keyword?: string`
- `category?: string`
- `city?: string`
- `minPrice?: number`
- `maxPrice?: number`
- `fromDate?: string`
- `toDate?: string`
- `page = 1`, `limit = 10`
- `sortBy?: 'startTime' | 'price' | 'createdAt'`
- `sortOrder?: 'ASC' | 'DESC'`

Them validator:
- `@IsOptional() @IsString()` cho text
- `@IsOptional() @IsNumberString()` cho min/max
- `@IsOptional() @IsDateString()` cho date

### Buoc 2: Them route controller
Trong `events.controller.ts`:
- Them route `@Get('advanced-search')`
- Nhan `@Query() query: AdvancedSearchEventsDto`
- Goi `eventsService.advancedSearch(query)`

### Buoc 3: Viet logic QueryBuilder
Trong `events.service.ts`:
1. `const qb = this.eventRepo.createQueryBuilder('event')`
2. Filter dong:
   - keyword: `ILIKE` vao title/description
   - category, city: so khop bang
   - minPrice/maxPrice: dieu kien khoang gia
   - fromDate/toDate: dieu kien khoang thoi gian
3. Sort:
   - map `sortBy` sang cot hop le (tranh SQL injection)
4. Pagination:
   - `skip((page - 1) * limit).take(limit)`
5. Lay du lieu:
   - `const [items, total] = await qb.getManyAndCount()`

### Buoc 4: Chuan hoa response
Tra:
- `items`
- `meta: { page, limit, total, totalPages }`

## 4) Mau ham day du
```ts
async advancedSearch(query: AdvancedSearchEventsDto): Promise<{
  items: Event[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}> {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);
  const qb = this.eventRepo.createQueryBuilder('event');

  if (query.keyword) {
    qb.andWhere('(event.title ILIKE :keyword OR event.description ILIKE :keyword)', {
      keyword: `%${query.keyword}%`,
    });
  }
  if (query.category) {
    qb.andWhere('event.category = :category', { category: query.category });
  }
  if (query.city) {
    qb.andWhere('event.city = :city', { city: query.city });
  }
  if (query.minPrice) {
    qb.andWhere('event.price >= :minPrice', { minPrice: Number(query.minPrice) });
  }
  if (query.maxPrice) {
    qb.andWhere('event.price <= :maxPrice', { maxPrice: Number(query.maxPrice) });
  }
  if (query.fromDate) {
    qb.andWhere('event.startTime >= :fromDate', { fromDate: new Date(query.fromDate) });
  }
  if (query.toDate) {
    qb.andWhere('event.startTime <= :toDate', { toDate: new Date(query.toDate) });
  }

  const allowSortMap = {
    startTime: 'event.startTime',
    price: 'event.price',
    createdAt: 'event.createdAt',
  } as const;
  const sortColumn = allowSortMap[query.sortBy ?? 'startTime'] ?? 'event.startTime';
  const sortOrder = query.sortOrder === 'DESC' ? 'DESC' : 'ASC';

  qb.orderBy(sortColumn, sortOrder).skip((page - 1) * limit).take(limit);

  const [items, total] = await qb.getManyAndCount();
  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
```

## 5) Test nhanh
- Co data: query co `keyword` + `city` -> phai ra list.
- Khong co data: `items = []`.
- Sai param: `page=abc` -> validation loi 400.
