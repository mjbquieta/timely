import { Module } from '@nestjs/common';
import { AccessTokenService } from './access-token.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [AccessTokenService],
  exports: [AccessTokenService],
})
export class AccessTokenModule {}
