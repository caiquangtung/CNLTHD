import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
    Req,
    Res,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CompletePaymentDto } from './dto/complete-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { mapPaymentToResponseDto } from './mappers/payment.mapper';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators';
import { Response } from 'express';
import { PaymentStatus, PaymentMethod } from './entities';
import { Logger } from '@nestjs/common';
import { PaymentGatewayFactory } from './gateways/payment-gateway.factory';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
    private readonly logger = new Logger(PaymentsController.name);

    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly gatewayFactory: PaymentGatewayFactory,
    ) { }

    /**
     * VNPay return URL - Browser redirect sau khi user thanh toán xong
     * Demo mode: Cập nhật DB ngay (production sẽ qua IPN)
     * 
     * IMPORTANT: All literal routes must come BEFORE parameter routes like :id
     */
    @Get('vnpay-return')
    @Public()
    @ApiOperation({ summary: 'VNPay return redirect - Demo mode: Update DB directly' })
    async vnpayReturn(
        @Query() query: Record<string, string>,
        @Res() res: Response,
    ): Promise<void> {
        const gateway = this.gatewayFactory.getGateway(PaymentMethod.BANK_TRANSFER);
        const result = gateway.verifyCallback(query);
        const frontendUrl = 'http://localhost:3001';

        // 1. Kiểm tra chữ ký
        if (!result.isValid) {
            return res.redirect(`${frontendUrl}/payment-failed?orderId=${result.orderId}&reason=invalid_signature`);
        }

        // 2. Nếu thanh toán thành công
        if (result.isSuccess) {
            try {
                const payment = await this.paymentsService.findByOrderId(result.orderId);

                // ✅ Verify amount match (prevent hacking)
                if (result.amount && result.amount !== Number(payment.amount)) {
                    this.logger.error(`❌ Amount mismatch: ${result.amount} vs ${payment.amount}`);
                    return res.redirect(`${frontendUrl}/payment-failed?reason=amount_mismatch`);
                }

                // ✅ Idempotency: chỉ update nếu PENDING
                if (payment.status === PaymentStatus.PENDING) {
                    await this.paymentsService.completePayment(payment.id, {
                        transactionId: result.transactionId,
                    });
                    this.logger.log(`✅ [DEMO] Payment ${payment.id} updated via gateway callback`);
                }

                return res.redirect(`${frontendUrl}/payment-success?orderId=${result.orderId}&transactionId=${result.transactionId}`);
            } catch (error) {
                this.logger.error(`❌ DB update error: ${error.message}`);
                return res.redirect(`${frontendUrl}/payment-failed?orderId=${result.orderId}&reason=db_error`);
            }
        }

        // 3. Trường hợp thanh toán thất bại
        return res.redirect(`${frontendUrl}/payment-failed?orderId=${result.orderId}&reason=payment_failed`);
    }

    /**
     * Get payment by Order ID
     */
    @Get('order/:orderId')
    @Public()
    @ApiOperation({ summary: 'Get payment by Order ID' })
    @ApiParam({ name: 'orderId', description: 'Order ID', example: '550e8400-e29b-41d4-a716-446655440000' })
    @ApiResponse({ status: 200, description: 'Payment details' })
    @ApiResponse({ status: 404, description: 'Payment not found' })
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
    @Public()
    @ApiOperation({ summary: 'Get payment by ID' })
    @ApiParam({ name: 'id', description: 'Payment ID', example: '550e8400-e29b-41d4-a716-446655440000' })
    @ApiResponse({ status: 200, description: 'Payment details' })
    @ApiResponse({ status: 404, description: 'Payment not found' })
    async findById(
        @Param('id', new ParseUUIDPipe()) id: string,
    ): Promise<PaymentResponseDto> {
        const payment = await this.paymentsService.findById(id);
        return mapPaymentToResponseDto(payment);
    }

    /**
     * Complete payment (mark as SUCCESS and update order status to PAID)
     * Dùng để test thủ công qua Swagger (không qua VNPay)
     */
    @Patch(':id/complete')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Complete payment manually (for testing)' })
    @ApiParam({ name: 'id', description: 'Payment ID' })
    @ApiBody({ type: CompletePaymentDto })
    @ApiResponse({ status: 200, description: 'Payment completed successfully' })
    @ApiResponse({ status: 400, description: 'Invalid payment status' })
    @ApiResponse({ status: 404, description: 'Payment not found' })
    async completePayment(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: CompletePaymentDto,
    ): Promise<PaymentResponseDto> {
        const payment = await this.paymentsService.completePayment(id, dto);
        return mapPaymentToResponseDto(payment);
    }

    /**
     * Refund payment (mark as REFUNDED and update order status to CANCELLED)
     */
    @Patch(':id/refund')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refund payment and cancel order' })
    @ApiParam({ name: 'id', description: 'Payment ID' })
    @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
    @ApiResponse({ status: 400, description: 'Invalid payment status' })
    @ApiResponse({ status: 404, description: 'Payment not found' })
    async refundPayment(
        @Param('id', new ParseUUIDPipe()) id: string,
    ): Promise<PaymentResponseDto> {
        const payment = await this.paymentsService.refundPayment(id);
        return mapPaymentToResponseDto(payment);
    }
}
