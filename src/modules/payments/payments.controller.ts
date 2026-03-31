import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    ParseUUIDPipe,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CompletePaymentDto } from './dto/complete-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { mapPaymentToResponseDto } from './mappers/payment.mapper';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, Roles } from '../../common/decorators';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
    ) { }

    /**
     * Get payment by Order ID
     */
    @Get('order/:orderId')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async findByOrderId(
        @Param('orderId', new ParseUUIDPipe()) orderId: string,
    ): Promise<PaymentResponseDto> {
        const payment = await this.paymentsService.findByOrderId(orderId);
        return mapPaymentToResponseDto(payment);
    }

    /**
     * Get payment by ID
     */
    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async findById(
        @Param('id', new ParseUUIDPipe()) id: string,
    ): Promise<PaymentResponseDto> {
        const payment = await this.paymentsService.findById(id);
        return mapPaymentToResponseDto(payment);
    }

    /**
     * Complete payment (mark as SUCCESS and update order status to PAID)
        * Dùng để test thủ công qua Swagger
     */
    @Patch(':id/complete')
    async completePayment(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: CompletePaymentDto,
        @CurrentUser('id') userId: string,
    ): Promise<PaymentResponseDto> {
        const payment = await this.paymentsService.completePayment(id, dto, userId);
        return mapPaymentToResponseDto(payment);
    }
}
