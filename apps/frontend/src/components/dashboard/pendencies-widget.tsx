'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'

const pendencies = [
  { name: 'João Mendes', issue: 'Foto 3x4 ausente', urgency: 'high' },
  { name: 'Ana Costa', issue: 'Exame psico. vence em 7d', urgency: 'high' },
  { name: 'Carlos Lima', issue: 'GRU não paga', urgency: 'high' },
  { name: 'Marina Silva', issue: 'CR vence em 30d', urgency: 'medium' },
  { name: 'Pedro Alves', issue: 'Sem habitualidades', urgency: 'medium' },
  { name: 'Lucia Ferreira', issue: 'Aguardando certidões', urgency: 'low' },
]

const urgencyDot: Record<string, string> = {
  high: 'bg-[#D50000]',
  medium: 'bg-[#FFAB00]',
  low: 'bg-[#3E92CC]',
}

export function PendenciesWidget() {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#D50000]/10 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-[#D50000]" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">Pendências</h3>
            <p className="text-xs text-muted-foreground">12 abertas</p>
          </div>
        </div>
        <Link href="/pendencies" className="text-xs text-[#3E92CC] hover:underline flex items-center gap-1">
          Ver todas <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-3 flex-1">
        {pendencies.map((p) => (
          <div key={p.name} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${urgencyDot[p.urgency]}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
              <div className="text-xs text-muted-foreground truncate">{p.issue}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
