import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RequestHeaderType } from '../auth/auth.interface';
import { PartialUserDto, UserIdDto, UserNonWorkingDto } from '../user/user.dto';
import { RolesGuard } from '../auth/guards/role.guards';
import { UserType } from '@prisma/client';
import { Roles } from 'src/common/decorators/role.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('api/v1/me/attendee')
export class AttendeeMeController {
  constructor(private readonly attendeeService: AttendeeService) {}

  @Get()
  @Roles(UserType.ATTENDEE)
  async getProfile(@Req() req: RequestHeaderType) {
    return this.attendeeService.findProfile(req.user.id);
  }

  @Get('attendance')
  @Roles(UserType.ATTENDEE)
  async getAttendance(@Req() req: RequestHeaderType) {
    return this.attendeeService.findAttendance(req.user.id);
  }

  @Patch()
  @Roles(UserType.ATTENDEE)
  async updateProfile(
    @Req() req: RequestHeaderType,
    @Body(new ValidationPipe({ transform: true })) body: PartialUserDto,
  ) {
    return this.attendeeService.update(req.user.id, body);
  }

  @Delete()
  @Roles(UserType.ATTENDEE)
  async deactivate(@Req() req: RequestHeaderType) {
    return this.attendeeService.delete(req.user.id);
  }

  @Post('non-working/:userId')
  @Roles(UserType.ADMIN, UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async nonWorking(
    @Body(new ValidationPipe({ transform: true })) body: UserNonWorkingDto,
    @Param(new ValidationPipe({ transform: true })) params: UserIdDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.attendeeService.tagAsNonWorking(
      req.user.branchId,
      params.userId,
      body,
    );
  }
}
