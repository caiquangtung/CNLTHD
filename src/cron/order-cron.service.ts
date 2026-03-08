import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrdersService } from '../modules/orders/orders.service';

@Injectable()
export class OrderCronService {
    private readonly logger = new Logger(OrderCronService.name);

    constructor(private readonly ordersService: OrdersService) { }

    /**
     * Chạy mỗi phút - cancel các order PENDING quá hạn thanh toán
     */
    @Cron(CronExpression.EVERY_MINUTE)
    async handleExpiredOrders() {
        const count = await this.ordersService.cancelExpiredOrders();
        if (count > 0) {
            this.logger.log(`Đã hủy ${count} đơn hàng quá hạn`);
        }
    }
}
