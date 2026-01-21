import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import {
  CompanyIdDto,
  CompanyPartialDto,
  CreateCompanyDto,
  CreateCompanyWithExistingOwnerDto,
} from './company.dto';
import { BranchService } from '../branch/branch.service';
import { UserService } from '../user/user.service';

@Controller('/api/v1/companies')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly branchService: BranchService,
  ) {}

  @Post()
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    data: CreateCompanyDto,
  ) {
    return this.companyService.create(data);
  }

  @Post('with-existing-owner')
  async createWithExistingOwner(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    data: CreateCompanyWithExistingOwnerDto,
  ) {
    return this.companyService.createWithExistingOwner(data);
  }

  @Get(':companyId')
  async find(
    @Param(new ValidationPipe({ transform: true })) params: CompanyIdDto,
  ) {
    return this.companyService.find(params.companyId);
  }

  @Patch(':companyId')
  async update(
    @Param(new ValidationPipe({ transform: true })) params: CompanyIdDto,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    data: CompanyPartialDto,
  ) {
    return this.companyService.update(params.companyId, data);
  }

  @Get(':companyId/branches')
  async findBranches(
    @Param(new ValidationPipe({ transform: true })) params: CompanyIdDto,
  ) {
    return this.branchService.findByCompanyId(params.companyId);
  }
}
