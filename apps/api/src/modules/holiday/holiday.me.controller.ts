import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { RolesGuard } from '../auth/guards/role.guards';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { HolidayService } from './holiday.service';
import {
  CreateHolidayDto,
  UpdateHolidayDto,
  HolidayIdDto,
  CheckHolidayDto,
} from './holiday.dto';
import { UserType } from '@prisma/client';
import { RequestHeaderType } from '../auth/auth.interface';
import { UUID } from 'crypto';

@Controller('api/v1/me/holiday')
@UseGuards(AuthGuard, RolesGuard)
export class HolidayMeController {
  constructor(private readonly holidayService: HolidayService) {}

  @Get()
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async getHolidays(@Req() req: RequestHeaderType) {
    return this.holidayService.getHolidays(req.user.branchId);
  }

  @Get('check/:date')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async checkHoliday(
    @Param(new ValidationPipe({ transform: true })) params: CheckHolidayDto,
    @Req() req: RequestHeaderType,
  ) {
    const holiday = await this.holidayService.isHoliday(
      req.user.branchId,
      params.date,
    );
    return {
      isHoliday: !!holiday,
      holiday,
    };
  }

  @Get(':holidayId')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async getHolidayById(
    @Param(new ValidationPipe({ transform: true })) params: HolidayIdDto,
  ) {
    return this.holidayService.getHolidayById(params.holidayId);
  }

  @Get(':holidayId/history')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async getHolidayHistory(
    @Param(new ValidationPipe({ transform: true })) params: HolidayIdDto,
  ) {
    return this.holidayService.getVersionHistory(params.holidayId);
  }

  @Post()
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async createHoliday(
    @Body(new ValidationPipe({ transform: true })) body: CreateHolidayDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.holidayService.create(
      req.user.branchId,
      body,
      req.user.id as UUID,
    );
  }

  @Put(':holidayId')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async updateHoliday(
    @Param(new ValidationPipe({ transform: true })) params: HolidayIdDto,
    @Body(new ValidationPipe({ transform: true })) body: UpdateHolidayDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.holidayService.update(
      params.holidayId,
      body,
      req.user.id as UUID,
    );
  }

  @Delete(':holidayId')
  @HttpCode(204)
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async deleteHoliday(
    @Param(new ValidationPipe({ transform: true })) params: HolidayIdDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.holidayService.delete(params.holidayId, req.user.id as UUID);
  }
}
