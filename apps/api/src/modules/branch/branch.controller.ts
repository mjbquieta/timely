import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BranchService } from './branch.service';
import { RolesGuard } from '../auth/guards/role.guards';
import { UserType } from '@prisma/client';
import { Roles } from 'src/common/decorators/role.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('/api/v1/branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get()
  @Roles(UserType.PAYROLL_MASTER)
  async getAllBranches() {
    return this.branchService.getAllBranches();
  }
}
