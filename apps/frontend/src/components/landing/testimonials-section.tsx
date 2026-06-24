'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Ricardo Alves',
    role: 'Despachante Bélico — São Paulo, SP',
    avatar: 'RA',
    text: 'Antes eu usava planilha e perdia documentos todo mês. Hoje tenho 340 clientes ativos e não perco mais nada. A Central de Pendências me avisou de 3 CRs vencendo que eu nem sabia.',
    stars: 5,
  },
  {
    name: 'Fernanda Castro',
    role: 'Assessoria CAC — Curitiba, PR',
    avatar: 'FC',
    text: 'O Radar de Renovação sozinho já pagou o sistema 10 vezes. Identifiquei 18 clientes aptos para CRAF que estavam parados na minha base. Fiz R$12.000 em um mês só com isso.',
    stars: 5,
  },
  {
    name: 'Marcos Tributino',
    role: 'Clube de Tiro — Belo Horizonte, MG',
    avatar: 'MT',
    text: 'Gerencio 85 sócios com facilidade. Habitualidades, renovações, exames — tudo automático. Minha secretária economiza 3 horas por dia. Sistema essencial para qualquer clube.',
    stars: 5,
  },
  {
    name: 'Patrícia Moura',
    role: 'Consultoria Armamentista — Porto Alegre, RS',
    avatar: 'PM',
    text: 'Profissionalizou completamente minha operação. Hoje meus clientes recebem atualizações automáticas pelo WhatsApp e a assinatura digital eliminou o deslocamento para assinar documentos.',
    stars: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-[#EEF4ED]/50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-[#3E92CC] text-sm font-semibold uppercase tracking-widest mb-3">
            Depoimentos
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B2545] dark:text-white mb-4">
            Quem usa, não volta para planilha
          </h2>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-5 h-5 text-[#FFAB00] fill-[#FFAB00]" />
            ))}
          </div>
          <p className="text-gray-400 text-sm">4.9/5 de avaliação média — 500+ despachantes</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-card hover:shadow-soft transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-[#3E92CC]/30 mb-4" />
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                "{t.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-gradient-to-br from-[#0B2545] to-[#3E92CC] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{t.avatar}</span>
                </div>
                <div>
                  <div className="font-bold text-[#0B2545] dark:text-white text-sm">{t.name}</div>
                  <div className="text-gray-400 text-xs">{t.role}</div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 text-[#FFAB00] fill-[#FFAB00]" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
