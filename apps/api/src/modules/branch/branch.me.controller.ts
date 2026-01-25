import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BranchService } from './branch.service';
import { RequestHeaderType } from '../auth/auth.interface';
import {
  BranchChangePasswordDto,
  DeviceSnDto,
  PartialBranchUserDto,
} from './branch.dto';
import { AttendeeService } from '../attendee/attendee.service';
import { CreateAttendeeUserWithPasswordDto } from '../user/user.dto';
import { RolesGuard } from '../auth/guards/role.guards';
import { UserType } from '@prisma/client';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserService } from '../user/user.service';
import { PasswordDto } from '../auth/auth.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('/api/v1/me/branch')
export class BranchMeController {
  constructor(
    private readonly branchService: BranchService,
    private readonly attendeeService: AttendeeService,
  ) {}

  @Get()
  @Roles(
    UserType.BRANCH_OWNER,
    UserType.BRANCH_ADMIN,
    UserType.BRANCH_ATTENDEE,
    UserType.PAYROLL_MASTER,
  )
  async getBranchDetails(@Req() req: RequestHeaderType) {
    return this.branchService.getBranchDetails(req.user.id);
  }

  @Patch()
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.BRANCH_ATTENDEE)
  async update(
    @Req() req: RequestHeaderType,
    @Body(new ValidationPipe({ transform: true })) body: PartialBranchUserDto,
  ) {
    return this.branchService.update(req.user.branchId, body);
  }

  @Get('attendees')
  @Roles(
    UserType.BRANCH_OWNER,
    UserType.BRANCH_ADMIN,
    UserType.BRANCH_ATTENDEE,
    UserType.PAYROLL_MASTER,
  )
  async getAttendeesByBranch(@Req() req: RequestHeaderType) {
    return this.attendeeService.findByBranch(req.user.branchId);
  }

  @Post('attendees')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.BRANCH_ATTENDEE)
  async createAttendee(
    @Req() req: RequestHeaderType,
    @Body(new ValidationPipe({ transform: true }))
    body: CreateAttendeeUserWithPasswordDto,
  ) {
    return this.attendeeService.createByBranch(req.user.branchId, body);
  }

  @Patch('device/:sn')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.BRANCH_ATTENDEE)
  @HttpCode(204)
  async changeDevice(
    @Req() req: RequestHeaderType,
    @Param(new ValidationPipe({ transform: true })) params: DeviceSnDto,
    @Body(new ValidationPipe({ transform: true })) body: PasswordDto,
  ) {
    return this.branchService.changeDevice(
      req.user.branchId,
      req.user.id,
      params.sn,
      body.password,
    );
  }

  @Patch('change-password')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.BRANCH_ATTENDEE)
  @HttpCode(204)
  async changePassword(
    @Req() req: RequestHeaderType,
    @Body(new ValidationPipe({ transform: true }))
    body: BranchChangePasswordDto,
  ) {
    return this.branchService.changePassword(req.user.id, body);
  }
}
