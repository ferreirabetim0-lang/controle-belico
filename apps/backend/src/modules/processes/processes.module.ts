import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { ProcessesController } from './processes.controller'
import { ProcessesService } from './processes.service'

@Module({
  imports: [MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } })],
  controllers: [ProcessesController],
  providers: [ProcessesService],
  exports: [ProcessesService],
})
export class ProcessesModule {}
