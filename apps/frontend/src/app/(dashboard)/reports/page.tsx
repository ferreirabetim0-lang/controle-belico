'use client'

'use client'

import { useState } from 'react'
import { Download, BarChart2, Users, Shield, DollarSign, FileText, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { DateFilter, DateRange } from '@/components/ui/date-filter'

const processTypes = [
  { name: 'CR', total: 45, completed: 38, color: '#3E92CC' },
  { name: 'CRAF', total: 18, completed: 14, color: '#FFAB00' },
  { name: 'GT', total: 12, completed: 11, color: '#134074' },
]

const clientsByStatus = [
  { name: 'Lead', value: 12, color: '#94a3b8' },
  { name: 'Documentação', value: 8, color: '#3E92CC' },
  { name: 'CR', value: 15, color: '#134074' },
  { name: 'CRAF', value: 7, color: '#FFAB00' },
  { name: 'GT', value: 5, color: '#0B2545' },
  { name: 'Finalizado', value: 38, color: '#00C853' },
]

const monthlyNew = [
  { month: 'Jan', novos: 8, finalizados: 5 },
  { month: 'Fev', novos: 10, finalizados: 7 },
  { month: 'Mar', novos: 7, finalizados: 9 },
  { month: 'Abr', novos: 12, finalizados: 8 },
  { month: 'Mai', novos: 14, finalizados: 10 },
  { month: 'Jun', novos: 11, finalizados: 12 },
]

const reports = [
  { icon: Users, label: 'Relatório de Clientes', description: 'Lista completa com status e processos', color: 'bg-[#3E92CC]/10 text-[#3E92CC]' },
  { icon: Shield, label: 'Relatório de Processos', description: 'Andamento de CR, CRAF e GT', color: 'bg-[#134074]/10 text-[#134074]' },
  { icon: DollarSign, label: 'Relatório Financeiro', description: 'Receitas, despesas e lucro por período', color: 'bg-[#00C853]/10 text-[#00C853]' },
  { icon: FileText, label: 'Relatório de Documentos', description: 'Status e vencimentos de documentos', color: 'bg-[#FFAB00]/10 text-[#FFAB00]' },
  { icon: TrendingUp, label: 'Relatório do Funil', description: 'Conversão por estágio do funil', color: 'bg-[#0B2545]/10 text-[#0B2545]' },
  { icon: BarChart2, label: 'Dashboard Executivo', description: 'Visão consolidada para gestão', color: 'bg-[#D50000]/10 text-[#D50000]' },
]

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | null>(null)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground text-sm mt-1">Análises e exportações do seu escritório</p>
        </div>
        <div className="flex items-center gap-3">
          <DateFilter value="month" onChange={setDateRange} />
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Exportar todos
          </Button>
        </div>
      </div>

      {/* Quick reports */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => (
          <button key={r.label} className="bg-card rounded-2xl p-5 border border-border shadow-card hover:shadow-soft transition-all text-left group hover:border-[#3E92CC]/30">
            <div className={`w-10 h-10 ${r.color} rounded-xl flex items-center justify-center mb-4`}>
              <r.icon className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold text-foreground mb-1">{r.label}</div>
            <div className="text-xs text-muted-foreground">{r.description}</div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-[#3E92CC] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <Download className="w-3 h-3" /> Exportar PDF
            </div>
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Clients by month */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
          <div className="mb-5">
            <h3 className="font-bold text-foreground">Novos Clientes vs Finalizados</h3>
            <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyNew} barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="novos" name="Novos Clientes" fill="#3E92CC" radius={[4, 4, 0, 0]} />
              <Bar dataKey="finalizados" name="Finalizados" fill="#00C853" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Clients by status */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
          <div className="mb-5">
            <h3 className="font-bold text-foreground">Clientes por Status</h3>
            <p className="text-sm text-muted-foreground">Distribuição atual — 85 clientes</p>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={clientsByStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                  {clientsByStatus.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {clientsByStatus.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Process stats */}
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-bold text-foreground">Processos por Tipo</h3>
        </div>
        <div className="divide-y divide-border">
          {processTypes.map((pt) => (
            <div key={pt.name} className="flex items-center gap-6 px-5 py-5">
              <div className="w-12 text-center">
                <div className="text-xl font-extrabold text-foreground">{pt.name}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
                  <span>{pt.completed} de {pt.total} finalizados</span>
                  <span className="font-semibold text-foreground">{Math.round((pt.completed / pt.total) * 100)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(pt.completed / pt.total) * 100}%`, background: pt.color }}
                  />
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-foreground">{pt.total} total</div>
                <div className="text-xs text-muted-foreground">{pt.total - pt.completed} em andamento</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
