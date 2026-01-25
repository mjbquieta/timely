import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/role.guards';
import { UserType } from '@prisma/client';
import { Roles } from 'src/common/decorators/role.decorator';
import { RequestHeaderType } from '../auth/auth.interface';
import {
  CreateDepartmentDto,
  DepartmentIdDto,
  TagUserToDepartmentUserDto,
} from './department.dto';

@Controller('/api/v1/me/department')
@UseGuards(AuthGuard, RolesGuard)
export class DepartmentMeController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN, UserType.PAYROLL_MASTER)
  async getDepartmentsByBranchId(@Req() req: RequestHeaderType) {
    return this.departmentService.findByBranch(req.user.branchId);
  }

  @Get(':departmentId')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async getDepartmentById(
    @Param(new ValidationPipe({ transform: true })) params: DepartmentIdDto,
  ) {
    return this.departmentService.findById(params.departmentId);
  }

  @Post()
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async getDepartments(
    @Req() req: RequestHeaderType,
    @Body(new ValidationPipe({ transform: true })) body: CreateDepartmentDto,
  ) {
    return this.departmentService.create(req.user.branchId, body);
  }

  @Put(':departmentId')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async updateDepartment(
    @Param(new ValidationPipe({ transform: true })) params: DepartmentIdDto,
    @Body(new ValidationPipe({ transform: true })) body: CreateDepartmentDto,
  ) {
    return this.departmentService.update(params.departmentId, body);
  }

  @Delete(':departmentId')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async deleteDepartment(
    @Param(new ValidationPipe({ transform: true })) params: DepartmentIdDto,
  ) {
    return this.departmentService.delete(params.departmentId);
  }

  @Post(':departmentId/user/:userId')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async addUserToDepartment(
    @Param(new ValidationPipe({ transform: true }))
    params: TagUserToDepartmentUserDto,
    @Req() req: RequestHeaderType,
  ) {
    return this.departmentService.addUserToDepartment(
      params.departmentId,
      params.userId,
      req.user.branchId,
    );
  }

  @Delete(':departmentId/user/:userId')
  @Roles(UserType.BRANCH_OWNER, UserType.BRANCH_ADMIN)
  async removeUserFromDepartment(
    @Param(new ValidationPipe({ transform: true }))
    params: TagUserToDepartmentUserDto,
  ) {
    return this.departmentService.removeUserFromDepartment(
      params.departmentId,
      params.userId,
    );
  }
}
