'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useApi } from '@/hooks/use-api'
import { processes } from '@/lib/api'
import { Loader2 } from 'lucide-react'

const COLORS = ['#3E92CC', '#FFAB00', '#7B2FBE', '#00C853', '#FF6B2B', '#D50000']

const STATUS_LABELS: Record<string, string> = {
  EM_FILA: 'Em Fila',
  EM_ANALISE: 'Em Análise',
  DEFERIDO: 'Deferido',
  INDEFERIDO: 'Indeferido',
  CONCLUIDO: 'Concluído',
}

export function ProcessByStage() {
  const { data, loading } = useApi(() => processes.list(), [])

  const byType = data
    ? [
        { label: 'CR',   count: data.filter((p) => p.type === 'CR').length },
        { label: 'CRAF', count: data.filter((p) => p.type === 'CRAF').length },
        { label: 'GT',   count: data.filter((p) => p.type === 'GT').length },
      ].filter((d) => d.count > 0)
    : []

  const byStatus = data
    ? Object.entries(
        data.reduce<Record<string, number>>((acc, p) => {
          const key = STATUS_LABELS[p.status] ?? p.status
          acc[key] = (acc[key] ?? 0) + 1
          return acc
        }, {})
      ).map(([label, count]) => ({ label, count }))
    : []

  const chartData = byType.length > 0 ? byType : []

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-foreground">Processos por Tipo</h3>
          <p className="text-sm text-muted-foreground">
            {loading ? 'Carregando...' : `${data?.length ?? 0} processos no total`}
          </p>
        </div>
        {/* status pills */}
        {!loading && byStatus.length > 0 && (
          <div className="flex gap-2 flex-wrap justify-end">
            {byStatus.map((s, i) => (
              <span key={s.label} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{ backgroundColor: `${COLORS[i % COLORS.length]}20`, color: COLORS[i % COLORS.length] }}>
                {s.label}: {s.count}
              </span>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="h-[220px] flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && chartData.length === 0 && (
        <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
          Nenhum processo cadastrado ainda
        </div>
      )}

      {!loading && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
              formatter={(v: number) => [v, 'Processos']}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
