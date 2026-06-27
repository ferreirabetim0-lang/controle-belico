'use client'

import { useState } from 'react'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { PendenciesWidget } from '@/components/dashboard/pendencies-widget'
import { ProcessByStage } from '@/components/dashboard/process-by-stage'
import { RecentClients } from '@/components/dashboard/recent-clients'
import { FunnelWidget } from '@/components/dashboard/funnel-widget'
import { DateFilter, DateRange } from '@/components/ui/date-filter'

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | null>(null)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {dateRange ? `Período: ${dateRange.label}` : 'Visão geral da sua operação'}
          </p>
        </div>
        <DateFilter
          value="month"
          onChange={(r) => setDateRange(r)}
        />
      </div>

      <StatsCards dateRange={dateRange} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart dateRange={dateRange} />
        </div>
        <div>
          <PendenciesWidget />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ProcessByStage />
        <FunnelWidget />
      </div>

      <RecentClients />
    </div>
  )
}
