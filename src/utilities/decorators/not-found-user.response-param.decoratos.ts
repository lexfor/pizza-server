import { ApiNotFoundResponse } from '@nestjs/swagger';

export function UserNotFoundResponseParam() {
  return ApiNotFoundResponse({ description: 'None users founded' });
}
