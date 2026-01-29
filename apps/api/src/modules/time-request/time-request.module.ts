import { Module } from '@nestjs/common';
import { TimeRequestService } from './time-request.service';
import { TimeRequestMeController } from './time-request.me.controller';
import { IsTimeRequestIdExistConstraint } from './validators/time-request-id.exist.validator';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { UserModule } from '../user/user.module';
import { AccessTokenModule } from '../access-token/access-token.module';

@Module({
  imports: [AuthModule, AuditModule, UserModule, AccessTokenModule],
  providers: [TimeRequestService, IsTimeRequestIdExistConstraint],
  controllers: [TimeRequestMeController],
  exports: [TimeRequestService],
})
export class TimeRequestModule {}
