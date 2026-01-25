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
import { PayrollCutoffService } from './payroll-cutoff.service';
import {
  CreatePayrollCutoffDto,
  UpdatePayrollCutoffDto,
  PayrollCutoffIdDto,
  HrOverrideDto,
} from './payroll-cutoff.dto';
import { UserType } from '@prisma/client';
import { RequestHeaderType } from '../auth/auth.interface';
import { UUID } from 'crypto';
import { AuditService } from '../audit/audit.service';
import { EntityType } from '@prisma/client';

@Controller('api/v1/me/payroll-cutoff')
@UseGuards(AuthGuard, RolesGuard)
export class PayrollCutoffMeController {
  constructor(
    private readonly payrollCutoffService: PayrollCutoffService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async getPayrollCutoffs(@Req() req: RequestHeaderType) {
    return this.payrollCutoffService.getPayrollCutoffs(req.user.branchId);
  }

  @Get('current')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async getCurrentCutoff(@Req() req: RequestHeaderType) {
    return this.payrollCutoffService.getCurrentCutoff(req.user.branchId);
  }

  @Get(':cutoffId')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async getPayrollCutoffById(
    @Param(new ValidationPipe({ transform: true })) params: PayrollCutoffIdDto,
  ) {
    return this.payrollCutoffService.getPayrollCutoffById(params.cutoffId);
  }

  @Get(':cutoffId/audit')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async getPayrollCutoffAudit(
    @Param(new ValidationPipe({ transform: true })) params: PayrollCutoffIdDto,
  ) {
    return this.auditService.getEntityHistory(
      EntityType.PAYROLL_CUTOFF,
      params.cutoffId,
    );
  }

  @Post()
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async createPayrollCutoff(
    @Body(new ValidationPipe({ transform: true })) body: CreatePayrollCutoffDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.payrollCutoffService.create(
      req.user.branchId,
      body,
      req.user.id as UUID,
    );
  }

  @Put(':cutoffId')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async updatePayrollCutoff(
    @Param(new ValidationPipe({ transform: true })) params: PayrollCutoffIdDto,
    @Body(new ValidationPipe({ transform: true })) body: UpdatePayrollCutoffDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.payrollCutoffService.update(
      params.cutoffId,
      body,
      req.user.id as UUID,
    );
  }

  @Post(':cutoffId/activate')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async activatePayrollCutoff(
    @Param(new ValidationPipe({ transform: true })) params: PayrollCutoffIdDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.payrollCutoffService.activate(
      params.cutoffId,
      req.user.id as UUID,
    );
  }

  @Post(':cutoffId/lock')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async lockPayrollCutoff(
    @Param(new ValidationPipe({ transform: true })) params: PayrollCutoffIdDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.payrollCutoffService.lock(
      params.cutoffId,
      req.user.id as UUID,
    );
  }

  @Post(':cutoffId/unlock')
  @Roles(UserType.BRANCH_OWNER, UserType.PAYROLL_MASTER)
  async hrOverrideUnlock(
    @Param(new ValidationPipe({ transform: true })) params: PayrollCutoffIdDto,
    @Body(new ValidationPipe({ transform: true })) body: HrOverrideDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.payrollCutoffService.hrOverride(
      params.cutoffId,
      req.user.id as UUID,
      body.reason,
    );
  }

  @Post(':cutoffId/release')
  @Roles(UserType.BRANCH_OWNER, UserType.PAYROLL_MASTER)
  async releasePayrollCutoff(
    @Param(new ValidationPipe({ transform: true })) params: PayrollCutoffIdDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.payrollCutoffService.release(
      params.cutoffId,
      req.user.id as UUID,
    );
  }

  @Delete(':cutoffId')
  @HttpCode(204)
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async deletePayrollCutoff(
    @Param(new ValidationPipe({ transform: true })) params: PayrollCutoffIdDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.payrollCutoffService.delete(
      params.cutoffId,
      req.user.id as UUID,
    );
  }
}
