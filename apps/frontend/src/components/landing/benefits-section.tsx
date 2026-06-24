'use client'

import { motion } from 'framer-motion'
import { Clock, FileCheck, AlertTriangle, TrendingUp, Users, Lock } from 'lucide-react'

const benefits = [
  {
    icon: Clock,
    title: 'Economize até 4 horas por dia',
    description:
      'Checklists automáticos, alertas inteligentes e automações eliminam o trabalho manual repetitivo.',
    color: 'text-[#3E92CC]',
    bg: 'bg-[#3E92CC]/10',
  },
  {
    icon: FileCheck,
    title: 'Zero documentos perdidos',
    description:
      'Todos os documentos organizados, categorizados e com controle de validade em um único lugar.',
    color: 'text-[#00C853]',
    bg: 'bg-[#00C853]/10',
  },
  {
    icon: AlertTriangle,
    title: 'Nunca perca um prazo',
    description:
      'O sistema monitora CRs, CRAFs, exames e certidões e avisa você antes de vencer.',
    color: 'text-[#FFAB00]',
    bg: 'bg-[#FFAB00]/10',
  },
  {
    icon: TrendingUp,
    title: 'Aumente seu faturamento',
    description:
      'Com o Radar de Renovação, identifique oportunidades de recompra e amplie sua receita sem novos clientes.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Users,
    title: 'Gerencie centenas de clientes',
    description:
      'Escale sua operação sem contratar mais pessoas. O sistema faz o trabalho pesado por você.',
    color: 'text-[#0B2545]',
    bg: 'bg-[#0B2545]/10',
  },
  {
    icon: Lock,
    title: 'Segurança e conformidade LGPD',
    description:
      'Dados criptografados, auditoria completa e backups automáticos. Sua operação sempre protegida.',
    color: 'text-[#D50000]',
    bg: 'bg-[#D50000]/10',
  },
]

export function BenefitsSection() {
  return (
    <section className="py-24 bg-[#EEF4ED]/50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-[#3E92CC] text-sm font-semibold uppercase tracking-widest mb-3">
            Por que o Controle Bélico?
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B2545] dark:text-white mb-4">
            Feito especificamente para{' '}
            <span className="text-[#3E92CC]">quem vive o dia a dia bélico</span>
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Não é um CRM genérico adaptado. É um sistema construído do zero para as necessidades
            reais de despachantes, assessorias CAC e clubes de tiro.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-card border border-gray-100 dark:border-gray-700 hover:shadow-soft transition-all duration-300 group"
            >
              <div className={`w-12 h-12 ${benefit.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
              </div>
              <h3 className="text-lg font-bold text-[#0B2545] dark:text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
