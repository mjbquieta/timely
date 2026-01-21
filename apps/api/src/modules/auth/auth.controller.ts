import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateAsBranchUserDto,
  LoginAsCompanyWithCompanyNameDto,
  LoginDto,
} from './auth.dto';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create-as-branch-user')
  async createAsBranchUser(
    @Body(new ValidationPipe({ transform: true }))
    data: CreateAsBranchUserDto,
  ) {
    return this.authService.createAsBranchUser(data);
  }

  @Post('branch/login')
  async loginAsBranchUser(
    @Body(new ValidationPipe({ transform: true }))
    data: LoginDto,
  ) {
    return this.authService.loginAsBranchUser(data);
  }

  @Post('attendee/login')
  async loginAsAttendeeUser(
    @Body(new ValidationPipe({ transform: true }))
    data: LoginDto,
  ) {
    return this.authService.loginAsAttendeeUser(data);
  }

  @Post('company/login')
  async loginAsCompanyUser(
    @Body(new ValidationPipe({ transform: true }))
    data: LoginAsCompanyWithCompanyNameDto,
  ) {
    return this.authService.loginAsCompanyUser(data);
  }
}
