import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Security
  app.use(helmet())

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })

  // Global prefix
  app.setGlobalPrefix('api/v1')

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Controle Bélico API')
    .setDescription('API REST para o sistema de gestão bélica Controle Bélico')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação e autorização')
    .addTag('clients', 'Gestão de clientes')
    .addTag('processes', 'Gestão de processos (CR, CRAF, GT)')
    .addTag('documents', 'Gestão documental')
    .addTag('financial', 'Módulo financeiro')
    .addTag('notifications', 'Notificações e alertas')
    .addTag('reports', 'Relatórios gerenciais')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`🚀 Controle Bélico API rodando na porta ${port}`)
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`)
}

bootstrap()
