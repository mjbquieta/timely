import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import { ClockService } from './clock.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserType } from '@prisma/client';
import { BranchIdDto, QueryAttendanceDto } from '../branch/branch.dto';

@Controller('api/v1/clock')
export class ClockController {
  constructor(private readonly clockService: ClockService) {}

  @Get('attendance-log/branch/:branchId')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async getAttendanceByBranch(
    @Param(new ValidationPipe({ transform: true })) params: BranchIdDto,
    @Query(new ValidationPipe({ transform: true })) query: QueryAttendanceDto,
  ) {
    return this.clockService.findAttendanceLogByBranch(params.branchId, query);
  }

  @Get('attendance-users-log/branch/:branchId')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async getAttendanceUsersLogByBranch(
    @Param(new ValidationPipe({ transform: true })) params: BranchIdDto,
    @Query(new ValidationPipe({ transform: true })) query: QueryAttendanceDto,
  ) {
    return this.clockService.findAttendanceUsersLogByBranch(
      params.branchId,
      query,
    );
  }
}
