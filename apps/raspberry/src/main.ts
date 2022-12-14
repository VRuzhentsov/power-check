import {NestFactory} from '@nestjs/core';
import {RaspberryModule} from './raspberry.module';

async function bootstrap() {
  const app = await NestFactory.create(RaspberryModule);
  await app.listen(3000);
}
bootstrap();
