import { Module } from '@nestjs/common';
import { PayrollCutoffService } from './payroll-cutoff.service';
import { PayrollCutoffMeController } from './payroll-cutoff.me.controller';
import { IsPayrollCutoffIdExistConstraint } from './validators/cutoff-id.exist.validator';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { UserModule } from '../user/user.module';
import { AccessTokenModule } from '../access-token/access-token.module';

@Module({
  imports: [AuthModule, AuditModule, UserModule, AccessTokenModule],
  providers: [PayrollCutoffService, IsPayrollCutoffIdExistConstraint],
  controllers: [PayrollCutoffMeController],
  exports: [PayrollCutoffService],
})
export class PayrollCutoffModule {}
