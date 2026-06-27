'use client'

import { StatsCards } from '@/components/dashboard/stats-cards'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { PendenciesWidget } from '@/components/dashboard/pendencies-widget'
import { ProcessByStage } from '@/components/dashboard/process-by-stage'
import { RecentClients } from '@/components/dashboard/recent-clients'
import { FunnelWidget } from '@/components/dashboard/funnel-widget'

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral da sua operação</p>
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
        <FunnelWidget />
      </div>

      <RecentClients />
    </div>
  )
}
