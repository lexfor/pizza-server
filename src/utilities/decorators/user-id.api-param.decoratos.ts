import { ApiParam } from '@nestjs/swagger';
import { UUID, v4 } from 'uuid';

export function UserIDApiParam() {
  return ApiParam({
    name: 'id',
    description: 'user id',
    type: UUID,
    example: v4(),
  });
}
