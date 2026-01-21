import { forwardRef, Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { IsCompanyNameExistConstraint } from './validators/name.exist.validator';
import { IsCompanyIdExistConstraint } from './validators/id.exist.validator';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { AccessTokenModule } from '../access-token/access-token.module';
import { BranchModule } from '../branch/branch.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    UserModule,
    AccessTokenModule,
    BranchModule,
  ],
  providers: [
    CompanyService,
    IsCompanyNameExistConstraint,
    IsCompanyIdExistConstraint,
  ],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
