import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { PartialUserDto, UserIdDto } from '../user/user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/role.guards';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserType } from '@prisma/client';
import { AllowConsoleAccessDto } from './attendee.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('/api/v1/attendees')
export class AttendeeController {
  constructor(private readonly attendeeService: AttendeeService) {}

  @Get('profile/:userId')
  @Roles(UserType.ADMIN, UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async getAttendeeProfile(
    @Param(new ValidationPipe({ transform: true })) params: UserIdDto,
  ) {
    return this.attendeeService.findProfile(params.userId);
  }

  @Patch(':userId')
  @Roles(UserType.ADMIN, UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async updateAttendee(
    @Param(new ValidationPipe({ transform: true })) params: UserIdDto,
    @Body(new ValidationPipe({ transform: true })) body: PartialUserDto,
  ) {
    return this.attendeeService.update(params.userId, body);
  }

  @Delete(':userId')
  @Roles(UserType.ADMIN, UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async deleteAttendee(
    @Param(new ValidationPipe({ transform: true })) params: UserIdDto,
  ) {
    return this.attendeeService.delete(params.userId);
  }

  @Post(':userId/allow-console-access')
  @Roles(UserType.ADMIN, UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async allowConsoleAccess(
    @Param(new ValidationPipe({ transform: true })) params: UserIdDto,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    body: AllowConsoleAccessDto,
  ) {
    return this.attendeeService.allowConsoleAccess(params.userId, body);
  }

  @Delete(':userId/revoke-console-access')
  @Roles(UserType.ADMIN, UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async revokeConsoleAccess(
    @Param(new ValidationPipe({ transform: true })) params: UserIdDto,
  ) {
    return this.attendeeService.revokeConsoleAccess(params.userId);
  }
}
