# BAI 10 - CHUAN HOA EXCEPTION FILTER

## 1) Muc tieu
Dam bao tat ca loi tra ve format thong nhat cho frontend.

## 2) File can sua
- `src/common/filters/http-exception.filter.ts`

## 3) Cac buoc lam chi tiet

### Buoc 1: Lay thong tin co ban
Trong `catch(exception, host)`:
- Lay `request`, `response`
- Xac dinh `status` tu `HttpException` hoac fallback 500.

### Buoc 2: Normalize message
- Neu `exception.getResponse()` la string -> dung truc tiep.
- Neu la object co `message`:
  - Neu `message` la array -> join thanh string hoac de array tuy contract.
  - Neu `message` la string -> dung string.
- Neu khong co -> message mac dinh theo status.

### Buoc 3: Tra format chuan
Tra object:
- `success: false`
- `message`
- `errorCode`
- `timestamp`
- `path`

## 4) Mau ham day du
```ts
catch(exception: unknown, host: ArgumentsHost): void {
  const ctx = host.switchToHttp();
  const response = ctx.getResponse<Response>();
  const request = ctx.getRequest<Request>();

  const status =
    exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

  let message: string | string[] = 'Internal server error';
  if (exception instanceof HttpException) {
    const errorResponse = exception.getResponse();
    if (typeof errorResponse === 'string') {
      message = errorResponse;
    } else if (
      typeof errorResponse === 'object' &&
      errorResponse !== null &&
      'message' in errorResponse
    ) {
      message = (errorResponse as { message: string | string[] }).message;
    }
  }

  response.status(status).json({
    success: false,
    message,
    errorCode: this.mapStatusToErrorCode(status),
    timestamp: new Date().toISOString(),
    path: request.url,
  });
}
```

## 5) Test nhanh
- Validation error -> format dung.
- NotFound -> format dung.
- Internal error -> format dung, status 500.
