'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Shield, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/api'

const plans = [
  { id: 'starter', name: 'Starter', price: 49.90, features: ['Até 50 clientes', 'CR e GT', 'Documentos básicos', 'Suporte via email'] },
  { id: 'premium', name: 'Premium', price: 97.00, features: ['Clientes ilimitados', 'CR, CRAF e GT', 'WhatsApp + Assinatura digital', 'Radar de Renovação', 'Suporte prioritário'] },
]

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('premium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'plan' | 'data'>('plan')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    password: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const slug = form.company
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    try {
      const res = await auth.register({
        name: form.name,
        email: form.email,
        password: form.password,
        companyName: form.company,
        slug,
      })
      localStorage.setItem('accessToken', res.accessToken)
      localStorage.setItem('refreshToken', res.refreshToken)
      document.cookie = `accessToken=${res.accessToken}; path=/; max-age=86400`
      router.push('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta'
      setError(Array.isArray(msg) ? msg.join(', ') : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#0B2545] via-[#13315C] to-[#134074] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#3E92CC] to-[#134074] rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-none">CONTROLE</div>
            <div className="text-[#3E92CC] text-xs font-semibold tracking-widest">BÉLICO</div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            Comece grátis por<br />
            <span className="text-[#3E92CC]">14 dias</span>
          </h2>
          <p className="text-white/60">Sem cartão de crédito. Cancele quando quiser.</p>
          <div className="space-y-3">
            {['Configuração em menos de 5 minutos', 'Importação de clientes em planilha', 'Suporte técnico no onboarding', 'Dados protegidos e criptografados'].map((t) => (
              <div key={t} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#00C853] flex-shrink-0" />
                <span className="text-white/80 text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs">© 2026 Controle Bélico. Todos os direitos reservados.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-lg space-y-8">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-[#3E92CC] to-[#134074] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="font-bold text-foreground">CONTROLE BÉLICO</div>
          </div>

          {step === 'plan' ? (
            <>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Escolha seu plano</h1>
                <p className="text-muted-foreground text-sm mt-1">14 dias grátis · sem cartão de crédito</p>
              </div>

              <div className="space-y-3">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full text-left rounded-2xl p-5 border-2 transition-all ${
                      selectedPlan === plan.id
                        ? 'border-[#3E92CC] bg-[#3E92CC]/5'
                        : 'border-border bg-card hover:border-[#3E92CC]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPlan === plan.id ? 'border-[#3E92CC]' : 'border-muted-foreground'}`}>
                          {selectedPlan === plan.id && <div className="w-2 h-2 rounded-full bg-[#3E92CC]" />}
                        </div>
                        <span className="font-bold text-foreground">{plan.name}</span>
                        {plan.id === 'premium' && (
                          <span className="text-xs bg-[#FFAB00]/15 text-[#FFAB00] px-2 py-0.5 rounded-full font-medium">Recomendado</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-extrabold text-foreground">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                        <span className="text-xs text-muted-foreground">/mês</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 text-[#00C853] flex-shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              <Button onClick={() => setStep('data')} className="w-full h-12 bg-[#0B2545] hover:bg-[#13315C] font-semibold">
                Continuar com {plans.find((p) => p.id === selectedPlan)?.name} →
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Já tem conta?{' '}
                <Link href="/login" className="text-[#3E92CC] hover:underline font-medium">
                  Entrar
                </Link>
              </p>
            </>
          ) : (
            <>
              <div>
                <button onClick={() => setStep('plan')} className="text-xs text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1">
                  ← Voltar
                </button>
                <h1 className="text-2xl font-bold text-foreground">Criar sua conta</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Plano <strong>{plans.find((p) => p.id === selectedPlan)?.name}</strong> selecionado
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">SEU NOME</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="João Silva"
                      className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">TELEFONE</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">NOME DO ESCRITÓRIO / EMPRESA</label>
                  <input
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Despachante Silva Ltda."
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">E-MAIL PROFISSIONAL</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="joao@escritorio.com.br"
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">SENHA</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-4 py-3 pr-12 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Ao criar sua conta, você concorda com nossos{' '}
                  <a href="#" className="text-[#3E92CC] hover:underline">Termos de Uso</a> e{' '}
                  <a href="#" className="text-[#3E92CC] hover:underline">Política de Privacidade</a>.
                </p>

                {error && (
                  <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
                )}

                <Button type="submit" disabled={loading} className="w-full h-12 bg-[#0B2545] hover:bg-[#13315C] font-semibold">
                  {loading ? 'Criando conta...' : 'Criar conta grátis →'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
