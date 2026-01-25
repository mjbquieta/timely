import { Module } from '@nestjs/common';
import { RestDayService } from './rest-day.service';
import { RestDayMeController } from './rest-day.me.controller';
import { IsRestDayRuleIdExistConstraint } from './validators/rest-day-id.exist.validator';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { UserModule } from '../user/user.module';
import { AccessTokenModule } from '../access-token/access-token.module';

@Module({
  imports: [AuthModule, AuditModule, UserModule, AccessTokenModule],
  providers: [RestDayService, IsRestDayRuleIdExistConstraint],
  controllers: [RestDayMeController],
  exports: [RestDayService],
})
export class RestDayModule {}
