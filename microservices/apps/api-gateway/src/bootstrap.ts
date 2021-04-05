import {NestFactory} from '@nestjs/core';
import {ApiGatewayModule} from './api-gateway.module';

export async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  await app.listen(3000);

  return app;
}
