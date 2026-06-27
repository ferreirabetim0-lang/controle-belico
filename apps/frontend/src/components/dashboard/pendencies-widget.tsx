'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowRight, Loader2 } from 'lucide-react'
import { useApi } from '@/hooks/use-api'
import { clients } from '@/lib/api'

const LABELS: Record<string, string> = {
  NO_PHOTO: 'Foto 3x4 ausente',
  NO_PROOF_OF_INCOME: 'Sem comprovante de renda',
  NO_PROOF_OF_RESIDENCE: 'Sem comprovante de residência',
  NO_RG_CNH: 'Sem RG/CNH',
  NO_CERTIFICATIONS: 'Sem certidões',
  NO_CLUB_MEMBERSHIP: 'Sem associação ao clube',
  EXPIRING_PSYCH_EXAM: 'Psicológico vencendo',
  EXPIRING_SHOOTING_EXAM: 'Exame de tiro vencendo',
  EXPIRING_CR: 'CR vencendo',
  EXPIRING_CRAF: 'CRAF vencendo',
}

const URGENCY: Record<string, string> = {
  EXPIRING_PSYCH_EXAM: 'high',
  EXPIRING_SHOOTING_EXAM: 'high',
  EXPIRING_CR: 'high',
  EXPIRING_CRAF: 'high',
  NO_PHOTO: 'medium',
  NO_RG_CNH: 'medium',
  NO_CERTIFICATIONS: 'medium',
  NO_CLUB_MEMBERSHIP: 'low',
  NO_PROOF_OF_INCOME: 'low',
  NO_PROOF_OF_RESIDENCE: 'low',
}

const urgencyDot: Record<string, string> = {
  high: 'bg-[#D50000]',
  medium: 'bg-[#FFAB00]',
  low: 'bg-[#3E92CC]',
}

export function PendenciesWidget() {
  const { data, loading } = useApi(() => clients.pendencies(), [])

  // flatten: { name, issue, urgency }[]
  const items = data
    ? Object.entries(data)
        .flatMap(([key, names]) =>
          (names as string[]).map((name) => ({
            name,
            issue: LABELS[key] ?? key,
            urgency: URGENCY[key] ?? 'low',
          }))
        )
        .sort((a, b) => {
          const order = { high: 0, medium: 1, low: 2 }
          return (order[a.urgency as keyof typeof order] ?? 3) - (order[b.urgency as keyof typeof order] ?? 3)
        })
        .slice(0, 6)
    : []

  const total = data ? Object.values(data).reduce((s, v) => s + (v as string[]).length, 0) : 0

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#D50000]/10 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-[#D50000]" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">Pendências</h3>
            <p className="text-xs text-muted-foreground">
              {loading ? '...' : `${total} abertas`}
            </p>
          </div>
        </div>
        <Link href="/pendencies" className="text-xs text-[#3E92CC] hover:underline flex items-center gap-1">
          Ver todas <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          Nenhuma pendência encontrada 🎉
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-3 flex-1">
          {items.map((p, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${urgencyDot[p.urgency]}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground truncate">{p.issue}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
