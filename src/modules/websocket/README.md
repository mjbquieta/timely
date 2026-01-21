# WebSocket Module

This module provides WebSocket functionality for real-time communication in the attendance API using raw WebSocket protocol.

## Features

- Handles all WebSocket events with a catch-all handler
- Logs all connections, disconnections, and events
- Provides methods to broadcast messages to all clients
- Allows sending messages to specific clients
- CORS enabled for all origins
- Uses raw WebSocket protocol (not Socket.IO)

## Usage

### Client Connection

Connect to the WebSocket server using raw WebSocket:

```javascript
const socket = new WebSocket('ws://localhost:7788');

socket.onopen = () => {
  console.log('Connected to WebSocket server');
};

socket.onclose = () => {
  console.log('Disconnected from WebSocket server');
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### Sending Events

Send any event to the server:

```javascript
// Send a custom event
const message = {
  event: 'user-login',
  payload: { userId: 123, timestamp: new Date() },
};
socket.send(JSON.stringify(message));

// Send another event
const message2 = {
  event: 'attendance-update',
  payload: { attendeeId: 456, status: 'present' },
};
socket.send(JSON.stringify(message2));
```

### Receiving Responses

The server will echo back all events with additional information:

```javascript
socket.onmessage = (event) => {
  const response = JSON.parse(event.data);
  console.log(response);
  // Output: {
  //   message: "Event received",
  //   payload: { userId: 123, timestamp: "..." },
  //   timestamp: "2024-01-01T12:00:00.000Z"
  // }
};
```

### Server-Side Broadcasting

From other services, you can broadcast messages to all connected clients:

```typescript
import { WebsocketService } from './modules/websocket/websocket.service';

@Injectable()
export class SomeService {
  constructor(private readonly websocketService: WebsocketService) {}

  notifyAllClients() {
    this.websocketService.broadcast({
      message: 'Hello to all clients!',
      type: 'info',
    });
  }

  notifySpecificClient(client: WebSocket) {
    this.websocketService.emitToClient(client, {
      message: 'This is a private message',
    });
  }
}
```

## Testing with Postman

1. Create a new WebSocket request in Postman
2. Connect to `ws://localhost:7788`
3. Send messages in this format:
   ```json
   {
     "event": "user-login",
     "payload": {
       "userId": 123,
       "username": "john_doe"
     }
   }
   ```

## Configuration

The WebSocket gateway is configured with CORS enabled for all origins. You can modify the configuration in `websocket.gateway.ts` if needed.

## Logging

The module logs:

- WebSocket gateway initialization
- Client connections and disconnections
- All received events with their payloads
