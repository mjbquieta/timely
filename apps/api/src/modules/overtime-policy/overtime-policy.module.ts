import { Module } from '@nestjs/common';
import { OvertimePolicyService } from './overtime-policy.service';

@Module({
  providers: [OvertimePolicyService],
  exports: [OvertimePolicyService],
})
export class OvertimePolicyModule {}
