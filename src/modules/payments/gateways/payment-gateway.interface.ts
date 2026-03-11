export interface VerifyCallbackResult {
    isValid: boolean;
    isSuccess: boolean;
    orderId: string;
    transactionId: string;
    amount?: number;
}

export interface IPaymentGateway {
    /**
     * Tạo URL thanh toán
     * Returns Promise to support gateways like Momo that require API calls
     */
    buildPaymentUrl(
        orderId: string,
        amount: number,
        orderInfo: string,
        ipAddr: string,
    ): Promise<string> | string;

    /**
     * Verify callback từ payment gateway
     */
    verifyCallback(query: Record<string, string>): VerifyCallbackResult;
}
