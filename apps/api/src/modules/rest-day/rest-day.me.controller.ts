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
import { RestDayService } from './rest-day.service';
import {
  CreateRestDayRuleDto,
  UpdateRestDayRuleDto,
  RestDayRuleIdDto,
  CheckRestDayDto,
  UserRestDayQueryDto,
} from './rest-day.dto';
import { UserType } from '@prisma/client';
import { RequestHeaderType } from '../auth/auth.interface';
import { UUID } from 'crypto';

@Controller('api/v1/me/rest-day')
@UseGuards(AuthGuard, RolesGuard)
export class RestDayMeController {
  constructor(private readonly restDayService: RestDayService) {}

  @Get()
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async getRestDayRules(@Req() req: RequestHeaderType) {
    return this.restDayService.getRestDayRules(req.user.branchId);
  }

  @Get('check/:userId/:date')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async checkRestDay(
    @Param(new ValidationPipe({ transform: true })) params: CheckRestDayDto,
  ) {
    const isRestDay = await this.restDayService.isRestDay(
      params.userId,
      params.date,
    );
    return {
      isRestDay,
      userId: params.userId,
      date: params.date,
    };
  }

  @Get('user/:userId')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async getUserRestDayRules(
    @Param(new ValidationPipe({ transform: true })) params: UserRestDayQueryDto,
  ) {
    return this.restDayService.getUserRestDayRules(params.userId);
  }

  @Get(':ruleId')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async getRestDayRuleById(
    @Param(new ValidationPipe({ transform: true })) params: RestDayRuleIdDto,
  ) {
    return this.restDayService.getRestDayRuleById(params.ruleId);
  }

  @Post()
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async createRestDayRule(
    @Body(new ValidationPipe({ transform: true })) body: CreateRestDayRuleDto,
    @Req() req: RequestHeaderType,
  ) {
    // Always set branchId for proper querying
    // This allows filtering by branch even for department/user-scoped rules
    if (!body.branchId) {
      body.branchId = req.user.branchId;
    }
    return this.restDayService.create(body, req.user.id as UUID);
  }

  @Put(':ruleId')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async updateRestDayRule(
    @Param(new ValidationPipe({ transform: true })) params: RestDayRuleIdDto,
    @Body(new ValidationPipe({ transform: true })) body: UpdateRestDayRuleDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.restDayService.update(
      params.ruleId,
      body,
      req.user.id as UUID,
    );
  }

  @Delete(':ruleId')
  @HttpCode(204)
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async deleteRestDayRule(
    @Param(new ValidationPipe({ transform: true })) params: RestDayRuleIdDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.restDayService.delete(params.ruleId, req.user.id as UUID);
  }
}
