import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BranchModule } from './modules/branch/branch.module';
import { PrismaModule } from './providers/prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AccessTokenModule } from './modules/access-token/access-token.module';
import { AttendeeModule } from './modules/attendee/attendee.module';
import { ClockModule } from './modules/clock/clock.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { DepartmentModule } from './modules/department/department.module';
import { HttpExceptionFilter } from './common/exceptions/filter.exception';
import { APP_FILTER } from '@nestjs/core';
import { ShiftModule } from './modules/shift/shift.module';
import { CompanyModule } from './modules/company/company.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    PrismaModule,
    BranchModule,
    UserModule,
    AuthModule,
    AccessTokenModule,
    AttendeeModule,
    ClockModule,
    WebsocketModule,
    DepartmentModule,
    ShiftModule,
    CompanyModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
