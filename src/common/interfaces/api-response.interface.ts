/**
 * Standard API Response Interface
 * All API responses will follow this structure
 */
export interface ApiResponse<T = any> {
  /**
   * Indicates if the request was successful
   */
  success: boolean;

  /**
   * Response data (null on error)
   */
  data: T | null;

  /**
   * Error message (null on success)
   */
  message: string | null;

  /**
   * HTTP status code
   */
  statusCode: number;

  /**
   * Request timestamp
   */
  timestamp: string;

  /**
   * Request path
   */
  path: string;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
