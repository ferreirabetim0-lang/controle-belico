import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { SupabaseModule } from './supabase/supabase.module'
import { AuthModule } from './modules/auth/auth.module'
import { ClientsModule } from './modules/clients/clients.module'
import { ProcessesModule } from './modules/processes/processes.module'
import { DocumentsModule } from './modules/documents/documents.module'
import { FinancialModule } from './modules/financial/financial.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { AutomationsModule } from './modules/automations/automations.module'
import { CompaniesModule } from './modules/companies/companies.module'
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module'
import { SignaturesModule } from './modules/signatures/signatures.module'
import { LeadsModule } from './modules/leads/leads.module'
import { UsersModule } from './modules/users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: false, envFilePath: ['.env', 'apps/backend/.env'] }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    SupabaseModule,
    AuthModule,
    CompaniesModule,
    ClientsModule,
    ProcessesModule,
    DocumentsModule,
    FinancialModule,
    NotificationsModule,
    AutomationsModule,
    SubscriptionsModule,
    SignaturesModule,
    LeadsModule,
    UsersModule,
  ],
})
export class AppModule {}
