import { JwtPayload } from 'jsonwebtoken';
import { UUID } from 'crypto';

interface RequestHeaderType extends Request {
  user: JwtPayload & { branchId: UUID };
}

export { RequestHeaderType };
