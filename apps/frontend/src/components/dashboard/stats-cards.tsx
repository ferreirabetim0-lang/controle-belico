'use client'

import { Users, FolderOpen, CheckCircle2, DollarSign, TrendingDown, TrendingUp, Bell } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useApi } from '@/hooks/use-api'
import { dashboard } from '@/lib/api'
import type { DateRange } from '@/components/ui/date-filter'

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

type Props = { dateRange?: DateRange | null }

export function StatsCards({ dateRange }: Props) {
  const { data: stats, loading: loadingStats } = useApi(() => dashboard.stats(), [])
  const { data: financial, loading: loadingFin } = useApi(
    () => dashboard.financialSummary(
      dateRange ? toISO(dateRange.from) : undefined,
      dateRange ? toISO(dateRange.to)   : undefined,
    ),
    [dateRange?.from?.toISOString(), dateRange?.to?.toISOString()]
  )

  const loading = loadingStats || loadingFin

  const cards = [
    { label: 'Clientes Ativos',        value: loading ? '...' : String(stats?.totalClients ?? 0),             icon: Users,       color: 'text-[#3E92CC]', bg: 'bg-[#3E92CC]/10' },
    { label: 'Processos em Andamento', value: loading ? '...' : String(stats?.activeProcesses ?? 0),          icon: FolderOpen,  color: 'text-[#FFAB00]', bg: 'bg-[#FFAB00]/10' },
    { label: 'Processos Finalizados',  value: loading ? '...' : String(stats?.completedProcesses ?? 0),       icon: CheckCircle2,color: 'text-[#00C853]', bg: 'bg-[#00C853]/10' },
    { label: 'Notificações Abertas',   value: loading ? '...' : String(stats?.openNotifications ?? 0),        icon: Bell,        color: 'text-[#D50000]', bg: 'bg-[#D50000]/10' },
    { label: 'Receita',                value: loading ? '...' : formatCurrency(financial?.totalIncome ?? 0),   icon: DollarSign,  color: 'text-[#00C853]', bg: 'bg-[#00C853]/10' },
    { label: 'Despesas',               value: loading ? '...' : formatCurrency(financial?.totalExpenses ?? 0), icon: TrendingDown,color: 'text-[#D50000]', bg: 'bg-[#D50000]/10' },
    { label: 'Lucro',                  value: loading ? '...' : formatCurrency(financial?.profit ?? 0),        icon: TrendingUp,  color: 'text-[#00C853]', bg: 'bg-[#00C853]/10' },
    { label: 'Margem',                 value: loading ? '...' : `${(financial?.margin ?? 0).toFixed(1)}%`,     icon: TrendingUp,  color: 'text-[#3E92CC]', bg: 'bg-[#3E92CC]/10' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
          <div className={`text-2xl font-bold text-foreground mb-1 ${loading ? 'animate-pulse' : ''}`}>
            {card.value}
          </div>
          <div className="text-xs text-muted-foreground">{card.label}</div>
        </div>
      ))}
    </div>
  )
}
