/**
 * Barrel file cho các HTTP interceptors dùng chung.
 *
 * `TransformResponseInterceptor` được cấu hình global để bọc mọi response
 * (bao gồm từ module events, ticket-types,...) theo `ApiResponse<T>`.
 */
export { TransformResponseInterceptor } from './transform-response.interceptor';
