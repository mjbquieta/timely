import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { useContainer } from 'class-validator';
import { WsAdapter } from '@nestjs/platform-ws';
import { HttpExceptionFilter } from './common/exceptions/filter.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // For class-validator to work
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Enable WebSocket support with raw WebSocket protocol
  app.useWebSocketAdapter(new WsAdapter(app));

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // app.useGlobalFilters(new HttpExceptionFilter());

  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT') || 3000;
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`🔌 WebSocket server is running on: ws://localhost:${port}`);
  await app.listen(port);
}
bootstrap();
