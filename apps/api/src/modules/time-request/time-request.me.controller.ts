import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { RolesGuard } from '../auth/guards/role.guards';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { TimeRequestService } from './time-request.service';
import {
  CreateLeaveRequestDto,
  CreateOvertimeRequestDto,
  CreateUndertimeRequestDto,
  ReviewTimeRequestDto,
  TimeRequestIdDto,
  TimeRequestQueryDto,
  PendingRequestsQueryDto,
} from './time-request.dto';
import { UserType } from '@prisma/client';
import { RequestHeaderType } from '../auth/auth.interface';
import { UUID } from 'crypto';

@Controller('api/v1/me/time-request')
@UseGuards(AuthGuard, RolesGuard)
export class TimeRequestMeController {
  constructor(private readonly timeRequestService: TimeRequestService) {}

  // Employee endpoints
  @Get()
  @Roles(UserType.ATTENDEE, UserType.BRANCH_ATTENDEE)
  async getMyRequests(
    @Query(new ValidationPipe({ transform: true })) query: TimeRequestQueryDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.timeRequestService.getMyRequests(req.user.id as UUID, query);
  }

  @Get('pending')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async getPendingRequests(
    @Query(new ValidationPipe({ transform: true })) query: PendingRequestsQueryDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.timeRequestService.getPendingRequests(req.user.branchId, query);
  }

  @Get('approved')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async getApprovedRequests(
    @Query(new ValidationPipe({ transform: true })) query: PendingRequestsQueryDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.timeRequestService.getApprovedRequests(req.user.branchId, query);
  }

  @Get(':requestId')
  @Roles(
    UserType.ATTENDEE,
    UserType.BRANCH_ATTENDEE,
    UserType.BRANCH_OWNER,
    UserType.BRANCH_ADMIN,
    UserType.PAYROLL_MASTER,
  )
  async getById(
    @Param(new ValidationPipe({ transform: true })) params: TimeRequestIdDto,
  ) {
    return this.timeRequestService.getById(params.requestId);
  }

  @Post('leave')
  @Roles(UserType.ATTENDEE, UserType.BRANCH_ATTENDEE)
  async createLeaveRequest(
    @Body(new ValidationPipe({ transform: true })) body: CreateLeaveRequestDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.timeRequestService.createLeaveRequest(
      req.user.branchId,
      req.user.id as UUID,
      body,
    );
  }

  @Post('overtime')
  @Roles(UserType.ATTENDEE, UserType.BRANCH_ATTENDEE)
  async createOvertimeRequest(
    @Body(new ValidationPipe({ transform: true })) body: CreateOvertimeRequestDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.timeRequestService.createOvertimeRequest(
      req.user.branchId,
      req.user.id as UUID,
      body,
    );
  }

  @Post('undertime')
  @Roles(UserType.ATTENDEE, UserType.BRANCH_ATTENDEE)
  async createUndertimeRequest(
    @Body(new ValidationPipe({ transform: true })) body: CreateUndertimeRequestDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.timeRequestService.createUndertimeRequest(
      req.user.branchId,
      req.user.id as UUID,
      body,
    );
  }

  @Post(':requestId/cancel')
  @Roles(UserType.ATTENDEE, UserType.BRANCH_ATTENDEE)
  async cancelRequest(
    @Param(new ValidationPipe({ transform: true })) params: TimeRequestIdDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.timeRequestService.cancelRequest(
      params.requestId,
      req.user.id as UUID,
    );
  }

  // Approval endpoints
  @Post(':requestId/approve')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async approveRequest(
    @Param(new ValidationPipe({ transform: true })) params: TimeRequestIdDto,
    @Body(new ValidationPipe({ transform: true })) body: ReviewTimeRequestDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.timeRequestService.approveRequest(
      params.requestId,
      req.user.id as UUID,
      body,
    );
  }

  @Post(':requestId/reject')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async rejectRequest(
    @Param(new ValidationPipe({ transform: true })) params: TimeRequestIdDto,
    @Body(new ValidationPipe({ transform: true })) body: ReviewTimeRequestDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.timeRequestService.rejectRequest(
      params.requestId,
      req.user.id as UUID,
      body,
    );
  }
}
