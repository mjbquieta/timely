import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { Logger } from '@nestjs/common';
import * as http from 'http';
import * as net from 'net';
import * as crypto from 'crypto';
import { WebsocketService } from './websocket.service';

// // Global variables (equivalent to PHP globals)
// const machines = new Map(); // socket -> {address, port, data, constat, id}
// const machineInfo = new Map(); // id -> address:port
// const id = new Map(); // address:port -> id

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly websocketService: WebsocketService) {}
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  private tcpServer: net.Server;

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');

    // Create TCP server like in the Node.js example
    this.tcpServer = net.createServer((socket) => {
      const address = socket.remoteAddress?.replace('::ffff:', '') || 'unknown';
      const port = socket.remotePort || 0;
      const socketId = `id${address}_${port}`;

      this.logger.verbose(
        `Accept connection: ${address}:${port} ${new Date().toLocaleTimeString(
          'en-US',
          { hour12: false },
        )}`,
      );

      // Initialize socket data
      this.websocketService.machines.set(socket, {
        address,
        port,
        data: '',
        constat: false, // handshake status
        id: null,
      });

      // Handle data from client
      socket.on('data', (frame) => {
        const socketData = this.websocketService.machines.get(socket);
        if (!socketData) {
          throw new Error('Socket data not found');
        }

        // Handle WebSocket handshake
        if (!socketData.constat) {
          if (this.websocketService.validateHandshake(socket, frame)) {
            socketData.constat = true;
            this.logger.verbose(
              `Connected: ${address}:${port} ${new Date().toLocaleTimeString(
                'en-US',
                { hour12: false },
              )}`,
            );
          } else {
            this.logger.error(`Handshake failed: ${frame.toString()}`);
          }
        }

        // Handle WebSocket frames
        let dataRec = socketData.data || '';
        dataRec += frame.toString('binary');
        let newDataLen = dataRec.length;

        let needLen = 2; // data header

        while (newDataLen > needLen) {
          // Get opcode
          const optcode = dataRec.charCodeAt(0) & 15;

          const b2 = dataRec.charCodeAt(1);
          const mask = (b2 & 128) !== 0;
          let payloadLength = b2 & 127;

          if (payloadLength === 126) {
            needLen += 2;
          } else if (payloadLength > 126) {
            needLen += 8;
          }

          if (newDataLen < needLen) break;

          let nDataPos = 2;
          const maxPacketSize = newDataLen;

          if (!(payloadLength >= 0 && payloadLength <= 125)) {
            if (payloadLength === 126) {
              payloadLength = dataRec.charCodeAt(nDataPos + 1);
              payloadLength += dataRec.charCodeAt(nDataPos) << 8;
              nDataPos += 2;
            } else {
              payloadLength = dataRec.charCodeAt(nDataPos + 7);
              payloadLength += dataRec.charCodeAt(nDataPos + 6) << 8;
              payloadLength += dataRec.charCodeAt(nDataPos + 5) << 16;
              payloadLength += dataRec.charCodeAt(nDataPos + 4) << 24;
              nDataPos += 8;
            }
          }

          if (payloadLength >= 0 && payloadLength < 1024 * 1024 * 2) {
            needLen += mask ? 4 : 0;
            needLen += payloadLength;

            if (maxPacketSize < needLen) {
              break;
            }

            let packet = '';
            if (mask) {
              const maskPos = nDataPos;
              nDataPos += 4;

              for (let i = 0; i < payloadLength; i++) {
                packet += String.fromCharCode(
                  dataRec.charCodeAt(i + nDataPos) ^
                    dataRec.charCodeAt(maskPos + (i % 4)),
                );
              }
              nDataPos += payloadLength;
            } else {
              packet = dataRec.substr(nDataPos, maxPacketSize - nDataPos);
              nDataPos = maxPacketSize;
            }

            this.websocketService.onFrame(
              packet,
              socket,
              address,
              port,
              optcode,
            );

            if (nDataPos === newDataLen) {
              dataRec = '';
              newDataLen = 0;
            } else {
              dataRec = dataRec.substr(nDataPos, newDataLen - nDataPos);
              newDataLen -= nDataPos;
              this.logger.log(`Next: ${newDataLen}`);
            }
          } else {
            this.logger.error(`Error length: ${payloadLength}`);
            break;
          }
          needLen = 2;
        }

        socketData.data = dataRec;
      });

      // Handle client disconnect
      socket.on('close', () => {
        this.logger.verbose(
          `Disconnected: ${address}:${port} ${new Date().toLocaleTimeString(
            'en-US',
            { hour12: false },
          )}`,
        );
        this.websocketService.machines.delete(socket);
        this.websocketService.id.delete(socketId);
      });

      socket.on('error', (err) => {
        this.logger.error(`Socket error: ${address}:${port} - ${err.message}`);
        this.websocketService.machines.delete(socket);
        this.websocketService.id.delete(socketId);
      });
    });

    // Start the server
    this.tcpServer.listen(7788, '0.0.0.0', () => {
      this.logger.log('WebSocket server listening on 0.0.0.0:7788');
    });

    // Handle server errors
    this.tcpServer.on('error', (err) => {
      this.logger.error('Server error:', err);
    });
  }

  handleConnection(client: WebSocket) {
    this.logger.log(`Client connected: ${client.url}`);
  }

  handleDisconnect(client: WebSocket) {
    this.logger.log(`Client disconnected: ${client.url}`);
  }

  // Method to broadcast to all connected clients
  broadcastToAll(data: any) {
    if (this.tcpServer) {
      for (const [socket, socketData] of this.websocketService.machines) {
        if (socketData.id) {
          this.websocketService.sendCmdToClient(socket, JSON.stringify(data));
        }
      }
    }
  }

  // Method to emit to specific client
  emitToClient(client: any, data: any) {
    if (client && client.write) {
      this.websocketService.sendCmdToClient(client, JSON.stringify(data));
    }
  }
}
