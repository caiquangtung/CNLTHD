/**
 * Kiểu dữ liệu chuẩn cho mọi phản hồi API.
 *
 * Được dùng bởi:
 * - `TransformResponseInterceptor` cho phản hồi thành công (events, ticket-types,...)
 * - `HttpExceptionFilter` / `AllExceptionsFilter` cho phản hồi lỗi.
 */
export interface ApiResponse<T = any> {
  /**
   * Cờ cho biết request thành công hay thất bại
   */
  success: boolean;

  /**
   * Dữ liệu trả về (null nếu lỗi)
   */
  data: T | null;

  /**
   * Thông báo lỗi (null nếu thành công)
   */
  message: string | null;

  /**
   * Mã trạng thái HTTP
   */
  statusCode: number;

  /**
   * Thời điểm tạo phản hồi
   */
  timestamp: string;

  /**
   * Đường dẫn request
   */
  path: string;
}

/** Kiểu dữ liệu cho phản hồi có phân trang. */
export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
