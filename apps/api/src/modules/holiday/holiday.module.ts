import { Module } from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { HolidayMeController } from './holiday.me.controller';
import { IsHolidayIdExistConstraint } from './validators/holiday-id.exist.validator';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { UserModule } from '../user/user.module';
import { AccessTokenModule } from '../access-token/access-token.module';

@Module({
  imports: [AuthModule, AuditModule, UserModule, AccessTokenModule],
  providers: [HolidayService, IsHolidayIdExistConstraint],
  controllers: [HolidayMeController],
  exports: [HolidayService],
})
export class HolidayModule {}
