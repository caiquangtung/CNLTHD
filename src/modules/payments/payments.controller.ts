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
import { VnpayService } from './vnpay.service';
import { CompletePaymentDto } from './dto/complete-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { mapPaymentToResponseDto } from './mappers/payment.mapper';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators';
import { Response } from 'express';
import { PaymentStatus } from './entities';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly vnpayService: VnpayService,
    ) { }

    /**
     * VNPay return URL - Browser redirect sau khi user thanh toán xong
     * Chỉ dùng để show thông báo, KHÔNG update DB (để IPN làm)
     */
    @Get('vnpay-return')
    @Public()
    @ApiOperation({ summary: 'VNPay return redirect (user browser redirect, do not update DB)' })
    async vnpayReturn(
        @Query() query: Record<string, string>,
        @Res() res: Response,
    ): Promise<void> {
        const result = this.vnpayService.verifyReturnUrl(query);
        const frontendUrl = 'http://localhost:3001';

        if (!result.isValid) {
            return res.redirect(`${frontendUrl}/payment-failed?orderId=${result.orderId}&reason=invalid_signature`);
        }

        if (result.isSuccess) {
            // Chỉ redirect, IPN sẽ update DB
            return res.redirect(`${frontendUrl}/payment-success?orderId=${result.orderId}&transactionId=${result.transactionId}`);
        }

        return res.redirect(`${frontendUrl}/payment-failed?orderId=${result.orderId}&reason=payment_failed`);
    }

    /**
     * VNPay IPN callback - Server webhook từ VNPay (xử lý business logic chính)
     * VNPay sẽ gửi POST request tới đây, gọi lần đầu khi payment thành công
     */
    @Post('vnpay-ipn')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'VNPay IPN webhook (server-to-server callback)' })
    async vnpayIpn(@Query() query: Record<string, string>): Promise<{ RspCode: string; RespMessage: string }> {
        const result = this.vnpayService.verifyReturnUrl(query);

        // VNPay cần response ngay, nên kiểm tra signature trước
        if (!result.isValid) {
            return { RspCode: '97', RespMessage: 'Chữ ký không hợp lệ' };
        }

        // Nếu không thành công, báo lại VNPay
        if (!result.isSuccess) {
            return { RspCode: '01', RespMessage: 'Thanh toán thất bại' };
        }

        try {
            const payment = await this.paymentsService.findByOrderId(result.orderId);

            // Chỉ update nếu chưa complete (tránh race condition)
            if (payment.status !== PaymentStatus.SUCCESS) {
                await this.paymentsService.completePayment(payment.id, {
                    transactionId: result.transactionId,
                });
            }

            // Return 200 để VNPay biết đã nhận
            return { RspCode: '00', RespMessage: 'OK' };
        } catch (error) {
            return { RspCode: '99', RespMessage: error.message };
        }
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
