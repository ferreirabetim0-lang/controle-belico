'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Clock, FileWarning, UserX, CreditCard, Camera } from 'lucide-react'

const pendencies = [
  { icon: Camera, label: 'Sem foto 3x4', count: 3, urgency: 'high' },
  { icon: FileWarning, label: 'Senha GOV pendente', count: 5, urgency: 'high' },
  { icon: UserX, label: 'Sem comprovante de renda', count: 8, urgency: 'medium' },
  { icon: Clock, label: 'Exame psicológico vencendo', count: 4, urgency: 'high' },
  { icon: FileWarning, label: 'Certidões pendentes', count: 6, urgency: 'medium' },
  { icon: CreditCard, label: 'GRU não paga', count: 2, urgency: 'high' },
  { icon: AlertCircle, label: 'Aguardando deferimento', count: 11, urgency: 'low' },
  { icon: Clock, label: 'CR vence em 30 dias', count: 7, urgency: 'medium' },
]

const urgencyConfig = {
  high: { color: 'text-[#D50000]', bg: 'bg-[#D50000]/10', badge: 'bg-[#D50000] text-white', label: 'Urgente' },
  medium: { color: 'text-[#FFAB00]', bg: 'bg-[#FFAB00]/10', badge: 'bg-[#FFAB00] text-white', label: 'Atenção' },
  low: { color: 'text-[#3E92CC]', bg: 'bg-[#3E92CC]/10', badge: 'bg-[#3E92CC] text-white', label: 'Info' },
}

export function PendenciesSection() {
  return (
    <section id="pendencies" className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-[#3E92CC] text-sm font-semibold uppercase tracking-widest mb-3">
              Diferencial exclusivo
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B2545] dark:text-white mb-6">
              Central de Pendências{' '}
              <span className="text-[#3E92CC]">Inteligente</span>
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              O coração do Controle Bélico. Um painel exclusivo que identifica automaticamente todos
              os clientes com pendências, classifica por urgência e gera alertas, notificações e
              tarefas de forma automática.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                'Identificação automática de pendências documentais',
                'Alertas de exames e certidões vencendo',
                'Controle de habitualidades por cliente',
                'Notificações por painel, e-mail e WhatsApp',
                'Indicadores visuais de urgência (vermelho, amarelo, azul)',
                'Geração automática de tarefas e lembretes',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                  <span className="w-5 h-5 bg-[#00C853]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="w-2 h-2 bg-[#00C853] rounded-full" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#0B2545] to-[#134074] rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-bold text-lg">Central de Pendências</h3>
                <p className="text-white/60 text-sm">46 pendências identificadas hoje</p>
              </div>
              <div className="w-10 h-10 bg-[#D50000]/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-[#D50000]" />
              </div>
            </div>

            <div className="space-y-3">
              {pendencies.map((item, i) => {
                const config = urgencyConfig[item.urgency as keyof typeof urgencyConfig]
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3"
                  >
                    <div className={`w-8 h-8 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <item.icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-white text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-sm font-bold">{item.count}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
                        {config.label}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
              <span className="text-white/50">Atualizado há 2 minutos</span>
              <button className="text-[#3E92CC] font-medium hover:underline">
                Ver todos →
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
