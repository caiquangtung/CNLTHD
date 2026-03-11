# Orders Module - Cấu Trúc Hoàn Chỉnh

Tài liệu này mô tả cấu trúc hoàn chỉnh của module Orders được tạo ra, bao gồm Order và OrderItem.

## Cấu Trúc Thư Mục

```
src/modules/orders/
├── dto/
│   ├── index.ts
│   ├── create-order.dto.ts
│   ├── update-order.dto.ts
│   ├── order-response.dto.ts
│   ├── create-order-item.dto.ts
│   ├── update-order-item.dto.ts
│   └── order-item-response.dto.ts
├── entities/
│   ├── index.ts
│   ├── order.entity.ts (đã có)
│   └── order-item.entity.ts (đã có)
├── mappers/
│   ├── index.ts
│   └── order.mapper.ts
├── orders.module.ts
├── orders.service.ts
├── orders.controller.ts
├── order-items.service.ts
└── order-items.controller.ts
```

## Các File Được Tạo Mới

### DTOs (Data Transfer Objects)

#### `create-order.dto.ts`
- Dùng để tạo Order mới
- Chứa status (tùy chọn) và danh sách orderItems
- Validation cho orderItems (phải là mảng, validate nested objects)

#### `update-order.dto.ts`
- Extend từ CreateOrderDto (PartialType)
- Cho phép cập nhật status của Order
- Tất cả trường đều tùy chọn

#### `order-response.dto.ts`
- DTO trả về khi API trả Order
- Chứa: id, userId, totalAmount, status, orderItems, createdAt, updatedAt

#### `create-order-item.dto.ts`
- Dùng để thêm item vào Order
- Trường: ticketTypeId, quantity, unitPrice
- Validation: quantity phải > 0, unitPrice phải > 0

#### `update-order-item.dto.ts`
- Extend từ CreateOrderItemDto (PartialType)
- Cho phép cập nhật thông tin item

#### `order-item-response.dto.ts`
- DTO trả về OrderItem
- Chứa: id, orderId, ticketTypeId, quantity, unitPrice, createdAt, updatedAt

### Mappers

#### `order.mapper.ts`
Chứa các hàm:
- `mapCreateOrderDtoToEntity()` - Convert DTO sang Entity khi tạo
- `applyUpdateOrderDtoToEntity()` - Apply thay đổi từ DTO lên Entity
- `mapOrderToResponseDto()` - Convert Entity sang Response DTO
- `mapOrdersToResponseDto()` - Convert mảng Entity sang Response DTOs
- `mapCreateOrderItemDtoToEntity()` - Convert OrderItem DTO sang Entity
- `applyUpdateOrderItemDtoToEntity()` - Apply thay đổi OrderItem

### Services

#### `orders.service.ts`
Quản lý Order với các method:

**CRUD Operations:**
- `create(dto, userId)` - Tạo Order mới với orderItems
  - Tính tổng tiền tự động
  - Validate orderItems không trống
  - Tự động lưu orderItems

- `findAll()` - Lấy tất cả Orders (với relations và sort)
- `findByUserId(userId)` - Lấy all Orders của user
- `findById(id)` - Lấy Order bằng ID
- `update(id, dto, userId)` - Cập nhật Order (kiểm tra quyền & trạng thái)
- `delete(id, userId)` - Xóa Order (chỉ PENDING)
- `updateStatus(id, status)` - Cập nhật status

**Validation:**
- Kiểm tra quyền sở hữu (chỉ user chủ sở hữu mới được thao tác)
- Không cho thay đổi status từ PAID hoặc CANCELLED
- Chỉ cho xóa PENDING orders
- Tự động tính tổng tiền từ orderItems

#### `order-items.service.ts`
Quản lý OrderItem với các method:

- `create(orderId, dto, userId)` - Thêm item vào Order
- `findByOrderId(orderId)` - Lấy tất cả items của Order
- `findById(id)` - Lấy item bằng ID
- `update(id, dto, userId)` - Cập nhật item + tính lại tổng tiền Order
- `delete(id, userId)` - Xóa item + tính lại tổng tiền Order

**Validation:**
- Kiểm tra Order tồn tại
- Kiểm tra quyền sở hữu Order
- Tự động recalculate tổng tiền của Order khi add/update/delete item

### Controllers

#### `orders.controller.ts`
Endpoints cho Orders:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Tạo Order mới |
| GET | `/orders` | Lấy tất cả Orders |
| GET | `/orders/my-orders` | Lấy Orders của current user |
| GET | `/orders/:id` | Lấy Order bằng ID |
| PATCH | `/orders/:id` | Cập nhật Order |
| DELETE | `/orders/:id` | Xóa Order |

**Guard:** JwtAuthGuard - tất cả endpoint đều yêu cầu đăng nhập

#### `order-items.controller.ts`
Endpoints cho OrderItems:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders/:orderId/items` | Thêm item vào Order |
| GET | `/orders/:orderId/items` | Lấy tất cả items của Order |
| GET | `/orders/:orderId/items/:id` | Lấy OrderItem bằng ID |
| PATCH | `/orders/:orderId/items/:id` | Cập nhật OrderItem |
| DELETE | `/orders/:orderId/items/:id` | Xóa OrderItem |

**Guard:** JwtAuthGuard - tất cả endpoint đều yêu cầu đăng nhập

### Module

#### `orders.module.ts`
- Import: TypeOrmModule.forFeature([Order, OrderItem])
- Controllers: OrdersController, OrderItemsController
- Providers: OrdersService, OrderItemsService
- Exports: OrdersService, OrderItemsService (để module khác có thể dùng)

## Entities (Đã Có Sẵn)

### `order.entity.ts`
```typescript
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export class Order extends BaseEntity {
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  
  // Relations
  user: User;
  orderItems: OrderItem[];
  payment: Payment;
  tickets: Ticket[];
}
```

### `order-item.entity.ts`
```typescript
export class OrderItem extends BaseEntity {
  orderId: string;
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
  
  // Relations
  order: Order;
  ticketType: TicketType;
}
```

## Quy Trình Tạo Order

1. **GET** `/orders/my-orders` - Xem orders cũ
2. **POST** `/orders` với body:
```json
{
  "orderItems": [
    {
      "ticketTypeId": "uuid-1",
      "quantity": 2,
      "unitPrice": 50.00
    },
    {
      "ticketTypeId": "uuid-2",
      "quantity": 1,
      "unitPrice": 100.00
    }
  ]
}
```
3. System tự động:
   - Tính totalAmount = (2 * 50) + (1 * 100) = 200
   - Tạo Order với status = "pending"
   - Lưu OrderItems

## Quy Trình Cập Nhật Order Items

1. **GET** `/orders/:orderId/items` - Xem items trong order
2. **PATCH** `/orders/:orderId/items/:itemId` - Cập nhật quantity/unitPrice
3. System tự động recalculate totalAmount của Order

## Quy Trình Xóa Order

- Chỉ có thể xóa Orders với status = "pending"
- Xóa Order sẽ tự động xóa tất cả OrderItems

## Notes Quan Trọng

- **User Authorization**: Tất cả operations được bảo vệ bởi JwtAuthGuard
- **User Ownership**: User chỉ có thể quản lý Orders của chính mình
- **Auto Calculation**: TotalAmount được tính tự động từ OrderItems
- **Status Management**: Không thể thay đổi status của PAID/CANCELLED Orders
- **Data Integrity**: Xóa OrderItem tự động cập nhật totalAmount của Order

## Tích Hợp với App Module

Thêm OrdersModule vào AppModule:
```typescript
@Module({
  imports: [
    // ... other modules
    OrdersModule,
  ],
})
export class AppModule {}
```

## Entities Liên Quan

Orders module tác dụng lên:
- **User** - thông qua userId trong Order
- **TicketType** - thông qua ticketTypeId trong OrderItem
- **Payment** - có OneToOne relationship
- **Ticket** - có OneToMany relationship
