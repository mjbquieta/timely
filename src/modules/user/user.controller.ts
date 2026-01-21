import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { MakeUserAsDto, PartialUserDto, UserIdDto } from './user.dto';
import { CompanyIdDto } from '../company/company.dto';

@Controller('/api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch(':userId/make-as/:userType')
  async makeUserAs(
    @Param(new ValidationPipe({ transform: true })) params: MakeUserAsDto,
  ) {
    return this.userService.makeUserAs(params);
  }

  @Patch(':userId/make-as/:userType/revoke')
  async makeUserAsRevoke(
    @Param(new ValidationPipe({ transform: true })) params: MakeUserAsDto,
  ) {
    return this.userService.makeUserAs(params, true);
  }

  @Get(':userId')
  async findOwnerByCompanyId(
    @Param(new ValidationPipe({ transform: true })) params: UserIdDto,
  ) {
    return this.userService.findOne(params.userId);
  }

  @Patch(':userId')
  async update(
    @Param(new ValidationPipe({ transform: true })) params: UserIdDto,
    @Body(new ValidationPipe({ transform: true })) body: PartialUserDto,
  ) {
    return this.userService.update(params.userId, body);
  }
}
