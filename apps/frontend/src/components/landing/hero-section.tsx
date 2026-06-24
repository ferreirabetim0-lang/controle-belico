'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Star, Shield, Zap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

const stats = [
  { label: 'Despachantes ativos', value: '500+' },
  { label: 'Processos gerenciados', value: '12.000+' },
  { label: 'Documentos organizados', value: '80.000+' },
  { label: 'Satisfação dos clientes', value: '98%' },
]

const highlights = [
  'CR, CRAF e GT em um só lugar',
  'Central de Pendências automática',
  'Radar de Renovação inteligente',
  'WhatsApp e assinatura digital',
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#0B2545] via-[#13315C] to-[#134074]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#3E92CC]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#3E92CC]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full border border-white/[0.05]" />
        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8"
            >
              <Star className="w-4 h-4 text-[#FFAB00] fill-[#FFAB00]" />
              <span className="text-sm text-white/90 font-medium">
                O ERP nº 1 para Despachantes Bélicos do Brasil
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6"
            >
              O ERP Completo para{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3E92CC] to-[#7EC8E3]">
                Despachantes de Armas
              </span>{' '}
              e Clubes de Tiro
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-white/70 mb-8 leading-relaxed max-w-xl"
            >
              Controle clientes, documentos, processos CR, CRAF e GT, financeiro e pendências em um
              único sistema. Sem planilhas, sem caos, sem perder prazos.
            </motion.p>

            {/* Highlights */}
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-2.5 mb-10"
            >
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/85">
                  <CheckCircle2 className="w-5 h-5 text-[#00C853] flex-shrink-0" />
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </motion.ul>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-[#3E92CC] hover:bg-[#2d7ab5] text-white rounded-xl px-8 py-4 text-base font-semibold shadow-lg shadow-[#3E92CC]/30 w-full sm:w-auto"
                >
                  Teste Grátis por 7 Dias
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 rounded-xl px-8 py-4 text-base font-semibold backdrop-blur-sm w-full sm:w-auto"
              >
                Ver Demonstração
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-white/50 text-sm mt-4"
            >
              Sem cartão de crédito • Cancelamento a qualquer momento • Setup em minutos
            </motion.p>
          </div>

          {/* Right — Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
              {/* Mock Dashboard */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-white/50 text-xs">controlebelico.com.br/dashboard</span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Clientes Ativos', value: '284', icon: Users, color: 'text-[#3E92CC]' },
                  { label: 'Processos', value: '47', icon: Shield, color: 'text-[#00C853]' },
                  { label: 'Pendências', value: '12', icon: Zap, color: 'text-[#FFAB00]' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/10 rounded-xl p-3">
                    <stat.icon className={`w-4 h-4 ${stat.color} mb-1`} />
                    <div className="text-white font-bold text-lg">{stat.value}</div>
                    <div className="text-white/50 text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Pending items */}
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">
                  Central de Pendências
                </div>
                {[
                  { name: 'João Mendes', pending: 'Foto 3x4 ausente', urgency: 'high' },
                  { name: 'Ana Costa', pending: 'Exame psicológico vencendo em 7 dias', urgency: 'medium' },
                  { name: 'Carlos Lima', pending: 'GRU pendente de pagamento', urgency: 'high' },
                  { name: 'Marina Silva', pending: 'CR vence em 30 dias', urgency: 'low' },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                    <div>
                      <div className="text-white text-xs font-medium">{item.name}</div>
                      <div className="text-white/50 text-xs">{item.pending}</div>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        item.urgency === 'high'
                          ? 'bg-red-400'
                          : item.urgency === 'medium'
                          ? 'bg-yellow-400'
                          : 'bg-green-400'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -bottom-6 -left-6 bg-white rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-[#00C853]" />
              <div>
                <div className="text-xs font-bold text-[#0B2545]">CR Deferido!</div>
                <div className="text-xs text-gray-500">João Mendes — agora mesmo</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20 pt-12 border-t border-white/10"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-extrabold text-white mb-1">{stat.value}</div>
              <div className="text-white/50 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
