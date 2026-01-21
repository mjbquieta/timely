import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { IsUserUsernameExistConstraint } from './validators/user-username-exist.validator';
import { IsUserEmailExistConstraint } from './validators/user-email-exist.validator';
import { IsUserIdExistConstraint } from './validators/user-id.exist.validator';
import { BranchModule } from '../branch/branch.module';
import { IsCompanyOwnerIdExistConstraint } from './validators/company-owner-id.exist.validator';

@Module({
  imports: [forwardRef(() => BranchModule)],
  controllers: [UserController],
  providers: [
    UserService,
    IsUserUsernameExistConstraint,
    IsUserEmailExistConstraint,
    IsUserIdExistConstraint,
    IsCompanyOwnerIdExistConstraint,
  ],
  exports: [UserService],
})
export class UserModule {}
