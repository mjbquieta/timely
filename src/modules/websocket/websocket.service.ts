import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { isObject } from 'lodash';
import * as net from 'net';
import { isParsableToJson } from 'src/common/utils/json.util';
import {
  RegisterDeviceMessage,
  TimeSyncMessage,
  UpSertUserMessage,
} from './device.interface';
import { BranchService } from '../branch/branch.service';
import { UserService } from '../user/user.service';
import { ClockService } from '../clock/clock.service';
import { toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';

@Injectable()
export class WebsocketService {
  public machines: Map<net.Socket, any>;
  public machineInfo: Map<string, string>;
  public id: Map<string, string>;
  private readonly logger = new Logger(WebsocketService.name);

  constructor(
    private readonly branchService: BranchService,
    private readonly userService: UserService,
    private readonly clockService: ClockService,
  ) {
    this.machines = new Map();
    this.machineInfo = new Map();
    this.id = new Map();
  }

  validateHandshake(socket: any, buffer: any): boolean {
    const bufferStr = buffer.toString();
    const keyMatch = bufferStr.match(/Sec-WebSocket-Key:\s*(.*?)\r\n/);

    if (!keyMatch) return false;

    const key = keyMatch[1].trim();
    const newKey = crypto
      .createHash('sha1')
      .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
      .digest('base64');

    const response = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Sec-WebSocket-Version: 13',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${newKey}`,
      '',
      '',
    ].join('\r\n');

    socket.write(response);
    return true;
  }

  sendCmdToClient(socket: net.Socket, retTxt: string) {
    if (!retTxt || retTxt.length === 0) return 0;

    const size = retTxt.length;
    let bufferCommand;

    if (size < 126) {
      bufferCommand = Buffer.from([129, size]);
    } else if (size < 65536) {
      bufferCommand = Buffer.alloc(4);
      bufferCommand[0] = 129;
      bufferCommand[1] = 126;
      bufferCommand.writeUInt16BE(size, 2);
    } else {
      bufferCommand = Buffer.alloc(10);
      bufferCommand[0] = 129;
      bufferCommand[1] = 127;
      bufferCommand.writeUInt32BE(0, 2);
      bufferCommand.writeUInt32BE(size, 6);
    }

    bufferCommand = Buffer.concat([bufferCommand, Buffer.from(retTxt)]);
    socket.write(bufferCommand);
    // console.log(`Write: ${bufferCommand[0]}:${bufferCommand[1]}: ${retTxt}`);
  }

  async onFrame(
    packet: string,
    socket: net.Socket,
    address: string,
    port: number,
    optcode: number,
  ) {
    let retTxt = '';

    if (optcode === 9) {
      const retTxt = Buffer.from([118, 0]);
      const bufferCommand = Buffer.concat([
        Buffer.from([129, retTxt.length]),
        retTxt,
      ]);
      socket.write(bufferCommand);
    }

    let currentTime = this.getCurrentTime();

    try {
      if (!isObject(packet) && !isParsableToJson(packet)) {
        this.logger.log(`Ping from ${address}:${port}`);
        return;
      } else {
        this.logger.verbose(`Received command: ${packet}`);
      }

      const packetObj = JSON.parse(packet) as RegisterDeviceMessage;
      // this.processClientData(packetObj);

      if (packetObj.cmd) {
        switch (packetObj.cmd) {
          case 'reg':
            this.logger.verbose(`Incoming Device: ${packetObj.sn}`);
            this.id.set(`id${address}_${port}`, packetObj.sn);
            this.machineInfo.set(packetObj.sn, `${address}:${port}`);
            this.machines.get(socket).id = packetObj.sn;

            const branch =
              await this.branchService.getBranchByDeviceSerialNumber(
                packetObj.sn,
              );
            if (branch) {
              this.logger.verbose(
                `This device is already registered: ${packetObj.sn}`,
              );

              currentTime = this.getCurrentTime(branch.timezone);
              retTxt = this.createResponse('reg', true, currentTime);
            } else {
              this.logger.verbose(
                `This device is not yet registered: ${packetObj.sn}`,
              );
              // This is just a dummy response to keep the device send message to the server if the device is not registered
              retTxt = this.createResponse(
                'just-a-dummy-response',
                true,
                currentTime,
              );
            }
            break;

          case 'sendlog':
            const clockRecords = await this.clockService.addRecord(
              packetObj as TimeSyncMessage,
            );
            currentTime = this.getCurrentTime(clockRecords[0].timezone);
            retTxt = this.createResponse('sendlog', true, currentTime);
            break;

          case 'sendqrcode':
            retTxt = JSON.stringify({
              ret: 'sendqrcode',
              result: true,
              access: 1,
              enrollid: 10,
              username: 'test',
            });
            break;

          case 'senduser':
            const user = await this.userService.createUserFromDevice(
              packetObj as UpSertUserMessage,
            );
            currentTime = this.getCurrentTime(user.timezone);
            retTxt = this.createResponse('senduser', true, currentTime);
            break;

          default:
            currentTime = this.getCurrentTime();
            retTxt = this.createResponse(packetObj.cmd, true, currentTime);
            break;
        }
      } else {
        this.logger.error('Error parsing packet:', packetObj);
      }
    } catch (error) {
      retTxt = this.createResponse(
        (JSON.parse(packet) as RegisterDeviceMessage).cmd,
        true,
        currentTime,
      );
      this.logger.error(error);
    }

    // Send response
    if (retTxt.length > 0) {
      this.sendCmdToClient(socket, retTxt);
    }
  }

  // async processClientData(data: RegisterDeviceMessage) {
  //   if (data.cmd === 'reg') {
  //     this.logger.verbose(`Incoming Device: ${data.sn}`);
  //     // const isRegistered = await this.branchService.isDeviceRegistered(data.sn);
  //     // if (!isRegistered) {
  //     //   this.branchService.registerDevice(data);
  //     // } else {
  //     //   this.logger.warn(`Device already registered: ${data.sn}`);
  //     // }
  //   } else if (data.cmd === 'senduser') {
  //     await this.userService.createUserFromDevice(data as UpSertUserMessage);
  //   } else if (data.cmd === 'sendlog') {
  //     await this.clockService.addRecord(data as TimeSyncMessage);
  //   } else {
  //     this.logger.warn(`Unknown command: ${data.cmd}`);
  //     console.log(data);
  //   }
  // }

  private createResponse(
    cmd: string,
    result: boolean,
    cloudtime: string,
  ): string {
    return JSON.stringify({
      ret: cmd,
      result,
      cloudtime, // remove this for now to avoid time sync issue with the device
    });
  }

  private getCurrentTime(timezone: string = 'Asia/Manila'): string {
    const date = new Date();
    const zonedDate = toZonedTime(date, timezone);

    return format(zonedDate, 'yyyy-MM-dd HH:mm:ss');
  }
}
