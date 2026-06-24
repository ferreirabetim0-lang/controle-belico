'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'

const clients = [
  { id: '1', name: 'João Carlos Mendes', status: 'CR', city: 'São Paulo', date: '22/06/2026' },
  { id: '2', name: 'Ana Paula Costa', status: 'CRAF', city: 'Curitiba', date: '21/06/2026' },
  { id: '3', name: 'Carlos Roberto Lima', status: 'Documentação', city: 'BH', date: '21/06/2026' },
  { id: '4', name: 'Marina da Silva', status: 'GT', city: 'Rio de Janeiro', date: '20/06/2026' },
  { id: '5', name: 'Pedro Henrique Alves', status: 'Lead', city: 'Brasília', date: '20/06/2026' },
]

const statusVariant: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'secondary'> = {
  CR: 'info',
  CRAF: 'warning',
  GT: 'success',
  Documentação: 'secondary',
  Lead: 'secondary',
}

export function RecentClients() {
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

      <div className="space-y-3">
        {clients.map((client) => (
          <div key={client.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
            <div className="w-9 h-9 bg-gradient-to-br from-[#0B2545] to-[#3E92CC] rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(client.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{client.name}</div>
              <div className="text-xs text-muted-foreground">{client.city} · {client.date}</div>
            </div>
            <Badge variant={statusVariant[client.status] ?? 'secondary'} className="flex-shrink-0">
              {client.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
