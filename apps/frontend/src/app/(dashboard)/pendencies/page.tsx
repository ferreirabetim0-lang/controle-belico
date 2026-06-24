'use client'

import { useState } from 'react'
import { AlertTriangle, Camera, FileWarning, CreditCard, Clock, UserX, FileX, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Urgency = 'high' | 'medium' | 'low'

const categories = [
  {
    id: 'photo',
    icon: Camera,
    label: 'Foto 3x4 ausente',
    count: 3,
    urgency: 'high' as Urgency,
    clients: ['João Mendes', 'Ana Costa', 'Carlos Lima'],
  },
  {
    id: 'gov_password',
    icon: FileWarning,
    label: 'Senha GOV pendente',
    count: 5,
    urgency: 'high' as Urgency,
    clients: ['Pedro Alves', 'Marina Silva', 'Roberto Gomes', 'Camila Dias', 'Lucia Santos'],
  },
  {
    id: 'income',
    icon: UserX,
    label: 'Sem comprovante de renda',
    count: 8,
    urgency: 'medium' as Urgency,
    clients: ['Maria Oliveira', 'Fernando Costa', 'Juliana Lima'],
  },
  {
    id: 'psych_exam',
    icon: Clock,
    label: 'Exame psicológico vencendo',
    count: 4,
    urgency: 'high' as Urgency,
    clients: ['André Souza', 'Beatriz Santos'],
  },
  {
    id: 'certifications',
    icon: FileX,
    label: 'Certidões pendentes',
    count: 6,
    urgency: 'medium' as Urgency,
    clients: ['Rodrigo Ferreira'],
  },
  {
    id: 'gru',
    icon: CreditCard,
    label: 'GRU não paga',
    count: 2,
    urgency: 'high' as Urgency,
    clients: ['Tatiana Moura', 'Marcos Pinto'],
  },
  {
    id: 'waiting',
    icon: Clock,
    label: 'Aguardando deferimento',
    count: 11,
    urgency: 'low' as Urgency,
    clients: [],
  },
  {
    id: 'cr_expiring',
    icon: AlertTriangle,
    label: 'CR vence em 30 dias',
    count: 7,
    urgency: 'medium' as Urgency,
    clients: ['Paulo Nunes'],
  },
  {
    id: 'habituality',
    icon: FileWarning,
    label: 'Sem habitualidades',
    count: 9,
    urgency: 'medium' as Urgency,
    clients: [],
  },
  {
    id: 'shooting_exam',
    icon: Clock,
    label: 'Exame de tiro vencendo',
    count: 3,
    urgency: 'high' as Urgency,
    clients: [],
  },
  {
    id: 'club',
    icon: UserX,
    label: 'Sem filiação ao clube',
    count: 5,
    urgency: 'medium' as Urgency,
    clients: [],
  },
  {
    id: 'gov_signature',
    icon: FileWarning,
    label: 'Sem assinatura GOV',
    count: 4,
    urgency: 'high' as Urgency,
    clients: [],
  },
]

const urgencyConfig = {
  high: {
    badge: 'danger' as const,
    label: 'Urgente',
    border: 'border-l-[#D50000]',
    iconBg: 'bg-[#D50000]/10',
    iconColor: 'text-[#D50000]',
  },
  medium: {
    badge: 'warning' as const,
    label: 'Atenção',
    border: 'border-l-[#FFAB00]',
    iconBg: 'bg-[#FFAB00]/10',
    iconColor: 'text-[#FFAB00]',
  },
  low: {
    badge: 'info' as const,
    label: 'Monitorar',
    border: 'border-l-[#3E92CC]',
    iconBg: 'bg-[#3E92CC]/10',
    iconColor: 'text-[#3E92CC]',
  },
}

export default function PendenciesPage() {
  const [filter, setFilter] = useState<'all' | Urgency>('all')

  const total = categories.reduce((acc, c) => acc + c.count, 0)
  const high = categories.filter((c) => c.urgency === 'high').reduce((acc, c) => acc + c.count, 0)
  const medium = categories.filter((c) => c.urgency === 'medium').reduce((acc, c) => acc + c.count, 0)

  const filtered = filter === 'all' ? categories : categories.filter((c) => c.urgency === filter)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Central de Pendências</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Identificação automática de pendências de todos os clientes
          </p>
        </div>
        <Button size="sm" className="gap-2 bg-[#0B2545] hover:bg-[#13315C]">
          Atualizar Agora
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card border-l-4 border-l-[#D50000]">
          <div className="text-3xl font-extrabold text-[#D50000] mb-1">{high}</div>
          <div className="text-sm font-medium text-foreground">Urgentes</div>
          <div className="text-xs text-muted-foreground">Ação imediata necessária</div>
        </div>
        <div className="stat-card border-l-4 border-l-[#FFAB00]">
          <div className="text-3xl font-extrabold text-[#FFAB00] mb-1">{medium}</div>
          <div className="text-sm font-medium text-foreground">Atenção</div>
          <div className="text-xs text-muted-foreground">Resolver em breve</div>
        </div>
        <div className="stat-card border-l-4 border-l-[#3E92CC]">
          <div className="text-3xl font-extrabold text-[#3E92CC] mb-1">{total}</div>
          <div className="text-sm font-medium text-foreground">Total</div>
          <div className="text-xs text-muted-foreground">Todas as pendências</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {([['all', 'Todos'], ['high', 'Urgentes'], ['medium', 'Atenção'], ['low', 'Monitorar']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-2 text-sm rounded-xl font-medium transition-all ${
              filter === val
                ? 'bg-[#0B2545] text-white'
                : 'bg-card border border-border text-muted-foreground hover:border-[#0B2545]/40'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Pendency cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((category) => {
          const config = urgencyConfig[category.urgency]
          return (
            <div
              key={category.id}
              className={`bg-card rounded-2xl p-5 border border-border border-l-4 ${config.border} shadow-card hover:shadow-soft transition-all duration-200 cursor-pointer group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${config.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <category.icon className={`w-5 h-5 ${config.iconColor}`} />
                </div>
                <Badge variant={config.badge}>{config.label}</Badge>
              </div>

              <div className="text-2xl font-extrabold text-foreground mb-1">{category.count}</div>
              <div className="text-sm font-medium text-foreground mb-3">{category.label}</div>

              {category.clients.length > 0 && (
                <div className="space-y-1">
                  {category.clients.slice(0, 3).map((client) => (
                    <div key={client} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={`w-1.5 h-1.5 rounded-full ${config.iconColor} flex-shrink-0`} style={{ background: 'currentColor' }} />
                      {client}
                    </div>
                  ))}
                  {category.clients.length > 3 && (
                    <div className="text-xs text-muted-foreground pl-3">
                      +{category.clients.length - 3} outros
                    </div>
                  )}
                </div>
              )}

              <Button variant="ghost" size="sm" className="w-full mt-4 text-xs">
                Ver todos os clientes
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
