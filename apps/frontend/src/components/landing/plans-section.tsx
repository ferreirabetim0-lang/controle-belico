'use client'

import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Starter',
    price: '49,90',
    period: '/mês',
    description: 'Ideal para despachantes iniciando sua profissionalização',
    highlight: false,
    features: [
      'Até 100 clientes',
      'Até 2 usuários',
      'Dashboard executivo',
      'CRM de clientes',
      'Gestão documental',
      'Módulo de processos (CR, CRAF, GT)',
      'Central de Pendências',
      'Controle financeiro básico',
      'Suporte por e-mail',
    ],
    cta: 'Começar Grátis',
    ctaVariant: 'outline' as const,
  },
  {
    name: 'Premium',
    price: '97,00',
    period: '/mês',
    description: 'Para despachantes e assessorias que querem escalar sem limites',
    highlight: true,
    badge: 'Mais popular',
    features: [
      'Clientes ilimitados',
      'Usuários ilimitados',
      'Tudo do Starter +',
      'Radar de Renovação',
      'Automações inteligentes',
      'Integração WhatsApp',
      'Assinatura digital',
      'Relatórios avançados (PDF, Excel, CSV)',
      'Funil de vendas Kanban',
      'Auditoria completa',
      'Treinamento personalizado',
      'Suporte prioritário (WhatsApp)',
    ],
    cta: 'Teste Grátis 7 Dias',
    ctaVariant: 'default' as const,
  },
]

export function PlansSection() {
  return (
    <section id="plans" className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-[#3E92CC] text-sm font-semibold uppercase tracking-widest mb-3">
            Planos e Preços
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B2545] dark:text-white mb-4">
            Invista menos do que um almoço por semana
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            7 dias grátis, sem cartão de crédito. Cancele quando quiser. Suporte real de quem entende do segmento.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 border-2 transition-all duration-300 ${
                plan.highlight
                  ? 'border-[#3E92CC] bg-gradient-to-br from-[#0B2545] to-[#134074] shadow-2xl shadow-[#3E92CC]/20 scale-[1.02]'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-[#3E92CC]/50 hover:shadow-soft'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 bg-[#3E92CC] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    <Zap className="w-3 h-3" />
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-[#0B2545] dark:text-white'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.highlight ? 'text-white/60' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-sm ${plan.highlight ? 'text-white/70' : 'text-gray-400'}`}>R$</span>
                  <span className={`text-5xl font-extrabold ${plan.highlight ? 'text-white' : 'text-[#0B2545] dark:text-white'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlight ? 'text-white/60' : 'text-gray-400'}`}>{plan.period}</span>
                </div>
              </div>

              <Link href="/register" className="block mb-6">
                <Button
                  className={`w-full rounded-xl py-3 font-semibold text-base ${
                    plan.highlight
                      ? 'bg-[#3E92CC] hover:bg-[#2d7ab5] text-white shadow-lg'
                      : 'border-2 border-[#0B2545] text-[#0B2545] hover:bg-[#0B2545] hover:text-white dark:border-gray-400 dark:text-gray-400'
                  }`}
                  variant={plan.highlight ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </Link>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-[#00C853]' : 'text-[#00C853]'}`} />
                    <span className={`text-sm ${plan.highlight ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-gray-400 text-sm mt-8"
        >
          Precisa de um plano personalizado para sua assessoria com vários despachantes?{' '}
          <a href="#" className="text-[#3E92CC] hover:underline font-medium">
            Fale conosco
          </a>
        </motion.p>
      </div>
    </section>
  )
}
