import { Module } from '@nestjs/common';
import { ClockService } from './clock.service';
import { ClockController } from './clock.controller';
import { BranchModule } from '../branch/branch.module';
import { UserModule } from '../user/user.module';
import { ShiftModule } from '../shift/shift.module';

@Module({
  imports: [BranchModule, UserModule, ShiftModule],
  providers: [ClockService],
  controllers: [ClockController],
  exports: [ClockService],
})
export class ClockModule {}
