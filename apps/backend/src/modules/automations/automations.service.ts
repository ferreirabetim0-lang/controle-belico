import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { SupabaseService } from '../../supabase/supabase.service'

@Injectable()
export class AutomationsService {
  private readonly logger = new Logger(AutomationsService.name)

  constructor(private sb: SupabaseService) {}

  @Cron('0 8 * * *')
  async runDailyChecks() {
    this.logger.log('Executando verificações automáticas diárias...')

    const { data: companies } = await this.sb.from('companies').select('id').eq('isActive', true)
    if (!companies) return

    for (const company of companies) {
      await this.checkExpiringDocuments(company.id)
      await this.checkPaymentsDue(company.id)
    }

    this.logger.log(`Verificações concluídas para ${companies.length} empresas.`)
  }

  private async checkExpiringDocuments(companyId: string) {
    const thresholds = [7, 15, 30]
    const today = new Date()

    for (const days of thresholds) {
      const target = new Date(today.getTime() + days * 86400000).toISOString()
      const dayBefore = new Date(today.getTime() + (days - 1) * 86400000).toISOString()

      const { data: docs } = await this.sb.from('documents')
        .select('id, category, client:clients!inner(id, name, companyId)')
        .eq('clients.companyId', companyId)
        .gte('expiresAt', dayBefore).lte('expiresAt', target)

      if (!docs?.length) continue

      for (const doc of docs) {
        const client = (doc as any).client
        await this.sb.from('notifications').insert({
          companyId, clientId: client.id,
          type: 'EXPIRING_DOCUMENT',
          title: `Documento vencendo em ${days} dias`,
          message: `${doc.category} de ${client.name} vence em ${days} dias`,
          status: 'UNREAD',
          createdAt: new Date().toISOString(),
        })
      }
    }
  }

  private async checkPaymentsDue(companyId: string) {
    const today = new Date().toISOString()

    const { data: overduePayments } = await this.sb.from('financial_transactions')
      .select('id, clientId, description, amount')
      .eq('companyId', companyId).eq('status', 'PENDING').lte('dueDate', today)

    if (!overduePayments?.length) return

    for (const payment of overduePayments) {
      await this.sb.from('financial_transactions').update({ status: 'OVERDUE' }).eq('id', payment.id)
      await this.sb.from('notifications').insert({
        companyId, clientId: payment.clientId,
        type: 'PENDING_PAYMENT',
        title: 'Pagamento em atraso',
        message: `${payment.description} — R$ ${Number(payment.amount).toFixed(2)}`,
        status: 'UNREAD',
        createdAt: new Date().toISOString(),
      })
    }
  }
}
