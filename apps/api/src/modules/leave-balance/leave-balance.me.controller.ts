import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { RolesGuard } from '../auth/guards/role.guards';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { LeaveBalanceService } from './leave-balance.service';
import {
  CreateLeaveBalanceDto,
  UpdateLeaveBalanceDto,
  LeaveBalanceQueryDto,
  UserLeaveBalanceParamsDto,
} from './leave-balance.dto';
import { UserType } from '@prisma/client';
import { RequestHeaderType } from '../auth/auth.interface';
import { UUID } from 'crypto';

@Controller('api/v1/me/leave-balance')
@UseGuards(AuthGuard, RolesGuard)
export class LeaveBalanceMeController {
  constructor(private readonly leaveBalanceService: LeaveBalanceService) {}

  // Employee endpoint - get own balances
  @Get()
  @Roles(UserType.ATTENDEE, UserType.BRANCH_ATTENDEE)
  async getMyBalances(
    @Query('year') year: string,
    @Req() req: RequestHeaderType,
  ) {
    return this.leaveBalanceService.getBalanceSummary(
      req.user.id as UUID,
      year ? parseInt(year) : undefined,
    );
  }

  // Admin endpoints - manage all balances
  @Get('branch')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async getBranchBalances(
    @Query('year') year: string,
    @Req() req: RequestHeaderType,
  ) {
    return this.leaveBalanceService.getBalancesByBranch(
      req.user.branchId,
      year ? parseInt(year) : undefined,
    );
  }

  @Get('user/:userId')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async getUserBalances(
    @Param(new ValidationPipe({ transform: true })) params: UserLeaveBalanceParamsDto,
    @Query('year') year: string,
  ) {
    return this.leaveBalanceService.getBalanceSummary(
      params.userId,
      year ? parseInt(year) : undefined,
    );
  }

  @Post()
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async createBalance(
    @Body(new ValidationPipe({ transform: true })) body: CreateLeaveBalanceDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.leaveBalanceService.create(
      req.user.branchId,
      body,
      req.user.id as UUID,
    );
  }

  @Post('user/:userId/initialize')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async initializeUserBalances(
    @Param(new ValidationPipe({ transform: true })) params: UserLeaveBalanceParamsDto,
    @Query('year') year: string,
    @Req() req: RequestHeaderType,
  ) {
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    return this.leaveBalanceService.initializeBalancesForUser(
      req.user.branchId,
      params.userId,
      targetYear,
      req.user.id as UUID,
    );
  }

  @Put(':id')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async updateBalance(
    @Param('id') id: UUID,
    @Body(new ValidationPipe({ transform: true })) body: UpdateLeaveBalanceDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.leaveBalanceService.update(id, body, req.user.id as UUID);
  }
}
