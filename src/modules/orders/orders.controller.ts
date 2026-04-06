import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
    Query,
    ParseIntPipe,
    Req,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import {
    mapOrderToResponseDto,
    mapOrdersToResponseDto,
} from './mappers/order.mapper';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Public } from 'src/common/decorators';
import { PaginatedResponse } from 'src/common';
import { mapTicketTypesToResponseDto } from '../ticket-types/mappers/ticket-type.mapper';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService
    ) { }

    @Post()
    async create(
        @Body() createOrderDto: CreateOrderDto,
        @CurrentUser('id') userId: string,
    ): Promise<OrderResponseDto> {
        const order = await this.ordersService.create(createOrderDto, userId);
        return mapOrderToResponseDto(order);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    async findAll(
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    ): Promise<PaginatedResponse<OrderResponseDto>> {
        const result = await this.ordersService.findAllPaged(page, limit);
        const data = mapOrdersToResponseDto(result.items);

        return {
            items: data,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        };
    }

    @Get('my-orders')
    async findMyOrders(
        @CurrentUser('id') userId: string,
    ): Promise<OrderResponseDto[]> {
        const orders = await this.ordersService.findByUserId(userId);
        return mapOrdersToResponseDto(orders);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN)
    async findOne(
        @Param('id', new ParseUUIDPipe()) id: string,
    ): Promise<OrderResponseDto> {
        const order = await this.ordersService.findById(id);
        return mapOrderToResponseDto(order);
    }

    @Patch(':id/cancel')
    async cancelOrder(
        @Param('id', new ParseUUIDPipe()) id: string,
        @CurrentUser('id') userId: string,
    ): Promise<void> {
        await this.ordersService.cancelOrder(id, userId);
    }
}
