import { forwardRef, Module } from '@nestjs/common';
import { BranchService } from './branch.service';
import { BranchMeController } from './branch.me.controller';
import { UserModule } from '../user/user.module';
import { AccessTokenModule } from '../access-token/access-token.module';
import { IsBranchIdExistConstraint } from './validators/branch-id.exist.validator';
import { AttendeeModule } from '../attendee/attendee.module';
import { IsDeviceSnExistConstraint } from './validators/device.exist.validator';
import { BranchController } from './branch.controller';

@Module({
  imports: [UserModule, AccessTokenModule, AttendeeModule],
  providers: [
    BranchService,
    IsBranchIdExistConstraint,
    IsDeviceSnExistConstraint,
  ],
  controllers: [BranchMeController, BranchController],
  exports: [BranchService],
})
export class BranchModule {}
