import { registerAs } from '@nestjs/config';

export default registerAs('momo', () => ({
    partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
    accessKey: process.env.MOMO_ACCESS_KEY || '',
    secretKey: process.env.MOMO_SECRET_KEY || '',
    apiUrl: process.env.MOMO_API_URL || 'https://test-payment.momo.vn/v2/gateway/api/create',
    ipnUrl: process.env.MOMO_IPN_URL || 'http://localhost:3000/api/payments/momo-ipn',
    returnUrl: process.env.MOMO_RETURN_URL || 'http://localhost:3000/api/payments/momo-return',
}));
