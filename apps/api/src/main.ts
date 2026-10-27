import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import { AppLogger } from "./common/logger";
import helmet from "helmet";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, rawBody: true });
  const appLogger = await app.resolve(AppLogger);
  app.useLogger(appLogger);
  const logger = new Logger("Bootstrap");

  app.setGlobalPrefix("v1");

  // Security Middleware
  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  logger.log(`🚀 API running on http://localhost:${port}/v1`);
}

bootstrap();
