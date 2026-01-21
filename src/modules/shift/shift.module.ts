import { Module } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { ShiftMeController } from './shift.me.controller';
import { AccessTokenModule } from '../access-token/access-token.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { IsShiftIdExistConstraint } from './shift-id.exist.validator';
import { DepartmentModule } from '../department/department.module';

@Module({
  imports: [AuthModule, UserModule, AccessTokenModule, DepartmentModule],
  providers: [ShiftService, IsShiftIdExistConstraint],
  controllers: [ShiftMeController],
  exports: [ShiftService],
})
export class ShiftModule {}
