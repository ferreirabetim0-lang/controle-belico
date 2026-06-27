'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useApi } from '@/hooks/use-api'
import { dashboard } from '@/lib/api'
import type { DateRange } from '@/components/ui/date-filter'

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

type Props = { dateRange?: DateRange | null }

export function RevenueChart({ dateRange }: Props) {
  const { data, loading } = useApi(
    () => dashboard.monthlyHistory(
      dateRange ? toISO(dateRange.from) : undefined,
      dateRange ? toISO(dateRange.to)   : undefined,
    ),
    [dateRange?.from?.toISOString(), dateRange?.to?.toISOString()]
  )
  const chartData = data ?? []

  const subtitle = dateRange
    ? `${dateRange.from.toLocaleDateString('pt-BR')} – ${dateRange.to.toLocaleDateString('pt-BR')}`
    : 'Últimos 6 meses'

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-foreground">Receita x Lucro</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#3E92CC]" />Receita</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#00C853]" />Lucro</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#D50000]" />Despesas</span>
        </div>
      </div>

      {loading && <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm animate-pulse">Carregando...</div>}

      {!loading && chartData.length === 0 && (
        <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
          Nenhum lançamento no período
        </div>
      )}

      {!loading && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3E92CC" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3E92CC" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C853" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00C853" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
              formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
            />
            <Area type="monotone" dataKey="receita"  stroke="#3E92CC" strokeWidth={2}   fill="url(#colorReceita)" />
            <Area type="monotone" dataKey="lucro"    stroke="#00C853" strokeWidth={2}   fill="url(#colorLucro)" />
            <Area type="monotone" dataKey="despesas" stroke="#D50000" strokeWidth={1.5} fill="none" strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
