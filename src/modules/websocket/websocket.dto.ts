import { IsString, IsOptional } from 'class-validator';

class WebSocketEventDto {
  @IsString()
  event: string;

  @IsOptional()
  payload?: any;
}

class WebSocketResponseDto {
  message: string;
  payload?: any;
  timestamp: string;
}

export { WebSocketEventDto, WebSocketResponseDto };
