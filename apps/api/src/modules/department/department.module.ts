import { Module } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { DepartmentMeController } from './department.me.controller';
import { IsDepartmentIdExistConstraint } from './department-id.exist.validator';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { AccessTokenModule } from '../access-token/access-token.module';
import { AttendeeModule } from '../attendee/attendee.module';

@Module({
  imports: [AuthModule, UserModule, AccessTokenModule, AttendeeModule],
  providers: [DepartmentService, IsDepartmentIdExistConstraint],
  controllers: [DepartmentMeController],
  exports: [DepartmentService],
})
export class DepartmentModule {}
