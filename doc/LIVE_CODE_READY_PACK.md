# LIVE CODE READY PACK (NestJS + TypeORM)

Muc tieu: mo file nay va live code duoc ngay, khong bi ngap.

## 1) Script mo dau 30 giay

"Em se lam theo flow: define API contract -> validate input DTO -> viet service logic + business check -> map response DTO -> them guard/role neu can -> test nhanh endpoint."

Neu bi hoi tai sao:
- Tach controller/service/mapper de de test va maintain.
- Dung ValidationPipe global de chan du lieu xau ngay tu boundary.
- Dung transaction + lock cho payment/inventory de tranh race condition.

## 2) Thu tu live code an toan (copy checklist nay)

1. Xac dinh module (`events`, `tickets`, `orders`, `payments`, ...)
2. Tao/sua DTO trong `dto/`
3. Tao/sua method service
4. Tao/sua mapper
5. Gan route vao controller
6. Them role guard neu endpoint nhay cam
7. Test nhanh (Swagger/Postman)

## 3) Boilerplate mau cho endpoint moi

### 3.1 DTO tao moi

```ts
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateSampleDto {
  @IsUUID()
  parentId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  note?: string;
}
```

### 3.2 DTO cap nhat

```ts
import { PartialType } from '@nestjs/swagger';
import { CreateSampleDto } from './create-sample.dto';

export class UpdateSampleDto extends PartialType(CreateSampleDto) {}
```

### 3.3 Service CRUD core

```ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SamplesService {
  constructor(
    @InjectRepository(SampleEntity)
    private readonly sampleRepo: Repository<SampleEntity>,
  ) {}

  async create(dto: CreateSampleDto): Promise<SampleEntity> {
    const existed = await this.sampleRepo.findOne({ where: { name: dto.name } });
    if (existed) throw new ConflictException(`Name "${dto.name}" already exists`);

    const entity = mapCreateSampleDtoToEntity(dto);
    return this.sampleRepo.save(entity);
  }

  async findById(id: string): Promise<SampleEntity> {
    const entity = await this.sampleRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Sample with id "${id}" not found`);
    return entity;
  }

  async update(id: string, dto: UpdateSampleDto): Promise<SampleEntity> {
    const entity = await this.findById(id);
    applyUpdateSampleDtoToEntity(entity, dto);
    return this.sampleRepo.save(entity);
  }
}
```

### 3.4 Mapper

```ts
export function mapCreateSampleDtoToEntity(dto: CreateSampleDto): SampleEntity {
  const entity = new SampleEntity();
  entity.parentId = dto.parentId;
  entity.name = dto.name;
  entity.note = dto.note ?? null;
  return entity;
}

export function applyUpdateSampleDtoToEntity(entity: SampleEntity, dto: UpdateSampleDto): SampleEntity {
  if (dto.parentId !== undefined) entity.parentId = dto.parentId;
  if (dto.name !== undefined) entity.name = dto.name;
  if (dto.note !== undefined) entity.note = dto.note;
  return entity;
}
```

### 3.5 Controller

```ts
import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';

@Controller('samples')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SamplesController {
  constructor(private readonly samplesService: SamplesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async create(@Body() dto: CreateSampleDto): Promise<SampleResponseDto> {
    const entity = await this.samplesService.create(dto);
    return mapSampleToResponseDto(entity);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<SampleResponseDto> {
    const entity = await this.samplesService.findById(id);
    return mapSampleToResponseDto(entity);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSampleDto,
  ): Promise<SampleResponseDto> {
    const entity = await this.samplesService.update(id, dto);
    return mapSampleToResponseDto(entity);
  }
}
```

## 4) Boilerplate auth + role (tra loi nhanh khi bi hoi)

- `JwtStrategy`: giai ma token va gan `request.user`.
- `JwtAuthGuard`: route nao `@Public()` thi bypass auth.
- `RolesGuard`: route co `@Roles(...)` moi check role.
- `@CurrentUser('id')`: lay user id nhanh trong controller.

Mau route private:

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Get('admin-only')
getAdminData() {
  return { ok: true };
}
```

## 5) Boilerplate transaction + lock (phan de ghi diem)

```ts
await this.dataSource.transaction(async (manager) => {
  const ticketType = await manager.findOne(TicketType, {
    where: { id: item.ticketTypeId },
    lock: { mode: 'pessimistic_write' },
  });

  if (!ticketType) throw new NotFoundException('Ticket type not found');
  if (ticketType.availableQuantity < item.quantity) {
    throw new BadRequestException('Insufficient inventory');
  }

  ticketType.availableQuantity -= item.quantity;
  await manager.save(ticketType);
});
```

Cau noi kem theo:
"Em lock row truoc khi tru ton kho de 2 request dong thoi khong tru trung."

## 6) Boilerplate soft delete + restore

```ts
async softRemove(id: string): Promise<void> {
  const entity = await this.findById(id);
  await this.repo.softRemove(entity);
}

async restore(id: string): Promise<Entity> {
  const deleted = await this.repo.findOne({ where: { id }, withDeleted: true });
  if (!deleted) throw new NotFoundException(`Entity with id "${id}" not found`);
  if (!deleted.deletedAt) throw new BadRequestException('Entity is not deleted');

  await this.repo.restore(id);
  return this.findById(id);
}
```

## 7) Loi thuong gap + cau chua nhanh

1. `must be a UUID`
   - Nguyen nhan: DTO dung `@IsUUID()`, payload gui string rong/khong dung format.
   - Chua: doi validation (`@IsOptional() @IsString()`), hoac gui dung UUID.

2. `invalid input syntax for type uuid: ""`
   - Nguyen nhan: DB column kieu uuid nhan `""`.
   - Chua: map `""` -> `null` trong mapper, va column de `nullable: true` neu cho phep rong.

3. `duplicate key value violates unique constraint`
   - Nguyen nhan: field unique bi trung.
   - Chua: check ton tai truoc khi save, throw `ConflictException`.

4. `ForbiddenException`
   - Nguyen nhan: role khong hop le.
   - Chua: check `@Roles(...)`, payload JWT role, va `RolesGuard`.

## 8) Test plan 5 phut truoc khi demo

- `POST` tao moi: payload hop le.
- `POST` duplicate: phai ra `409`.
- `GET by id`: id hop le va id khong ton tai.
- `PATCH`: update 1 field.
- `DELETE/restore`: xoa mem va khoi phuc.
- Route role-restricted: test user role khong du.

## 9) Cau tra loi phong van (ngan gon)

- Vi sao dung DTO + validator?
  - "De enforce input contract o boundary, fail fast, giam bug business layer."

- Vi sao can mapper?
  - "Tranh leak internal schema ra API va gom logic transform vao 1 cho."

- Vi sao transaction/lock?
  - "Dam bao tinh nhat quan du lieu khi co concurrency, dac biet order/payment."

- Vi sao soft delete?
  - "De audit/recover du lieu, tranh mat han ban ghi."

## 10) Lenh chay nhanh (neu can vua code vua verify)

- Dev: `npm run start:dev`
- Build: `npm run build`
- Migration run: `npm run migration:run`
- Migration revert: `npm run migration:revert`

---

Neu ban muon, buoc tiep theo minh co the tao them:
- 1 de live-code mau "Them endpoint Create Booking"
- 1 de live-code mau "Them payment callback idempotent"
- 1 de live-code mau "Them role moi + migration enum"
