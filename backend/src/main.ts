import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { BackendEnvironment } from './config/environment';
import { validateEnvironment } from './config/environment';
import { config as loadEnvironment } from 'dotenv';
import { socialApplication } from './modules/auth/social/social.module';
import { SafeLogger } from './common/safe-logger.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiErrorResponse } from './common/api-error.dto';

async function bootstrap(): Promise<void> {
  loadEnvironment({ quiet: true });
  const environment = validateEnvironment(process.env);
  const root = environment.AUTH_GOOGLE_ENABLED || environment.AUTH_APPLE_ENABLED ? socialApplication(environment) : AppModule;
  const app = await NestFactory.create(root, { logger: new SafeLogger() });
  app.useLogger(app.get(SafeLogger));
  app.enableShutdownHooks();
  const config = app.get(ConfigService<BackendEnvironment, true>);
  if (config.get('API_DOCS_ENABLED', { infer: true })) {
    const document = SwaggerModule.createDocument(app,
      new DocumentBuilder().setTitle('AAyuva API').setVersion('0.1.0').addBearerAuth(undefined, 'access').addBearerAuth(undefined, 'onboarding').addBearerAuth(undefined, 'primary_identity').build(),
      { extraModels: [ApiErrorResponse] });
    SwaggerModule.setup('docs', app, document);
  }
  await app.listen(config.get('PORT', { infer: true }));
}

void bootstrap().catch(() => {
  // Bootstrap errors may contain connection strings; avoid printing raw exceptions.
  process.stderr.write('Backend startup failed.\n');
  process.exitCode = 1;
});
