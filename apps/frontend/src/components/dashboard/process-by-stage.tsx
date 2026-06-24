'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { stage: 'Documentação', count: 14 },
  { stage: 'CR', count: 18 },
  { stage: 'CRAF', count: 9 },
  { stage: 'GT', count: 3 },
  { stage: 'Análise', count: 7 },
  { stage: 'Deferido', count: 5 },
]

export function ProcessByStage() {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
      <div className="mb-6">
        <h3 className="font-bold text-foreground">Processos por Etapa</h3>
        <p className="text-sm text-muted-foreground">Distribuição atual</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="stage" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="count" name="Processos" fill="#3E92CC" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
