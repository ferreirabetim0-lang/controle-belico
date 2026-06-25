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
  const allowedOrigins = [
    'http://localhost:3000',
    'https://controle-belico.vercel.app',
    process.env.FRONTEND_URL,
  ].filter(Boolean)

  app.enableCors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true)
      if (allowedOrigins.some((o) => origin === o || origin.endsWith('.vercel.app'))) {
        return callback(null, true)
      }
      callback(new Error(`CORS bloqueado: ${origin}`))
    },
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
