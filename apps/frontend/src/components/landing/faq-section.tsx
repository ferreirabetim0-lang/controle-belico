'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'O sistema funciona para clube de tiro também?',
    a: 'Sim. O Controle Bélico foi desenvolvido tanto para despachantes/assessorias quanto para clubes de tiro. Você pode gerenciar sócios, habitualidades, renovações e toda a documentação dos associados.',
  },
  {
    q: 'Quanto tempo leva para configurar e começar a usar?',
    a: 'O setup básico leva menos de 15 minutos. Você cadastra sua empresa, convida os usuários e já pode começar a cadastrar clientes. No plano Premium, oferecemos treinamento personalizado para sua equipe.',
  },
  {
    q: 'Os meus dados ficam seguros?',
    a: 'Sim. Utilizamos criptografia em todas as camadas, backups diários automáticos e conformidade com a LGPD. Cada empresa tem seus dados completamente isolados. Registramos toda ação com auditoria completa.',
  },
  {
    q: 'Posso migrar meus dados da planilha?',
    a: 'Sim. Nossa equipe te ajuda a importar os dados existentes. Suportamos importação via CSV e Excel para clientes e documentos.',
  },
  {
    q: 'O WhatsApp é o WhatsApp Web ou uma API?',
    a: 'Integração via API oficial do WhatsApp Business. Disponível no plano Premium. Você envia cobranças, pendências e atualizações de processo diretamente pelo sistema.',
  },
  {
    q: 'Funciona em celular?',
    a: 'O sistema é otimizado para desktop, pois é onde os despachantes trabalham. Existe uma versão responsiva para tablet. Um aplicativo mobile está no roadmap de funcionalidades futuras.',
  },
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim. Não há fidelidade. Você pode cancelar quando quiser e seus dados ficam disponíveis para exportação por 30 dias após o cancelamento.',
  },
  {
    q: 'Como funciona o período gratuito?',
    a: '7 dias de acesso completo ao plano Premium, sem precisar informar cartão de crédito. Ao final, você escolhe o plano desejado ou cancela — sem cobranças automáticas.',
  },
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-[#3E92CC] text-sm font-semibold uppercase tracking-widest mb-3">
            Dúvidas Frequentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B2545] dark:text-white">
            Perguntas e Respostas
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-[#0B2545] dark:text-white text-sm pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                    open === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3">
                  {faq.a}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
