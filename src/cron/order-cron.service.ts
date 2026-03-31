import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrdersService } from '../modules/orders/orders.service';

@Injectable()
export class OrderCronService {
    private readonly logger = new Logger(OrderCronService.name);

    constructor(
        private readonly ordersService: OrdersService,
    ) { }

    /**
     * Quét order quá hạn thanh toán và tự động chuyển trạng thái EXPIRED/CANCELLED.
     */
    @Cron(CronExpression.EVERY_MINUTE)
    async handleExpireOrders() {
        try {
            const count = await this.ordersService.cancelExpiredOrders();
            if (count > 0) {
                this.logger.log(`[CRON] Đã cập nhật hết hạn ${count} đơn hàng`);
            } else {
                this.logger.debug('[CRON] Không có đơn hàng nào hết hạn thanh toán trong lần quét này');
            }
        } catch (error) {
            this.logger.error(`[CRON] Lỗi trong handleExpireOrders: ${error.message}`);
        }
    }
}
