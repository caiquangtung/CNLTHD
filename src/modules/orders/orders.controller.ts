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
        private readonly ordersService: OrdersService,
        private readonly vnpayService: VnpayService,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    // @Roles(UserRole.ADMIN)
    @Public()
    @ApiOperation({ summary: 'Create new order' })
    @ApiOkResponse({ type: OrderResponseDto })
    async create(
        @Body() createOrderDto: CreateOrderDto,
        @CurrentUser() userId: string,
        @Req() req: Request,
    ): Promise<OrderResponseDto> {
        const ipAddr = (req.headers['x-forwarded-for'] as string) || (req as any).socket?.remoteAddress || '127.0.0.1';
        const order = await this.ordersService.create(createOrderDto, userId, ipAddr);

    return order;
  }

    @Get()
    // @Roles(UserRole.ADMIN)
    @Public()
    @ApiOperation({ summary: 'Get all orders with pagination' })
    @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Items per page (default: 10)' })
    @ApiOkResponse({ type: OrderResponseDto })
    async findAll(
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    ): Promise<PaginatedResponse<OrderResponseDto>> {
        const result = await this.ordersService.findAllPaged(page, limit);
        const data = mapOrdersToResponseDto(result.data);


        return {
            items: data,
            total: result.total,
            page,
            limit,
            totalPages: Math.ceil(result.total / limit),
        };
    }

    @Get('my-orders')
    // @Roles(UserRole.USER)
    @Public()
    async findMyOrders(
        @CurrentUser() userId: string,
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
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cancel pending order and restore inventory' })
    async cancelOrder(
        @Param('id', new ParseUUIDPipe()) id: string,
        @CurrentUser() userId: string,
    ): Promise<void> {
        await this.ordersService.cancelOrder(id, userId);
    }
}
