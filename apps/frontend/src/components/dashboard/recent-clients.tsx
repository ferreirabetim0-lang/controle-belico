'use client'

import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'
import { useApi } from '@/hooks/use-api'
import { clients } from '@/lib/api'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

const statusVariant: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'secondary'> = {
  ATIVO: 'info',
  EM_PROCESSO: 'warning',
  CONCLUIDO: 'success',
  ARQUIVADO: 'secondary',
}

export function RecentClients() {
  const { data, loading } = useApi(() => clients.list({ limit: 6, page: 1 }), [])
  const list = data?.data ?? []

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-foreground">Clientes Recentes</h3>
          <p className="text-sm text-muted-foreground">Últimos cadastrados</p>
        </div>
        <Link href="/clients" className="text-xs text-[#3E92CC] hover:underline flex items-center gap-1">
          Ver todos <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {loading && (
        <div className="h-32 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && list.length === 0 && (
        <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
          Nenhum cliente cadastrado ainda
        </div>
      )}

      {!loading && list.length > 0 && (
        <div className="space-y-3">
          {list.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`}
              className="flex items-center gap-3 py-2 border-b border-border last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors">
              <div className="w-9 h-9 bg-gradient-to-br from-[#0B2545] to-[#3E92CC] rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {getInitials(client.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{client.name}</div>
                <div className="text-xs text-muted-foreground">
                  {client.city ? `${client.city} · ` : ''}{fmtDate(client.createdAt)}
                </div>
              </div>
              <Badge variant={statusVariant[client.status] ?? 'secondary'} className="flex-shrink-0">
                {client.status}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
