import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { WebsocketService } from './websocket.service';
import { BranchModule } from '../branch/branch.module';
import { UserModule } from '../user/user.module';
import { ClockModule } from '../clock/clock.module';

@Module({
  imports: [BranchModule, UserModule, ClockModule],
  providers: [WebsocketGateway, WebsocketService],
  exports: [WebsocketService],
})
export class WebsocketModule {}
