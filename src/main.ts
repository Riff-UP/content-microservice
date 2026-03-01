import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('Content-MS');

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: envs.host,
      port: envs.tcpPort,
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [envs.rabbitUrl],
      queue: 'riff_queue',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  await app.listen(envs.port);

  logger.log(`Application is running on port ${envs.port}`);
  logger.log(`Servidor HTTP corriendo en el puerto ${envs.port}`);
  logger.log(`Microservicio TCP escuchando en el puerto ${envs.tcpPort}`);
}

bootstrap();
