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
import { ShiftService } from './shift.service';
import {
  CreateShiftDto,
  CreateShiftPartialDto,
  ShiftIdDto,
  TagToDepartmentDto,
} from './shift.dto';
import { UserType } from '@prisma/client';
import { RequestHeaderType } from '../auth/auth.interface';

@Controller('api/v1/me/shift')
@UseGuards(AuthGuard, RolesGuard)
export class ShiftMeController {
  constructor(private readonly shiftService: ShiftService) {}

  @Get()
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async getShifts(@Req() req: RequestHeaderType) {
    return this.shiftService.getShifts(req.user.branchId);
  }

  @Get(':shiftId')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async getShiftById(
    @Param(new ValidationPipe({ transform: true })) params: ShiftIdDto,
  ) {
    return this.shiftService.getShiftById(params.shiftId);
  }

  @Post()
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async createShift(
    @Body(new ValidationPipe({ transform: true })) body: CreateShiftDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.shiftService.create(req.user.branchId, body);
  }

  @Put(':shiftId')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async updateShift(
    @Param(new ValidationPipe({ transform: true })) params: ShiftIdDto,
    @Body(new ValidationPipe({ transform: true })) body: CreateShiftPartialDto,
  ) {
    return this.shiftService.update(params.shiftId, body);
  }

  @Delete(':shiftId')
  @HttpCode(204)
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async deleteShift(
    @Param(new ValidationPipe({ transform: true })) params: ShiftIdDto,
  ) {
    return this.shiftService.delete(params.shiftId);
  }

  @Post(':shiftId/department/:departmentId')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async tagToDepartment(
    @Param(new ValidationPipe({ transform: true })) params: TagToDepartmentDto,
  ) {
    return this.shiftService.tagToDepartment(
      params.shiftId,
      params.departmentId,
    );
  }

  @Delete(':shiftId/department/:departmentId')
  @HttpCode(204)
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async untagFromDepartment(
    @Param(new ValidationPipe({ transform: true })) params: TagToDepartmentDto,
  ) {
    return this.shiftService.untagFromDepartment(
      params.shiftId,
      params.departmentId,
    );
  }
}
