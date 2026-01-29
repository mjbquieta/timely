import { Module } from '@nestjs/common';
import { LeaveBalanceService } from './leave-balance.service';
import { LeaveBalanceMeController } from './leave-balance.me.controller';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { UserModule } from '../user/user.module';
import { AccessTokenModule } from '../access-token/access-token.module';

@Module({
  imports: [AuthModule, AuditModule, UserModule, AccessTokenModule],
  providers: [LeaveBalanceService],
  controllers: [LeaveBalanceMeController],
  exports: [LeaveBalanceService],
})
export class LeaveBalanceModule {}
