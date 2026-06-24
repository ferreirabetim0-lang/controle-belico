'use client'

import { motion } from 'framer-motion'
import { Radar, RefreshCw, Target, Repeat, TrendingUp, Award } from 'lucide-react'

const radarItems = [
  {
    icon: RefreshCw,
    title: 'CR próximo do vencimento',
    description: '7 clientes com CR vencendo nos próximos 60 dias',
    badge: '7 clientes',
    color: 'text-[#FFAB00]',
    bg: 'bg-[#FFAB00]/15',
  },
  {
    icon: Target,
    title: 'CRAF próximo do vencimento',
    description: '3 CRAFs vencendo — oportunidade de renovação',
    badge: '3 clientes',
    color: 'text-[#D50000]',
    bg: 'bg-[#D50000]/15',
  },
  {
    icon: Repeat,
    title: 'Habitualidades insuficientes',
    description: 'Clientes que precisam regularizar habitualidades no clube',
    badge: '12 clientes',
    color: 'text-[#3E92CC]',
    bg: 'bg-[#3E92CC]/15',
  },
  {
    icon: TrendingUp,
    title: 'Aptos para nova arma',
    description: 'Clientes com CR ativo e habitualidades em dia — prontos para CRAF',
    badge: '9 clientes',
    color: 'text-[#00C853]',
    bg: 'bg-[#00C853]/15',
  },
  {
    icon: Award,
    title: 'Potencial de recompra',
    description: 'Clientes com processo finalizado há mais de 1 ano',
    badge: '21 clientes',
    color: 'text-purple-500',
    bg: 'bg-purple-500/15',
  },
  {
    icon: RefreshCw,
    title: 'Exames próximos do vencimento',
    description: 'Exames psicológicos e de tiro vencendo em 45 dias',
    badge: '5 clientes',
    color: 'text-[#FFAB00]',
    bg: 'bg-[#FFAB00]/15',
  },
]

export function RadarSection() {
  return (
    <section className="py-24 bg-[#EEF4ED]/50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#0B2545] text-white rounded-full px-4 py-1.5 mb-6 text-sm font-medium">
            <Radar className="w-4 h-4 text-[#3E92CC]" />
            Funcionalidade exclusiva
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B2545] dark:text-white mb-4">
            Radar de Renovação
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            O único sistema do mercado que identifica automaticamente quem está pronto para renovar,
            quem pode comprar nova arma e quem pode se tornar cliente novamente. Mais receita sem
            esforço de prospecção.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {radarItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-card hover:shadow-soft transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 ${item.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.bg} ${item.color}`}>
                  {item.badge}
                </span>
              </div>
              <h3 className="font-bold text-[#0B2545] dark:text-white mb-1.5">{item.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-r from-[#0B2545] to-[#134074] rounded-2xl p-8 text-center text-white"
        >
          <h3 className="text-2xl font-bold mb-3">
            Nenhum concorrente tem isso.
          </h3>
          <p className="text-white/70 max-w-xl mx-auto">
            O Radar de Renovação é uma funcionalidade exclusiva do Controle Bélico, desenvolvida a
            partir da realidade dos maiores despachantes do país.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
