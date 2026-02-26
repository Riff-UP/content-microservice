import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('Content-MS');

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [envs.rabbit_url],
      queue: 'riff.queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  //Inicialización de rabbit
  await app.startAllMicroservices();

  await app.listen(envs.port);

  logger.log(`Application is running on port ${envs.port}`);
}
bootstrap();
