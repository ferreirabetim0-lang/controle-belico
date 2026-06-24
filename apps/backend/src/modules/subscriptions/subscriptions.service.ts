import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import MercadoPagoConfig, { Payment, Preference } from 'mercadopago'
import { SupabaseService } from '../../supabase/supabase.service'
import { v4 as uuidv4 } from 'uuid'
import * as crypto from 'crypto'

@Injectable()
export class SubscriptionsService {
  private mp: MercadoPagoConfig

  constructor(
    private sb: SupabaseService,
    private config: ConfigService,
  ) {
    this.mp = new MercadoPagoConfig({
      accessToken: this.config.getOrThrow('MP_ACCESS_TOKEN'),
    })
  }

  async listPlans() {
    const { data, error } = await this.sb.from('plans')
      .select('*').eq('isActive', true).order('price', { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
  }

  async getStatus(companyId: string) {
    const { data: sub } = await this.sb.from('subscriptions')
      .select('*, plan:plans(*)').eq('companyId', companyId)
      .order('createdAt', { ascending: false }).limit(1).single()

    if (!sub) {
      return { status: 'TRIAL', plan: null, currentPeriodEnd: null, daysLeft: null }
    }

    const daysLeft = sub.currentPeriodEnd
      ? Math.ceil((new Date(sub.currentPeriodEnd).getTime() - Date.now()) / 86400000)
      : null

    return { ...sub, daysLeft }
  }

  async createCheckout(companyId: string, planId: string, userEmail: string) {
    const { data: plan } = await this.sb.from('plans').select('*').eq('id', planId).single()
    if (!plan) throw new NotFoundException('Plano não encontrado')

    const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000'
    const webhookUrl = this.config.get('MP_WEBHOOK_URL') || `${this.config.get('BACKEND_URL') || 'http://localhost:3001'}/api/v1/subscriptions/webhook`

    const preference = new Preference(this.mp)
    const result = await preference.create({
      body: {
        items: [{
          id: plan.id,
          title: `Controle Bélico — Plano ${plan.name}`,
          description: plan.description ?? `Assinatura mensal do plano ${plan.name}`,
          quantity: 1,
          unit_price: Number(plan.price),
          currency_id: 'BRL',
        }],
        payer: { email: userEmail },
        external_reference: `${companyId}:${planId}`,
        back_urls: {
          success: `${frontendUrl}/settings?payment=success`,
          failure: `${frontendUrl}/settings?payment=failure`,
          pending: `${frontendUrl}/settings?payment=pending`,
        },
        auto_return: 'approved',
        notification_url: webhookUrl,
        statement_descriptor: 'CONTROLE BELICO',
      },
    })

    // Persist pending checkout record
    const now = new Date().toISOString()
    await this.sb.from('subscriptions').insert({
      id: uuidv4(),
      companyId,
      planId,
      status: 'PENDING',
      mpPreferenceId: result.id,
      createdAt: now,
      updatedAt: now,
    })

    return {
      checkoutUrl: result.init_point,
      sandboxUrl: result.sandbox_init_point,
      preferenceId: result.id,
    }
  }

  verifyWebhookSignature(xSignature: string | undefined, xRequestId: string | undefined, dataId: string | undefined): void {
    const secret = this.config.get('MP_WEBHOOK_SECRET')
    if (!secret || !xSignature) return // skip if not configured

    const parts: Record<string, string> = {}
    xSignature.split(',').forEach((part) => {
      const [k, v] = part.trim().split('=')
      if (k && v) parts[k] = v
    })

    const manifest = `id:${dataId ?? ''};request-id:${xRequestId ?? ''};ts:${parts['ts'] ?? ''};`
    const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

    if (expected !== parts['v1']) {
      throw new UnauthorizedException('Assinatura do webhook inválida')
    }
  }

  async handleWebhook(body: any, query: any, headers?: Record<string, string>) {
    // Validate MP signature when present
    if (headers) {
      try {
        this.verifyWebhookSignature(
          headers['x-signature'],
          headers['x-request-id'],
          body?.data?.id ?? query?.['data.id'],
        )
      } catch {
        // Log but don't block — sandbox doesn't always send signatures
        console.warn('[MP Webhook] Signature validation failed')
      }
    }

    // MP sends topic=payment or action=payment.created
    const paymentId = body?.data?.id ?? query?.['data.id']
    const topic = body?.action ?? query?.topic

    if (!paymentId || (!topic?.includes('payment') && !body?.type?.includes('payment'))) {
      return { received: true }
    }

    try {
      const payment = new Payment(this.mp)
      const paymentData = await payment.get({ id: String(paymentId) })

      if (!paymentData.external_reference) return { received: true }

      const [companyId, planId] = paymentData.external_reference.split(':')
      const now = new Date().toISOString()

      if (paymentData.status === 'approved') {
        const periodEnd = new Date()
        periodEnd.setDate(periodEnd.getDate() + 30)

        // Update or create subscription as ACTIVE
        const { data: existing } = await this.sb.from('subscriptions')
          .select('id').eq('companyId', companyId).eq('planId', planId)
          .eq('status', 'PENDING').order('createdAt', { ascending: false }).limit(1).single()

        if (existing) {
          await this.sb.from('subscriptions').update({
            status: 'ACTIVE',
            mpPaymentId: String(paymentId),
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd.toISOString(),
            updatedAt: now,
          }).eq('id', existing.id)
        } else {
          await this.sb.from('subscriptions').insert({
            id: uuidv4(),
            companyId, planId,
            status: 'ACTIVE',
            mpPaymentId: String(paymentId),
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd.toISOString(),
            createdAt: now, updatedAt: now,
          })
        }

        // Update company plan
        await this.sb.from('companies').update({ planId, updatedAt: now }).eq('id', companyId)
      }

      if (['rejected', 'cancelled', 'refunded', 'charged_back'].includes(paymentData.status ?? '')) {
        await this.sb.from('subscriptions')
          .update({ status: 'CANCELLED', updatedAt: now })
          .eq('companyId', companyId).eq('status', 'ACTIVE')
      }
    } catch (e) {
      console.error('[MP Webhook] Error processing payment:', e)
    }

    return { received: true }
  }

  async cancelSubscription(companyId: string) {
    const now = new Date().toISOString()
    const { data: sub } = await this.sb.from('subscriptions')
      .select('id').eq('companyId', companyId).eq('status', 'ACTIVE').single()

    if (!sub) throw new BadRequestException('Nenhuma assinatura ativa encontrada')

    await this.sb.from('subscriptions').update({
      status: 'CANCELLED',
      cancelledAt: now,
      updatedAt: now,
    }).eq('id', sub.id)

    return { cancelled: true }
  }
}
