import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccessTokenModule } from '../access-token/access-token.module';
import { IsUsernameOrEmailProvidedConstraint } from './auth.dto';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [
    AccessTokenModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get('JWT_SECRET');
        return {
          secret,
          httpOnly: true,
          secure: true,
        };
      },
    }),
  ],
  providers: [AuthService, IsUsernameOrEmailProvidedConstraint],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
