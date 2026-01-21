import { Module } from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { AttendeeMeController } from './attendee.me.controller';
import { AttendeeController } from './attendee.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { AccessTokenModule } from '../access-token/access-token.module';
import { IsAttendeeIdExistConstraint } from './attendee-id.exist.validator';

@Module({
  imports: [AuthModule, UserModule, AccessTokenModule],
  providers: [AttendeeService, IsAttendeeIdExistConstraint],
  controllers: [AttendeeMeController, AttendeeController],
  exports: [AttendeeService],
})
export class AttendeeModule {}
