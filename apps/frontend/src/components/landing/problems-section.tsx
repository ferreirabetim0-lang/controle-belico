'use client'

import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'

const problems = [
  'Documentos espalhados em pastas, e-mail e WhatsApp',
  'Clientes cobrando prazo e você sem resposta',
  'CR ou CRAF vencido por falta de aviso',
  'Exame psicológico do cliente venceu sem você saber',
  'Perdendo dinheiro por não saber quem está pronto para CRAF',
  'Planilha com 20 abas impossível de manter atualizada',
  'Time não sabe o status de cada cliente',
  'Sem controle de financeiro por processo',
]

const solutions = [
  'Todos os documentos categorizados com data de validade',
  'Status em tempo real para qualquer cliente',
  'Alertas automáticos 30, 15 e 7 dias antes do vencimento',
  'Monitoramento diário de todos os exames',
  'Radar de Renovação identifica oportunidades automaticamente',
  'Dashboard executivo atualizado em tempo real',
  'Controle de acesso por perfil de usuário',
  'Financeiro integrado a cada cliente e processo',
]

export function ProblemsSection() {
  return (
    <section className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-[#D50000] text-sm font-semibold uppercase tracking-widest mb-3">
            Os problemas que você enfrenta todo dia
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B2545] dark:text-white mb-4">
            Chega de{' '}
            <span className="text-[#D50000]">caos operacional</span>
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Se você ainda gerencia clientes por planilha ou WhatsApp, está deixando dinheiro na mesa
            e correndo riscos que podem comprometer seu negócio.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Problems */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-8 border border-red-100 dark:border-red-900"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#D50000]/10 rounded-xl flex items-center justify-center">
                <X className="w-5 h-5 text-[#D50000]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0B2545] dark:text-white">Sem o Controle Bélico</h3>
                <p className="text-sm text-gray-500">A realidade de quem usa planilhas</p>
              </div>
            </div>
            <ul className="space-y-3">
              {problems.map((problem) => (
                <li key={problem} className="flex items-start gap-3">
                  <X className="w-4 h-4 text-[#D50000] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{problem}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Solutions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-green-50 dark:bg-green-950/30 rounded-2xl p-8 border border-green-100 dark:border-green-900"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#00C853]/10 rounded-xl flex items-center justify-center">
                <Check className="w-5 h-5 text-[#00C853]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0B2545] dark:text-white">Com o Controle Bélico</h3>
                <p className="text-sm text-gray-500">Operação profissional e escalável</p>
              </div>
            </div>
            <ul className="space-y-3">
              {solutions.map((solution) => (
                <li key={solution} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#00C853] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{solution}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
