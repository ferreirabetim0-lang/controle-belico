'use client'

import { useState } from 'react'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { PendenciesWidget } from '@/components/dashboard/pendencies-widget'
import { ProcessByStage } from '@/components/dashboard/process-by-stage'
import { RecentClients } from '@/components/dashboard/recent-clients'
import { DateFilter, DateRange } from '@/components/ui/date-filter'

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | null>(null)

  const label = dateRange
    ? `${dateRange.from.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} – ${dateRange.to.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`
    : 'Este mês'

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Exibindo dados de: <span className="font-medium text-foreground">{label}</span>
          </p>
        </div>
        <DateFilter value="month" onChange={setDateRange} />
      </div>

      <StatsCards />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <PendenciesWidget />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ProcessByStage />
        <RecentClients />
      </div>
    </div>
  )
}
