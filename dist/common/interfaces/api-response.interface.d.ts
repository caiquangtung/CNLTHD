export interface ApiResponse<T = any> {
    success: boolean;
    data: T | null;
    message: string | null;
    statusCode: number;
    timestamp: string;
    path: string;
}
export interface PaginatedResponse<T = any> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
