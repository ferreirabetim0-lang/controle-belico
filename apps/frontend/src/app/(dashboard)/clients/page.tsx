'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, Plus, Filter, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'
import { DateFilter, DateRange } from '@/components/ui/date-filter'
import { useApi } from '@/hooks/use-api'
import { clients, type Client } from '@/lib/api'

const statusConfig: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'danger' | 'secondary' }> = {
  LEAD: { label: 'Lead', variant: 'secondary' },
  CONTACT: { label: 'Contato', variant: 'secondary' },
  NEGOTIATION: { label: 'Negociação', variant: 'secondary' },
  PAYMENT: { label: 'Pagamento', variant: 'warning' },
  DOCUMENTATION: { label: 'Documentação', variant: 'secondary' },
  CR: { label: 'CR', variant: 'info' },
  CRAF: { label: 'CRAF', variant: 'warning' },
  GT: { label: 'GT', variant: 'success' },
  COMPLETED: { label: 'Finalizado', variant: 'success' },
  ARCHIVED: { label: 'Arquivado', variant: 'secondary' },
  LOST: { label: 'Perdido', variant: 'danger' },
}

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [page, setPage] = useState(1)

  const { data, loading, error } = useApi(
    () => clients.list({ search: search || undefined, status: statusFilter || undefined, page, limit: 20 }),
    [search, statusFilter, page],
  )

  const clientList: Client[] = data?.data ?? []
  const meta = data?.meta ?? { total: 0, page: 1, limit: 20, totalPages: 1 }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? 'Carregando...' : `${meta.total} cliente${meta.total !== 1 ? 's' : ''} cadastrado${meta.total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateFilter value="month" onChange={setDateRange} />
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Exportar
          </Button>
          <Button size="sm" className="gap-2 bg-[#0B2545] hover:bg-[#13315C]">
            <Plus className="w-4 h-4" /> Novo Cliente
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por nome, CPF ou e-mail..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1.5 flex-wrap">
            {[['', 'Todos'], ['LEAD', 'Lead'], ['CR', 'CR'], ['CRAF', 'CRAF'], ['GT', 'GT'], ['COMPLETED', 'Finalizado']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => { setStatusFilter(val); setPage(1) }}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                  statusFilter === val
                    ? 'bg-[#0B2545] text-white'
                    : 'bg-card border border-border text-muted-foreground hover:border-[#0B2545]/40'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        {loading && (
          <div className="py-16 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Carregando clientes...</span>
          </div>
        )}

        {error && (
          <div className="py-16 text-center text-red-500 text-sm">{error}</div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Cliente', 'CPF', 'Telefone', 'Cidade', 'Status', 'Responsável', 'Cadastro', ''].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientList.map((client) => {
                  const config = statusConfig[client.status]
                  return (
                    <tr key={client.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#0B2545] to-[#3E92CC] rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(client.name)}
                          </div>
                          <span className="text-sm font-medium text-foreground">{client.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">{client.cpf}</td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">{client.phone ?? '—'}</td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">{client.city ?? '—'}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={config?.variant ?? 'secondary'}>{config?.label ?? client.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {(client as any).responsible?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-muted-foreground">
                        {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3.5">
                        <Link href={`/clients/${client.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs text-[#3E92CC] hover:text-[#3E92CC]">
                            Ver detalhes →
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && clientList.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Nenhum cliente encontrado</p>
            <p className="text-xs mt-1">Cadastre o primeiro cliente clicando em "Novo Cliente"</p>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Página {meta.page} de {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
