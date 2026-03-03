import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from './config';
import { GlobalRpcExceptionFilter, RpcResponseInterceptor } from './common';

// Ensure a global `fetch` is available in Node environments that lack it.
// `undici` is included as a dependency in package.json and provides a
// Fetch-compatible implementation. We only polyfill when `globalThis.fetch`
// is not already defined (e.g., Node < 18).
try {
  if (!globalThis.fetch) {
    // Import undici's fetch and related globals lazily so this file still
    // works in environments where dynamic import isn't desired during tests.

    const undici = require('undici');
    // Assign to globalThis with minimal type assertions.

    (globalThis as any).fetch = undici.fetch;
    // Provide basic globals used by some libs (optional).

    (globalThis as any).Headers = undici.Headers;

    (globalThis as any).Request = undici.Request;

    (globalThis as any).Response = undici.Response;
  }
} catch (err) {
  // If polyfill fails, log and continue; runtime will surface errors when
  // attempting to use fetch. Avoid throwing here to keep bootstrap resilient.

  console.warn(
    'Could not polyfill global fetch with undici:',
    err?.message ?? err,
  );
}

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

  app.useGlobalFilters(new GlobalRpcExceptionFilter());
  app.useGlobalInterceptors(new RpcResponseInterceptor());

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
      queue: 'content_queue',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  await app.listen(envs.port);

  logger.log(`Application is running on port ${envs.port}`);
  logger.log(`Servidor HTTP corriendo en el puerto ${envs.port}`);
  logger.log(`Microservicio TCP escuchando en el puerto ${envs.tcpPort}`);
}

void bootstrap();
