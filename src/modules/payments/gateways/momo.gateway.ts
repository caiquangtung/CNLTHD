import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as https from 'https';
import { IPaymentGateway, VerifyCallbackResult } from './payment-gateway.interface';

@Injectable()
export class MomoGateway implements IPaymentGateway {
    private readonly partnerCode: string;
    private readonly accessKey: string;
    private readonly secretKey: string;
    private readonly apiUrl: string;
    private readonly ipnUrl: string;
    private readonly returnUrl: string;
    private readonly paymentTimeout: number; // minutes
    private readonly logger = new Logger(MomoGateway.name);

    constructor(private configService: ConfigService) {
        this.partnerCode = this.configService.get<string>('momo.partnerCode');
        this.accessKey = this.configService.get<string>('momo.accessKey');
        this.secretKey = this.configService.get<string>('momo.secretKey');
        this.apiUrl = this.configService.get<string>('momo.apiUrl');
        this.ipnUrl = this.configService.get<string>('momo.ipnUrl');
        this.returnUrl = this.configService.get<string>('momo.returnUrl');
        this.paymentTimeout = this.configService.get<number>('payment.timeout') || 5;

        this.logger.log(`Momo Gateway initialized - Partner Code: ${this.partnerCode}, Payment Timeout: ${this.paymentTimeout}min`);
    }

    /**
     * Tạo URL thanh toán Momo
     * Khác với VNPay: POST request tới API, không phải redirect URL
     */
    buildPaymentUrl(orderId: string, amount: number, orderInfo: string, ipAddr: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const now = new Date();
            const expireAt = new Date(now.getTime() + this.paymentTimeout * 60 * 1000); // Use config timeout
            const requestId = `${this.partnerCode}${Date.now()}`;
            const amountStr = Math.round(amount).toString();
            const extraData = '';
            const requestType = 'payWithMethod';
            const autoCapture = true;
            const lang = 'vi';

            // Build raw signature (order matters for Momo)
            // NOTE: expireAt is NOT included in signature (only in request body)
            const rawSignature =
                `accessKey=${this.accessKey}&amount=${amountStr}&extraData=${extraData}&ipnUrl=${this.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${this.returnUrl}&requestId=${requestId}&requestType=${requestType}`;

            this.logger.debug(`Raw Signature: ${rawSignature}`);

            // Sign with HMAC-SHA256
            const signature = crypto
                .createHmac('sha256', this.secretKey)
                .update(rawSignature)
                .digest('hex');

            this.logger.debug(`Generated Signature: ${signature}`);

            // Build request body
            const requestBody = JSON.stringify({
                partnerCode: this.partnerCode,
                partnerName: 'EventBooking',
                storeId: 'EventBooking',
                requestId,
                amount: amountStr,
                orderId,
                orderInfo,
                redirectUrl: this.returnUrl,
                ipnUrl: this.ipnUrl,
                lang,
                requestType,
                autoCapture,
                expireAt: Math.floor(expireAt.getTime() / 1000), // Unix timestamp in seconds
                extraData,
                signature,
            });

            this.logger.debug(`Request Body: ${requestBody}`);

            // Parse URL
            const url = new URL(this.apiUrl);
            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(requestBody),
                },
            };

            // Make HTTP request
            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        this.logger.log(`Momo response: ${JSON.stringify(response)}`);

                        if (response.resultCode !== 0) {
                            this.logger.error(`Momo error: ${response.message} (${response.resultCode})`);
                            reject(new BadRequestException(`Momo error: ${response.message}`));
                            return;
                        }

                        const paymentUrl = response.payUrl;
                        if (!paymentUrl) {
                            reject(new BadRequestException('No payment URL in Momo response'));
                            return;
                        }

                        this.logger.log(`Payment URL created for order ${orderId}: ${paymentUrl}`);
                        resolve(paymentUrl);
                    } catch (error) {
                        this.logger.error(`Error parsing Momo response: ${error.message}`);
                        reject(error);
                    }
                });
            });

            req.on('error', (error) => {
                this.logger.error(`Momo request error: ${error.message}`);
                reject(error);
            });

            // Send request
            req.write(requestBody);
            req.end();
        });
    }

    /**
     * Verify callback từ Momo (verify HMAC-SHA256 signature)
     * 
     * Signature format MUST be alphabetically sorted (a-z) per Momo docs:
     * https://developers.momo.vn/#/docs/en/aiov2/?id=payment-notification
     * 
     * Format (sorted a-z):
     * accessKey&amount&extraData&message&orderId&orderInfo&orderType&partnerCode&payType&requestId&responseTime&resultCode&transId
     */
    verifyCallback(query: Record<string, string>): VerifyCallbackResult {
        const momoSignature = query['signature'];
        const orderId = query['orderId'] || '';
        const transactionId = query['transId'] || '';
        const amount = query['amount'] ? Number(query['amount']) : undefined;
        const resultCode = query['resultCode'];

        // Build signature string with ALL fields, sorted alphabetically (a-z)
        // Per Momo official docs
        const rawSignature = [
            `accessKey=${this.accessKey}`,
            `amount=${query['amount'] || ''}`,
            `extraData=${query['extraData'] || ''}`,
            `message=${query['message'] || ''}`,
            `orderId=${query['orderId'] || ''}`,
            `orderInfo=${query['orderInfo'] || ''}`,
            `orderType=${query['orderType'] || ''}`,
            `partnerCode=${query['partnerCode'] || ''}`,
            `payType=${query['payType'] || ''}`,
            `requestId=${query['requestId'] || ''}`,
            `responseTime=${query['responseTime'] || ''}`,
            `resultCode=${query['resultCode'] || ''}`,
            `transId=${query['transId'] || ''}`,
        ].join('&');

        const calculated = crypto
            .createHmac('sha256', this.secretKey)
            .update(rawSignature)
            .digest('hex');

        const isValid = calculated === momoSignature;

        this.logger.debug(`===== MOMO CALLBACK VERIFY =====`);
        this.logger.debug(`Raw Signature: ${rawSignature}`);
        this.logger.debug(`Calculated: ${calculated}`);
        this.logger.debug(`Received:   ${momoSignature}`);
        this.logger.debug(`Match: ${isValid ? '✅ YES' : '❌ NO'}`);
        this.logger.debug(`Result code: ${resultCode}`);

        const isSuccess = isValid && resultCode === '0';
        this.logger.debug(`Success: ${isSuccess ? '✅' : '❌'}`);
        this.logger.debug(`===== END MOMO CALLBACK =====\n`);

        return { isValid, isSuccess, orderId, transactionId, amount };
    }

    /**
     * Format date to Momo format (YYYYMMDDhhmmss)
     * Same as VNPay for consistency
     */
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
