/**
 * Entry point cho layer `common` (infrastructure chia sẻ).
 *
 * Cho phép các module domain (events, ticket-types, users,...) import:
 * - Entity base, interfaces response
 * - Interceptors (transform response), filters (exception)
 * - Guards / decorators (qua các barrel file tương ứng)
 */

// Entities
export * from './entities';

// Interfaces
export * from './interfaces';

// Interceptors
export * from './interceptors';

// Filters
export * from './filters';
