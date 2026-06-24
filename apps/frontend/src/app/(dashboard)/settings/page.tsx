'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Building2, User, Bell, Shield, CreditCard, Users, Save, Check, Loader2, AlertCircle, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/use-api'
import { subscriptions, type Plan, type Subscription } from '@/lib/api'

const tabs = [
  { id: 'company', label: 'Empresa', icon: Building2 },
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'team', label: 'Equipe', icon: Users },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'security', label: 'Segurança', icon: Shield },
  { id: 'plan', label: 'Plano', icon: CreditCard },
]

const STATUS_CONFIG = {
  ACTIVE: { label: 'Ativo', color: 'text-[#00C853]', bg: 'bg-[#00C853]/10', icon: CheckCircle2 },
  TRIAL: { label: 'Trial', color: 'text-[#3E92CC]', bg: 'bg-[#3E92CC]/10', icon: CheckCircle2 },
  INACTIVE: { label: 'Inativo', color: 'text-muted-foreground', bg: 'bg-muted', icon: XCircle },
  SUSPENDED: { label: 'Suspenso', color: 'text-[#FFAB00]', bg: 'bg-[#FFAB00]/10', icon: AlertCircle },
  CANCELLED: { label: 'Cancelado', color: 'text-[#D50000]', bg: 'bg-[#D50000]/10', icon: XCircle },
  PENDING: { label: 'Aguard. Pagamento', color: 'text-[#FFAB00]', bg: 'bg-[#FFAB00]/10', icon: AlertCircle },
}

function PlanTab() {
  const searchParams = useSearchParams()
  const payment = searchParams.get('payment')

  const { data: sub, loading: loadingSub, refetch: refetchSub } = useApi(() => subscriptions.status(), [])
  const { data: plans, loading: loadingPlans } = useApi(() => subscriptions.plans(), [])
  const [checkingOut, setCheckingOut] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (payment === 'success') refetchSub()
  }, [payment])

  async function handleCheckout(planId: string) {
    setCheckingOut(planId)
    try {
      const result = await subscriptions.checkout(planId)
      // In dev use sandboxUrl, in prod use checkoutUrl
      const url = process.env.NODE_ENV === 'production' ? result.checkoutUrl : result.sandboxUrl
      window.open(url, '_blank')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao iniciar checkout')
    } finally {
      setCheckingOut(null)
    }
  }

  async function handleCancel() {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) return
    setCancelling(true)
    try {
      await subscriptions.cancel()
      refetchSub()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao cancelar')
    } finally {
      setCancelling(false)
    }
  }

  const currentPlanId = sub?.plan?.id
  const statusCfg = sub ? (STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.INACTIVE) : null
  const StatusIcon = statusCfg?.icon ?? CheckCircle2
  const isActive = sub?.status === 'ACTIVE' || sub?.status === 'TRIAL'

  return (
    <div className="space-y-5">
      {/* Payment feedback banner */}
      {payment === 'success' && (
        <div className="flex items-center gap-3 bg-[#00C853]/10 border border-[#00C853]/30 rounded-2xl p-4 text-[#00C853]">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-sm">Pagamento confirmado!</div>
            <div className="text-xs opacity-80">Sua assinatura foi ativada com sucesso.</div>
          </div>
        </div>
      )}
      {payment === 'failure' && (
        <div className="flex items-center gap-3 bg-[#D50000]/10 border border-[#D50000]/30 rounded-2xl p-4 text-[#D50000]">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-sm">Pagamento não aprovado</div>
            <div className="text-xs opacity-80">Tente novamente com outro método de pagamento.</div>
          </div>
        </div>
      )}
      {payment === 'pending' && (
        <div className="flex items-center gap-3 bg-[#FFAB00]/10 border border-[#FFAB00]/30 rounded-2xl p-4 text-[#FFAB00]">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-sm">Pagamento pendente</div>
            <div className="text-xs opacity-80">Aguardando confirmação. Você será notificado quando aprovado.</div>
          </div>
        </div>
      )}

      {/* Current subscription status */}
      {loadingSub ? (
        <div className="bg-gradient-to-br from-[#0B2545] to-[#134074] rounded-2xl p-6 animate-pulse h-32" />
      ) : sub && sub.plan ? (
        <div className="bg-gradient-to-br from-[#0B2545] to-[#134074] rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Plano atual</div>
              <div className="text-3xl font-extrabold">{sub.plan.name}</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-[#3E92CC]">
                R$ {Number(sub.plan.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-white/60">por mês</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full ${statusCfg?.bg} ${statusCfg?.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {statusCfg?.label}
              {sub.daysLeft !== null && sub.daysLeft !== undefined && (
                <span className="opacity-70">· {sub.daysLeft}d restantes</span>
              )}
            </div>
            {sub.currentPeriodEnd && (
              <div className="text-xs text-white/60">
                Próx. cobrança: <strong className="text-white">{new Date(sub.currentPeriodEnd).toLocaleDateString('pt-BR')}</strong>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[#0B2545] to-[#134074] rounded-2xl p-6 text-white">
          <div className="text-xs text-white/60 uppercase tracking-wider mb-2">Sem assinatura ativa</div>
          <div className="text-lg font-semibold">Escolha um plano abaixo para começar</div>
        </div>
      )}

      {/* Plan cards */}
      <div>
        <h3 className="font-bold text-foreground mb-4">
          {isActive ? 'Alterar plano' : 'Escolha seu plano'}
        </h3>
        {loadingPlans ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => <div key={i} className="bg-card border border-border rounded-2xl p-5 h-48 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(plans ?? []).map((plan) => {
              const isCurrent = plan.id === currentPlanId && isActive
              const features: string[] = Array.isArray(plan.features)
                ? plan.features
                : typeof plan.features === 'string'
                  ? JSON.parse(plan.features)
                  : []

              return (
                <div
                  key={plan.id}
                  className={`bg-card border rounded-2xl p-5 flex flex-col gap-4 transition-all ${
                    isCurrent
                      ? 'border-[#3E92CC] ring-2 ring-[#3E92CC]/20'
                      : 'border-border hover:border-[#3E92CC]/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      {isCurrent && (
                        <span className="text-xs font-semibold text-[#3E92CC] bg-[#3E92CC]/10 px-2 py-0.5 rounded-full mb-2 inline-block">
                          Plano atual
                        </span>
                      )}
                      <div className="text-lg font-extrabold text-foreground">{plan.name}</div>
                      {plan.description && <div className="text-xs text-muted-foreground mt-0.5">{plan.description}</div>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-extrabold text-[#0B2545]">
                        R$ {Number(plan.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-muted-foreground">/mês</div>
                    </div>
                  </div>

                  <ul className="space-y-1.5 flex-1">
                    {features.slice(0, 6).map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-[#00C853] flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                    {plan.maxClients && (
                      <li className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-[#00C853] flex-shrink-0" />
                        Até {plan.maxClients === 999999 ? 'ilimitados' : plan.maxClients} clientes
                      </li>
                    )}
                    {plan.maxUsers && (
                      <li className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-[#00C853] flex-shrink-0" />
                        Até {plan.maxUsers === 999999 ? 'ilimitados' : plan.maxUsers} usuários
                      </li>
                    )}
                  </ul>

                  <Button
                    disabled={isCurrent || checkingOut !== null}
                    onClick={() => handleCheckout(plan.id)}
                    className={`w-full gap-2 text-sm ${
                      isCurrent
                        ? 'bg-muted text-muted-foreground cursor-default'
                        : 'bg-[#0B2545] hover:bg-[#13315C] text-white'
                    }`}
                  >
                    {checkingOut === plan.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Abrindo checkout...</>
                    ) : isCurrent ? (
                      <><Check className="w-4 h-4" /> Plano ativo</>
                    ) : (
                      <><ExternalLink className="w-4 h-4" /> {isActive ? 'Mudar para este plano' : 'Assinar agora'}</>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Cancel subscription */}
      {isActive && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h4 className="font-semibold text-foreground mb-1 text-sm">Cancelar assinatura</h4>
          <p className="text-xs text-muted-foreground mb-4">
            Seu acesso continuará ativo até o fim do período atual. Após isso, a conta será suspensa.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-[#D50000]/40 text-[#D50000] hover:bg-[#D50000]/10 gap-2"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            {cancelling ? 'Cancelando...' : 'Cancelar assinatura'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie sua empresa, equipe e preferências</p>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="w-52 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#0B2545] text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          {activeTab === 'company' && (
            <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
              <h2 className="font-bold text-foreground text-lg">Dados da Empresa</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Nome da empresa', value: 'Despachante Silva Ltda.' },
                  { label: 'CNPJ', value: '12.345.678/0001-90' },
                  { label: 'Telefone', value: '(11) 98765-4321' },
                  { label: 'E-mail', value: 'contato@despachante.com.br' },
                  { label: 'Cidade', value: 'São Paulo' },
                  { label: 'Estado', value: 'SP' },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">{f.label}</label>
                    <input defaultValue={f.value} className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
                  </div>
                ))}
              </div>
              <Button className="gap-2 bg-[#0B2545] hover:bg-[#13315C]">
                <Save className="w-4 h-4" /> Salvar alterações
              </Button>
            </div>
          )}

          {activeTab === 'plan' && <PlanTab />}

          {activeTab === 'team' && (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-foreground">Membros da equipe</h2>
                <Button size="sm" className="gap-2 bg-[#0B2545] hover:bg-[#13315C]">
                  <Users className="w-4 h-4" /> Convidar
                </Button>
              </div>
              <div className="divide-y divide-border">
                {[
                  { name: 'Admin', email: 'admin@despachante.com.br', role: 'Administrador' },
                  { name: 'Carlos Oliveira', email: 'carlos@despachante.com.br', role: 'Despachante' },
                  { name: 'Fernanda Rocha', email: 'fernanda@despachante.com.br', role: 'Assistente' },
                ].map((member) => (
                  <div key={member.email} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-9 h-9 bg-gradient-to-br from-[#0B2545] to-[#3E92CC] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.email}</div>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">{member.role}</span>
                    <span className="text-xs text-[#00C853] bg-[#00C853]/10 px-2 py-1 rounded-lg font-medium">Ativo</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'profile' || activeTab === 'notifications' || activeTab === 'security') && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="font-bold text-foreground text-lg mb-4">{tabs.find((t) => t.id === activeTab)?.label}</h2>
              <p className="text-muted-foreground text-sm">Esta seção está em desenvolvimento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
