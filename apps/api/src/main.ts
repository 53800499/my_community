import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { ProblemDetailsFilter } from './platform/http/rfc7807-exception.filter.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT ?? 3001;
  const apiPrefix = process.env.API_PREFIX ?? '/api/v1';

  // 1. Préfixe d'API Global (/api/v1)
  app.setGlobalPrefix(apiPrefix.replace(/^\//, ''));

  // 2. CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true,
  });

  // 3. Validation Globale des DTOs (whitelist & auto-transform)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 4. Filtre d'Erreurs RFC 7807 (Problem Details)
  app.useGlobalFilters(new ProblemDetailsFilter());

  // 5. Documentation OpenAPI / Swagger (ADR-007)
  const config = new DocumentBuilder()
    .setTitle('My Community API')
    .setDescription(
      'Spécification OpenAPI officielle du Monolithe Modulaire My Community (Plateforme citoyenne multi-communautés)',
    )
    .setVersion('2.1')
    .addBearerAuth()
    .addTag('Health', 'Sondes de vie et disponibilité')
    .addTag('Communities', 'Gestion des communautés territoriales et thématiques')
    .addTag('Associations', 'Gestion des associations partenaires et multi-rattachements')
    .addTag('Finance', 'Transactions financières immuables en XOF')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix.replace(/^\//, '')}/docs`, app, document, {
    jsonDocumentUrl: `${apiPrefix.replace(/^\//, '')}/swagger-json`,
  });

  await app.listen(port);
  logger.log(`Serveur My Community démarré sur : http://localhost:${port}`);
  logger.log(`Documentation Swagger disponible sur : http://localhost:${port}${apiPrefix}/docs`);
}

bootstrap();
