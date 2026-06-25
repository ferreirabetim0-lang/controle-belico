'use client'

import { useState, useMemo } from 'react'
import { FileSignature, CheckCircle2, Clock, AlertTriangle, Plus, Trash2, CheckCheck, Search, X, Loader2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useApi } from '@/hooks/use-api'
import { signatures as signaturesApi, clients as clientsApi, type Signature, type Client } from '@/lib/api'

const inputCls = 'w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20'
const labelCls = 'text-xs font-semibold text-muted-foreground mb-1 block'

const statusConfig = {
  PENDING: { label: 'Aguardando', variant: 'warning' as const, icon: Clock, color: 'text-[#FFAB00]', bg: 'bg-[#FFAB00]/10' },
  SIGNED:  { label: 'Assinado',   variant: 'success' as const, icon: CheckCircle2, color: 'text-[#00C853]', bg: 'bg-[#00C853]/10' },
  EXPIRED: { label: 'Expirado',   variant: 'danger' as const,  icon: AlertTriangle, color: 'text-[#D50000]', bg: 'bg-[#D50000]/10' },
}

// ─── Modal de nova assinatura ─────────────────────────────────────────────────

function NovaAssinaturaModal({
  clientsList,
  onClose,
  onSuccess,
}: {
  clientsList: Client[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({ clientId: '', document: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [open, setOpen] = useState(false)

  const selectedClient = clientsList.find((c) => c.id === form.clientId)

  const filteredClients = useMemo(() => {
    if (!clientSearch) return clientsList.slice(0, 30)
    const q = clientSearch.toLowerCase()
    return clientsList.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 30)
  }, [clientsList, clientSearch])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.clientId || !form.document) { setError('Preencha todos os campos'); return }
    setLoading(true); setError('')
    try {
      await signaturesApi.create({ clientId: form.clientId, document: form.document })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar assinatura')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-foreground text-lg">Solicitar Assinatura</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Client picker */}
          <div>
            <label className={labelCls}>CLIENTE *</label>
            <div className="relative">
              <button type="button" onClick={() => setOpen((v) => !v)}
                className={`${inputCls} flex items-center justify-between text-left`}>
                <span className={selectedClient ? 'text-foreground' : 'text-muted-foreground'}>
                  {selectedClient ? selectedClient.name : 'Selecionar cliente...'}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
              {open && (
                <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <input autoFocus value={clientSearch} onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Buscar cliente..." className="w-full px-2 py-1.5 text-sm bg-muted rounded-lg focus:outline-none" />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredClients.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-muted-foreground text-center">Nenhum cliente encontrado</div>
                    ) : filteredClients.map((c) => (
                      <button key={c.id} type="button"
                        onClick={() => { setForm((f) => ({ ...f, clientId: c.id })); setOpen(false); setClientSearch('') }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors">
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className={labelCls}>DOCUMENTO *</label>
            <input required value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })}
              placeholder="Ex: Procuração para Processo CR" className={inputCls} />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-xl">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-[#0B2545] hover:bg-[#13315C]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Solicitação'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function SignaturesPage() {
  const [showModal, setShowModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const refresh = () => setRefreshKey((k) => k + 1)

  const { data: rawList, loading } = useApi(() => signaturesApi.list(), [refreshKey])
  const { data: clientsData } = useApi(() => clientsApi.list({ limit: 500 }), [])

  const allSignatures: Signature[] = rawList ?? []
  const clientsList: Client[] = clientsData?.data ?? []

  // Client-side filtering (search + status)
  const filtered = useMemo(() => {
    return allSignatures.filter((s) => {
      if (statusFilter && s.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!s.document?.toLowerCase().includes(q) && !s.client?.name?.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [allSignatures, statusFilter, search])

  const signed  = allSignatures.filter((s) => s.status === 'SIGNED').length
  const pending = allSignatures.filter((s) => s.status === 'PENDING').length
  const expired = allSignatures.filter((s) => s.status === 'EXPIRED').length

  async function handleMarkSigned(sig: Signature) {
    setActionLoading(sig.id)
    try {
      await signaturesApi.update(sig.id, { status: 'SIGNED' })
      refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta solicitação?')) return
    setActionLoading(id)
    try {
      await signaturesApi.remove(id)
      refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {showModal && (
        <NovaAssinaturaModal
          clientsList={clientsList}
          onClose={() => setShowModal(false)}
          onSuccess={refresh}
        />
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assinaturas Digitais</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {signed} assinados · {pending} aguardando · {expired} expirados
          </p>
        </div>
        <Button size="sm" className="gap-2 bg-[#0B2545] hover:bg-[#13315C]" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Solicitar Assinatura
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total enviados', value: allSignatures.length, color: 'text-foreground', border: 'border-l-[#3E92CC]' },
          { label: 'Assinados',      value: signed,               color: 'text-[#00C853]',  border: 'border-l-[#00C853]' },
          { label: 'Pendentes',      value: pending,              color: 'text-[#FFAB00]',  border: 'border-l-[#FFAB00]' },
        ].map((kpi) => (
          <div key={kpi.label} className={`stat-card border-l-4 ${kpi.border}`}>
            <div className={`text-3xl font-extrabold ${kpi.color} mb-1`}>{loading ? '—' : kpi.value}</div>
            <div className="text-xs text-muted-foreground">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2">
          {([['', 'Todos'], ['PENDING', 'Aguardando'], ['SIGNED', 'Assinados'], ['EXPIRED', 'Expirados']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setStatusFilter(val)}
              className={`px-4 py-2 text-sm rounded-xl font-medium transition-all ${
                statusFilter === val ? 'bg-[#0B2545] text-white' : 'bg-card border border-border text-muted-foreground hover:border-[#0B2545]/40'
              }`}>
              {label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente ou documento..."
            className="pl-8 pr-3 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 w-64" />
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Carregando assinaturas...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-16 text-center space-y-3">
          <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto">
            <FileSignature className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">
            {search || statusFilter ? 'Nenhuma assinatura encontrada para os filtros aplicados' : 'Nenhuma assinatura cadastrada'}
          </p>
          <p className="text-sm text-muted-foreground">
            {search || statusFilter ? 'Tente remover os filtros.' : 'Clique em "Solicitar Assinatura" para começar.'}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map((sig) => {
              const cfg = statusConfig[sig.status as keyof typeof statusConfig] ?? statusConfig.PENDING
              const Icon = cfg.icon
              const isActing = actionLoading === sig.id
              return (
                <div key={sig.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group">
                  <div className={`w-9 h-9 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{sig.document}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-medium">{sig.client?.name ?? '—'}</span>
                      {' · '}Enviado em {sig.sentAt ? new Date(sig.sentAt).toLocaleDateString('pt-BR') : '—'}
                      {sig.signedAt && ` · Assinado em ${new Date(sig.signedAt).toLocaleDateString('pt-BR')}`}
                    </div>
                  </div>
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {sig.status === 'PENDING' && (
                      <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg text-[#00C853]"
                        title="Marcar como assinado" onClick={() => handleMarkSigned(sig)} disabled={isActing}>
                        {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg text-[#D50000]"
                      title="Excluir" onClick={() => handleDelete(sig.id)} disabled={isActing}>
                      {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
