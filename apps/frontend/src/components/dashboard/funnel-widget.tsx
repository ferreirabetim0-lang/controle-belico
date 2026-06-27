'use client'

import Link from 'next/link'
import { ArrowRight, TrendingUp, Loader2 } from 'lucide-react'
import { useApi } from '@/hooks/use-api'
import { leads } from '@/lib/api'

const STAGES = [
  { key: 'NOVO',       label: 'Novos',     color: '#3E92CC' },
  { key: 'CONTATO',    label: 'Contato',   color: '#FFAB00' },
  { key: 'PROPOSTA',   label: 'Proposta',  color: '#7B2FBE' },
  { key: 'NEGOCIACAO', label: 'Negoc.',    color: '#FF6B2B' },
  { key: 'FECHADO',    label: 'Fechado',   color: '#00C853' },
  { key: 'PERDIDO',    label: 'Perdido',   color: '#D50000' },
]

function fmtCurrency(v: number) {
  if (!v) return null
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export function FunnelWidget() {
  const { data, loading } = useApi(() => leads.list(), [])
  const allLeads = data ?? []
  const total = allLeads.length
  const totalClosed = allLeads.filter((l) => l.stage === 'FECHADO').reduce((s, l) => s + (l.value ?? 0), 0)

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#3E92CC]/10 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#3E92CC]" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">Funil de Vendas</h3>
            <p className="text-xs text-muted-foreground">
              {loading ? '...' : `${total} leads · ${fmtCurrency(totalClosed) ?? 'R$ 0'} fechados`}
            </p>
          </div>
        </div>
        <Link href="/funnel" className="text-xs text-[#3E92CC] hover:underline flex items-center gap-1">
          Abrir funil <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {loading && (
        <div className="h-20 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-3 gap-2">
          {STAGES.map((s) => {
            const count = allLeads.filter((l) => l.stage === s.key).length
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <div key={s.key} className="rounded-xl p-3 text-center"
                style={{ backgroundColor: `${s.color}12` }}>
                <div className="text-xl font-extrabold mb-0.5" style={{ color: s.color }}>{count}</div>
                <div className="text-[10px] font-medium text-muted-foreground">{s.label}</div>
                {count > 0 && (
                  <div className="text-[10px] font-semibold mt-0.5" style={{ color: s.color }}>{pct}%</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
