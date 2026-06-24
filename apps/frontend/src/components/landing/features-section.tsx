'use client'

import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, FolderOpen, TrendingUp,
  MessageSquare, FileSignature, BarChart3, Bell,
} from 'lucide-react'

const features = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard Executivo',
    description:
      'Visão completa do negócio: clientes, processos, receita, lucro e pendências em tempo real. Gráficos de receita mensal, clientes por cidade e conversão comercial.',
    color: 'from-[#0B2545] to-[#13315C]',
  },
  {
    icon: Users,
    title: 'CRM de Clientes',
    description:
      'Cadastro completo com CPF, RG, endereço, profissão, tags e origem do lead. Timeline de cada cliente com todo o histórico de interações e documentos.',
    color: 'from-[#13315C] to-[#134074]',
  },
  {
    icon: FolderOpen,
    title: 'Gestão Documental',
    description:
      'Upload ilimitado com categorias específicas: Foto 3x4, RG, CNH, exames, certidões, CR, CRAF e GT. Controle de data de validade e versões de documentos.',
    color: 'from-[#134074] to-[#3E92CC]',
  },
  {
    icon: TrendingUp,
    title: 'Funil de Vendas Kanban',
    description:
      'Arraste e solte clientes entre etapas: Lead, Contato, Negociação, Pagamento, Documentação, CR, CRAF, GT, Finalizado ou Perdido.',
    color: 'from-[#3E92CC] to-[#5aa8d4]',
  },
  {
    icon: Bell,
    title: 'Automações Inteligentes',
    description:
      'Motor de regras que monitora diariamente: exames vencendo, certidões, CRs, habitualidades e pagamentos. Dispara alertas, e-mails e WhatsApp automaticamente.',
    color: 'from-[#FFAB00] to-[#f59e0b]',
  },
  {
    icon: MessageSquare,
    title: 'Integração WhatsApp',
    description:
      'Envie cobranças, status de processos e lembretes de pendências diretamente pelo WhatsApp. Histórico completo de conversas por cliente.',
    color: 'from-[#00C853] to-[#16a34a]',
  },
  {
    icon: FileSignature,
    title: 'Assinatura Digital',
    description:
      'Envie documentos para assinatura eletrônica com registro de IP, data, hora e hash do documento. Conformidade jurídica garantida.',
    color: 'from-purple-600 to-purple-800',
  },
  {
    icon: BarChart3,
    title: 'Relatórios Avançados',
    description:
      'Relatórios de clientes por cidade/estado, processos concluídos, faturamento, lucro líquido, tempo médio de aprovação. Exporte em PDF, Excel ou CSV.',
    color: 'from-[#0B2545] to-[#3E92CC]',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-[#EEF4ED]/50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-[#3E92CC] text-sm font-semibold uppercase tracking-widest mb-3">
            Módulos completos
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B2545] dark:text-white mb-4">
            Tudo que você precisa,{' '}
            <span className="text-[#3E92CC]">em um só sistema</span>
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Cada módulo foi desenhado pensando no fluxo real de trabalho de despachantes e assessorias bélicas.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-card border border-gray-100 dark:border-gray-700 hover:shadow-soft transition-all duration-300 group"
            >
              <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
              <div className="p-6">
                <div className={`w-11 h-11 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-[#0B2545] dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
