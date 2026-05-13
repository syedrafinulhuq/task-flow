import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { initDB } from './models/database';

async function bootstrap() {
  await initDB();

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const config = new DocumentBuilder()
    .setTitle('Task-Flow API')
    .setDescription(
      'RESTful API for the Task-Flow personal task manager.\n\n' +
      '`200` OK · `201` Created · `204` No Content · `400` Bad Request · `404` Not Found · `500` Internal Server Error'
    )
    .setVersion('1.0')
    .addTag('Tasks', 'CRUD operations for task management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      docExpansion: 'list',
      filter: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Task-Flow API Docs',
    customCss: `
      .swagger-ui .topbar { background-color: #0a0a0f; }
      .swagger-ui .topbar-wrapper img { display: none; }
      .swagger-ui .topbar-wrapper::after { content: 'Task-Flow API'; color: #7c6af7; font-weight: 700; font-size: 18px; }
    `,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Task-Flow API    → http://localhost:${port}`);
  console.log(`Swagger UI docs  → http://localhost:${port}/api/docs`);
}

bootstrap();