import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class VnpayService {
    private readonly tmnCode: string;
    private readonly hashSecret: string;
    private readonly vnpUrl: string;
    private readonly returnUrl: string;

    constructor(private configService: ConfigService) {
        this.tmnCode = this.configService.get<string>('vnpay.tmnCode');
        this.hashSecret = this.configService.get<string>('vnpay.hashSecret');
        this.vnpUrl = this.configService.get<string>('vnpay.url');
        this.returnUrl = this.configService.get<string>('vnpay.returnUrl');
    }

    /**
     * Tạo URL thanh toán VNPay
     */
    buildPaymentUrl(orderId: string, amount: number, orderInfo: string, ipAddr: string): string {
        const now = new Date();
        const createDate = this.formatDate(now);
        const expireDate = this.formatDate(new Date(now.getTime() + 5 * 60 * 1000));

        const vnpParams: Record<string, string | number> = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: this.tmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: 'other',
            vnp_Amount: Math.round(amount * 100), // VNPay tính bằng xu
            vnp_ReturnUrl: this.returnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate,
            vnp_ExpireDate: expireDate,
        };

        // Sort params theo key
        const sortedKeys = Object.keys(vnpParams).sort();
        const queryParts: string[] = [];
        for (const key of sortedKeys) {
            const value = vnpParams[key];
            if (value !== '' && value !== undefined && value !== null) {
                queryParts.push(`${key}=${encodeURIComponent(String(value))}`);
            }
        }
        const signData = queryParts.join('&');

        const hmac = crypto
            .createHmac('sha512', this.hashSecret)
            .update(Buffer.from(signData, 'utf-8'))
            .digest('hex');

        return `${this.vnpUrl}?${signData}&vnp_SecureHash=${hmac}`;
    }

    /**
     * Verify callback từ VNPay (kiểm tra chữ ký)
     */
    verifyReturnUrl(query: Record<string, string>): { isValid: boolean; isSuccess: boolean; orderId: string; transactionId: string } {
        const vnpSecureHash = query['vnp_SecureHash'];
        const orderId = query['vnp_TxnRef'] || '';
        const transactionId = query['vnp_TransactionNo'] || '';

        // Xóa hash ra khỏi params để verify
        const params = { ...query };
        delete params['vnp_SecureHash'];
        delete params['vnp_SecureHashType'];

        const sortedKeys = Object.keys(params).sort();
        const queryParts: string[] = [];
        for (const key of sortedKeys) {
            const value = params[key];
            if (value !== '' && value !== undefined && value !== null) {
                queryParts.push(`${key}=${encodeURIComponent(String(value))}`);
            }
        }
        const signData = queryParts.join('&');

        const hmac = crypto
            .createHmac('sha512', this.hashSecret)
            .update(Buffer.from(signData, 'utf-8'))
            .digest('hex');

        const isValid = vnpSecureHash === hmac;
        const isSuccess = isValid && query['vnp_ResponseCode'] === '00';

        return { isValid, isSuccess, orderId, transactionId };
    }

    private formatDate(date: Date): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const mi = String(date.getMinutes()).padStart(2, '0');
        const s = String(date.getSeconds()).padStart(2, '0');
        return `${y}${m}${d}${h}${mi}${s}`;
    }
}
