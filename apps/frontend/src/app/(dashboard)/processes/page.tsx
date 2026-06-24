'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Plus, Shield, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'
import { DateFilter, DateRange } from '@/components/ui/date-filter'
import { useApi } from '@/hooks/use-api'
import { processes as processesApi, clients, type Process } from '@/lib/api'

const typeColors: Record<string, string> = { CR: 'info', CRAF: 'warning', GT: 'secondary' }

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'danger' | 'secondary' }> = {
  PENDING: { label: 'Aguardando', variant: 'secondary' },
  IN_PROGRESS: { label: 'Em Andamento', variant: 'info' },
  WAITING_ANALYSIS: { label: 'Aguard. Análise', variant: 'warning' },
  IN_QUEUE: { label: 'Em Fila', variant: 'warning' },
  IN_ANALYSIS: { label: 'Em Análise', variant: 'warning' },
  APPROVED: { label: 'Aprovado', variant: 'success' },
  COMPLETED: { label: 'Finalizado', variant: 'success' },
  REJECTED: { label: 'Reprovado', variant: 'danger' },
  CANCELLED: { label: 'Cancelado', variant: 'danger' },
}

const inputCls = 'w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20'
const labelCls = 'text-xs font-semibold text-muted-foreground mb-1 block'

function NovoProcessoModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string } | null>(null)
  const [type, setType] = useState<'CR' | 'CRAF' | 'GT'>('CR')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { data: clientData, loading: loadingClients } = useApi(
    () => clients.list({ search: clientSearch || undefined, limit: 10 }),
    [clientSearch],
  )
  const clientList = clientData?.data ?? []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedClient) { setError('Selecione um cliente'); return }
    setLoading(true)
    setError('')
    try {
      await processesApi.create({ clientId: selectedClient.id, type })
      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar processo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-foreground text-lg">Novo Processo</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelCls}>TIPO DE PROCESSO *</label>
            <div className="flex gap-2">
              {(['CR', 'CRAF', 'GT'] as const).map((t) => (
                <button type="button" key={t} onClick={() => setType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${type === t ? 'border-[#0B2545] bg-[#0B2545] text-white' : 'border-border text-muted-foreground hover:border-[#0B2545]/40'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>CLIENTE *</label>
            {selectedClient ? (
              <div className="flex items-center justify-between px-3 py-2.5 bg-[#0B2545]/10 border border-[#0B2545]/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-[#0B2545] to-[#3E92CC] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(selectedClient.name)}
                  </div>
                  <span className="text-sm font-medium text-foreground">{selectedClient.name}</span>
                </div>
                <button type="button" onClick={() => setSelectedClient(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Buscar cliente por nome..."
                    className={`${inputCls} pl-9`}
                  />
                </div>
                {clientSearch && (
                  <div className="bg-muted rounded-xl border border-border max-h-40 overflow-y-auto">
                    {loadingClients ? (
                      <div className="py-3 text-center text-xs text-muted-foreground">Buscando...</div>
                    ) : clientList.length === 0 ? (
                      <div className="py-3 text-center text-xs text-muted-foreground">Nenhum cliente encontrado</div>
                    ) : clientList.map((c) => (
                      <button
                        type="button" key={c.id}
                        onClick={() => { setSelectedClient({ id: c.id, name: c.name }); setClientSearch('') }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-background transition-colors border-b border-border last:border-0"
                      >
                        <div className="w-6 h-6 bg-gradient-to-br from-[#0B2545] to-[#3E92CC] rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {getInitials(c.name)}
                        </div>
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-xl">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading || !selectedClient} className="flex-1 bg-[#0B2545] hover:bg-[#13315C]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Processo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProcessesPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const { data: processList, loading, error } = useApi(
    () => processesApi.list({
      type: typeFilter || undefined,
      status: statusFilter || undefined,
    }),
    [typeFilter, statusFilter, refreshKey],
  )

  const filtered = (processList ?? []).filter((p) =>
    !search || (p.client as any)?.name?.toLowerCase().includes(search.toLowerCase()),
  )

  const active = filtered.filter((p) => p.status === 'IN_PROGRESS').length
  const completed = filtered.filter((p) => p.status === 'COMPLETED').length

  return (
    <div className="space-y-6 animate-fade-in">
      {showModal && (
        <NovoProcessoModal
          onClose={() => setShowModal(false)}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      )}

      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Processos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? 'Carregando...' : `${active} em andamento · ${completed} finalizados`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateFilter value="month" onChange={setDateRange} />
          <Button size="sm" className="gap-2 bg-[#0B2545] hover:bg-[#13315C]" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" /> Novo Processo
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <div className="flex gap-1">
          {[['', 'Todos'], ['CR', 'CR'], ['CRAF', 'CRAF'], ['GT', 'GT']].map(([val, label]) => (
            <button key={val} onClick={() => setTypeFilter(val)}
              className={`px-3 py-2 text-xs rounded-lg font-medium transition-all ${typeFilter === val ? 'bg-[#0B2545] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {[['', 'Todos'], ['IN_PROGRESS', 'Andamento'], ['WAITING_ANALYSIS', 'Análise'], ['COMPLETED', 'Finalizado']].map(([val, label]) => (
            <button key={val} onClick={() => setStatusFilter(val)}
              className={`px-3 py-2 text-xs rounded-lg font-medium transition-all ${statusFilter === val ? 'bg-[#0B2545] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        {loading && (
          <div className="py-16 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Carregando processos...</span>
          </div>
        )}
        {error && <div className="py-16 text-center text-red-500 text-sm">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Tipo', 'Cliente', 'Progresso', 'Etapas', 'Status', 'Iniciado', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const client = (p as any).client
                  const steps = p.steps ?? []
                  const pendingSteps = steps.filter((s: any) => !s.isCompleted).length
                  const statusCfg = statusConfig[p.status] ?? { label: p.status, variant: 'secondary' as const }
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#0B2545] to-[#134074] rounded-lg flex items-center justify-center">
                            <Shield className="w-4 h-4 text-[#3E92CC]" />
                          </div>
                          <Badge variant={typeColors[p.type] as any}>{p.type}</Badge>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gradient-to-br from-[#0B2545] to-[#3E92CC] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            {getInitials(client?.name ?? '?')}
                          </div>
                          <span className="text-sm font-medium text-foreground">{client?.name ?? '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#3E92CC] to-[#00C853]" style={{ width: `${p.progress}%` }} />
                          </div>
                          <span className="text-xs font-bold text-foreground w-9 text-right">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {pendingSteps > 0 ? (
                          <span className="text-xs text-[#D50000] font-medium bg-[#D50000]/10 px-2 py-1 rounded-full">{pendingSteps} pendentes</span>
                        ) : (
                          <span className="text-xs text-[#00C853] font-medium bg-[#00C853]/10 px-2 py-1 rounded-full">Completo</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-4">
                        <Link href={`/clients/${p.clientId}`}>
                          <Button variant="ghost" size="sm" className="text-xs text-[#3E92CC] hover:text-[#3E92CC]">Ver →</Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-muted-foreground">
                <Shield className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum processo encontrado</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
