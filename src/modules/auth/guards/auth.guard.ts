import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserService } from 'src/modules/user/user.service';
import { AccessTokenService } from '../../access-token/access-token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private accessTokenService: AccessTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const { sub: userId, userType } = payload;

      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTimestamp) {
        throw new UnauthorizedException('Token has expired');
      }

      const user = await this.userService.findOneByUserTypes(userId, userType);

      if (user) {
        request['user'] = {
          id: user.id,
          type: user.type,
          branchId: user.branchId,
        };
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
