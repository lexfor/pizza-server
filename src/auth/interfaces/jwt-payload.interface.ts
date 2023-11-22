import { UUID } from 'uuid';
export interface IJwtPayload {
  userID: UUID;
  exp?: number;
}
