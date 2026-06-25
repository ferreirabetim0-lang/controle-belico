'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Phone, Mail, MapPin, Edit, Plus, FileText,
  Clock, AlertTriangle, MessageSquare, Trash2,
  User, Calendar, Shield, DollarSign, Loader2, X, Search, Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getInitials, formatCurrency } from '@/lib/utils'
import { ProcessChecklist } from '@/components/processes/process-checklist'
import { ClientDocuments } from '@/components/clients/client-documents'
import { ClientTimeline } from '@/components/clients/client-timeline'
import { ClientFinancial } from '@/components/clients/client-financial'
import { useApi } from '@/hooks/use-api'
import { clients, processes as processesApi, type Process, type Transaction } from '@/lib/api'

const tabs = [
  { id: 'overview', label: 'Visão Geral', icon: User },
  { id: 'processes', label: 'Processos', icon: Shield },
  { id: 'documents', label: 'Documentos', icon: FileText },
  { id: 'financial', label: 'Financeiro', icon: DollarSign },
  { id: 'timeline', label: 'Timeline', icon: Clock },
]

const statusConfig: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'secondary' | 'danger' }> = {
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

const inputCls = 'w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20'

function NovoProcessoModal({ clientId, clientName, onClose, onSuccess }: {
  clientId: string; clientName: string; onClose: () => void; onSuccess: () => void
}) {
  const [type, setType] = useState<'CR' | 'CRAF' | 'GT'>('CR')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await processesApi.create({ clientId, type })
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
      <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-bold text-foreground">Novo Processo</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{clientName}</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">TIPO DE PROCESSO *</label>
            <div className="flex gap-2">
              {(['CR', 'CRAF', 'GT'] as const).map((t) => (
                <button type="button" key={t} onClick={() => setType(t)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${type === t ? 'border-[#0B2545] bg-[#0B2545] text-white' : 'border-border text-muted-foreground hover:border-[#0B2545]/40'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-xl">{error}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-[#0B2545] hover:bg-[#13315C]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Processo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditClientModal({ client, onClose, onSuccess }: { client: any; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: client.name ?? '',
    phone: client.phone ?? '',
    email: client.email ?? '',
    city: client.city ?? '',
    state: client.state ?? '',
    rg: client.rg ?? '',
    profession: client.profession ?? '',
    observations: client.observations ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await clients.update(client.id, form)
      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
          <h2 className="font-bold text-foreground">Editar Cliente</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">NOME *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">TELEFONE</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">RG</label>
              <input value={form.rg} onChange={(e) => setForm({ ...form, rg: e.target.value })} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">E-MAIL</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">CIDADE</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">ESTADO</label>
              <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} maxLength={2} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">PROFISSÃO</label>
              <input value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">OBSERVAÇÕES</label>
            <textarea rows={3} value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} className={`${inputCls} resize-none`} />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-xl">{error}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-[#0B2545] hover:bg-[#13315C]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ClientDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState('overview')
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null)

  const { data: client, loading, error } = useApi(() => clients.get(id), [id, refreshKey])

  async function handleArchive() {
    if (!confirm(`Arquivar "${client?.name}"? Esta ação pode ser revertida.`)) return
    try {
      await clients.archive(id)
      router.push('/clients')
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao arquivar')
    }
  }

  function handleWhatsApp() {
    const phone = client?.phone?.replace(/\D/g, '') || client?.whatsapp?.replace(/\D/g, '')
    if (!phone) return alert('Cliente sem telefone cadastrado')
    window.open(`https://wa.me/55${phone}`, '_blank')
  }

  if (loading && !client) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Carregando cliente...</span>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground">
        <AlertTriangle className="w-10 h-10 text-[#D50000]" />
        <p className="text-sm">{error ?? 'Cliente não encontrado'}</p>
        <Button variant="outline" onClick={() => router.back()}>Voltar</Button>
      </div>
    )
  }

  const processes: Process[] = (client as any).processes ?? []
  const activeProcess = processes.find((p) => p.status === 'IN_PROGRESS') ?? processes[0]
  const statusCfg = statusConfig[client.status] ?? { label: client.status, variant: 'secondary' as const }
  const selectedProcess = processes.find((p) => p.id === selectedProcessId) ?? activeProcess

  return (
    <div className="space-y-6 animate-fade-in">
      {showProcessModal && (
        <NovoProcessoModal
          clientId={id} clientName={client.name}
          onClose={() => setShowProcessModal(false)}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      )}
      {showEditModal && (
        <EditClientModal
          client={client}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
            <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            CPF: {client.cpf} · Cadastrado em {new Date(client.createdAt).toLocaleDateString('pt-BR')}
            {(client as any).responsible?.name && ` · Responsável: ${(client as any).responsible.name}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleWhatsApp}>
            <MessageSquare className="w-4 h-4 text-[#00C853]" /> WhatsApp
          </Button>
          <Button size="sm" className="gap-2 bg-[#0B2545] hover:bg-[#13315C]" onClick={() => setShowEditModal(true)}>
            <Edit className="w-4 h-4" /> Editar
          </Button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Phone, label: 'Telefone', value: client.phone },
          { icon: Mail, label: 'E-mail', value: client.email },
          { icon: MapPin, label: 'Cidade', value: client.city ? `${client.city}${client.state ? ` — ${client.state}` : ''}` : null },
          { icon: Calendar, label: 'Cadastro', value: new Date(client.createdAt).toLocaleDateString('pt-BR') },
        ].map((item) => (
          <div key={item.label} className="bg-card rounded-xl p-4 border border-border flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              <item.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">{item.label}</div>
              <div className="text-sm font-medium text-foreground truncate">{item.value || '—'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Active process progress bar */}
      {activeProcess && (
        <div className="bg-gradient-to-r from-[#0B2545] to-[#134074] rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#3E92CC]" />
              <span className="font-semibold">Processo {activeProcess.type} em andamento</span>
            </div>
            <span className="text-2xl font-extrabold text-[#3E92CC]">{activeProcess.progress}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5 mb-2">
            <div className="bg-gradient-to-r from-[#3E92CC] to-[#00C853] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${activeProcess.progress}%` }} />
          </div>
          <div className="text-white/60 text-xs">
            {(activeProcess.steps ?? []).filter((s) => s.isCompleted).length} de {(activeProcess.steps ?? []).length} etapas concluídas
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'border-[#3E92CC] text-[#3E92CC]' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && (
          <ClientOverview
            client={client}
            onNewProcess={() => setShowProcessModal(true)}
            onArchive={handleArchive}
            onWhatsApp={handleWhatsApp}
            processes={processes}
            onOpenProcess={(id) => { setSelectedProcessId(id); setActiveTab('processes') }}
          />
        )}
        {activeTab === 'processes' && (
          processes.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground space-y-3">
              <Shield className="w-10 h-10 mx-auto opacity-20" />
              <p className="text-sm">Nenhum processo cadastrado</p>
              <Button size="sm" className="bg-[#0B2545] hover:bg-[#13315C]" onClick={() => setShowProcessModal(true)}>
                <Plus className="w-4 h-4 mr-2" /> Criar Processo
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selector de processos */}
              {processes.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {processes.map((p) => {
                    const isSelected = p.id === selectedProcess?.id
                    const isDone = p.progress === 100
                    return (
                      <button key={p.id} onClick={() => setSelectedProcessId(p.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                          isSelected
                            ? 'border-[#0B2545] bg-[#0B2545] text-white'
                            : 'border-border text-muted-foreground hover:border-[#0B2545]/40 bg-card'
                        }`}>
                        <span>{p.type}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          isDone
                            ? isSelected ? 'bg-[#00C853]/30 text-[#00C853]' : 'bg-[#00C853]/10 text-[#00C853]'
                            : isSelected ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          {isDone ? '✓ Concluído' : `${p.progress}%`}
                        </span>
                      </button>
                    )
                  })}
                  <Button size="sm" variant="outline" className="gap-1.5 ml-auto" onClick={() => setShowProcessModal(true)}>
                    <Plus className="w-3.5 h-3.5" /> Novo
                  </Button>
                </div>
              )}

              {/* Checklist do processo selecionado */}
              {selectedProcess && (
                <ProcessChecklist
                  key={selectedProcess.id}
                  process={selectedProcess}
                  onUpdate={() => setRefreshKey((k) => k + 1)}
                />
              )}
            </div>
          )
        )}
        {activeTab === 'documents' && (
          <ClientDocuments
            clientId={id}
            documents={(client as any).documents ?? []}
            processes={processes}
          />
        )}
        {activeTab === 'financial' && (
          <ClientFinancial clientId={id} />
        )}
        {activeTab === 'timeline' && (
          <ClientTimeline clientId={id} timeline={(client as any).timeline ?? []} />
        )}
      </div>
    </div>
  )
}

function ClientOverview({ client, onNewProcess, onArchive, onWhatsApp, processes, onOpenProcess }: {
  client: any; onNewProcess: () => void; onArchive: () => void; onWhatsApp: () => void; processes: Process[]; onOpenProcess: (id: string) => void
}) {
  const [showGovPwd, setShowGovPwd] = useState(false)
  const allSteps = processes.flatMap((p) => p.steps ?? [])
  const pendingSteps = allSteps.filter((s) => !s.isCompleted)
  const completedSteps = allSteps.filter((s) => s.isCompleted)
  const daysAsClient = Math.floor((Date.now() - new Date(client.createdAt).getTime()) / 86400000)
  const activeProcess = processes.find((p) => p.status === 'IN_PROGRESS') ?? processes[0]

  const govStep = activeProcess?.steps?.find((s) => s.stepKey === 'gov_password')
  const psychStep = activeProcess?.steps?.find((s) => s.stepKey === 'psych_schedule')
  const shootStep = activeProcess?.steps?.find((s) => s.stepKey === 'shooting_schedule')
  const sentStep = activeProcess?.steps?.find((s) => s.stepKey === 'sent_analysis')

  const govPwd = (govStep as any)?.metadata?.govPassword as string | undefined
  const psychDate = (psychStep as any)?.metadata?.schedulingDate as string | undefined
  const psychTime = (psychStep as any)?.metadata?.schedulingTime as string | undefined
  const psychLoc = (psychStep as any)?.metadata?.schedulingLocation as string | undefined
  const shootDate = (shootStep as any)?.metadata?.schedulingDate as string | undefined
  const shootTime = (shootStep as any)?.metadata?.schedulingTime as string | undefined
  const shootLoc = (shootStep as any)?.metadata?.schedulingLocation as string | undefined
  const sentDate = (sentStep as any)?.metadata?.sentAnalysisDate as string | undefined

  const phone = (client.phone || client.whatsapp || '').replace(/\D/g, '')

  function waLink(type: string, date: string, time?: string, loc?: string) {
    const msg = encodeURIComponent(
      `Olá ${client.name}! Lembrando do seu agendamento de ${type} em ` +
      `${new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}` +
      `${time ? ` às ${time}` : ''}${loc ? ` no local: ${loc}` : ''}. ` +
      `Qualquer dúvida, estamos à disposição!`
    )
    return `https://wa.me/55${phone}?text=${msg}`
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">

        {/* Cards de processos */}
        {processes.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-foreground text-sm">Processos</h3>
            {processes.map((p) => {
              const steps = p.steps ?? []
              const total = steps.length
              const done = steps.filter((s) => s.isCompleted).length
              const pending = total - done
              const pct = total ? Math.round((done / total) * 100) : 0
              const isDone = pct === 100

              const meta = (key: string) => (steps.find((s) => s.stepKey === key) as any)?.metadata ?? {}
              const queueDate    = meta('in_queue').queueDate as string | undefined
              const analysisDate = meta('in_analysis').analysisDate as string | undefined
              const deferralDate = meta('approved').deferralDate as string | undefined

              const fmtDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')

              return (
                <button key={p.id} onClick={() => onOpenProcess(p.id)}
                  className="w-full text-left bg-card border border-border rounded-2xl p-5 hover:border-[#3E92CC]/50 hover:shadow-soft transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white ${isDone ? 'bg-[#00C853]' : 'bg-[#0B2545]'}`}>
                        {p.type}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">Processo {p.type}</div>
                        <div className="text-xs text-muted-foreground">Iniciado em {new Date(p.createdAt).toLocaleDateString('pt-BR')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`text-xl font-extrabold ${isDone ? 'text-[#00C853]' : 'text-[#3E92CC]'}`}>{pct}%</div>
                        <div className="text-xs text-muted-foreground">{done}/{total} etapas</div>
                      </div>
                      <span className="text-muted-foreground group-hover:text-[#3E92CC] transition-colors">→</span>
                    </div>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div className={`h-2 rounded-full transition-all duration-500 ${isDone ? 'bg-[#00C853]' : 'bg-gradient-to-r from-[#3E92CC] to-[#00C853]'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-3">
                    <span className="text-[#00C853]">✓ {done} concluídas</span>
                    {pending > 0 && <span className="text-[#D50000]">⚠ {pending} pendentes</span>}
                    {isDone && <span className="text-[#00C853] font-semibold">Processo concluído!</span>}
                  </div>

                  {/* Datas de status */}
                  {(queueDate || analysisDate || deferralDate) && (
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
                      {[
                        { label: 'Em Fila',     date: queueDate,    color: 'text-[#FFAB00]', dot: 'bg-[#FFAB00]' },
                        { label: 'Em Análise',  date: analysisDate, color: 'text-[#3E92CC]', dot: 'bg-[#3E92CC]' },
                        { label: 'Deferido',    date: deferralDate, color: 'text-[#00C853]', dot: 'bg-[#00C853]' },
                      ].map(({ label, date, color, dot }) => (
                        <div key={label} className={`rounded-xl px-2 py-1.5 ${date ? 'bg-muted' : 'bg-muted/30'}`}>
                          <div className="flex items-center gap-1 mb-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${date ? dot : 'bg-border'}`} />
                            <span className="text-xs text-muted-foreground">{label}</span>
                          </div>
                          <div className={`text-xs font-semibold ${date ? color : 'text-muted-foreground/40'}`}>
                            {date ? fmtDate(date) : '—'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pendências compactas */}
                  {pending > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="grid grid-cols-2 gap-1">
                        {steps.filter((s) => !s.isCompleted).slice(0, 6).map((s) => (
                          <div key={s.stepKey} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <div className="w-3 h-3 rounded border border-[#D50000]/40 flex-shrink-0" />
                            {s.stepName}
                          </div>
                        ))}
                        {pending > 6 && <div className="text-xs text-muted-foreground col-span-2">+{pending - 6} mais...</div>}
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {(govPwd || psychDate || shootDate || sentDate) && (
          <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
            <h3 className="font-bold text-foreground text-sm">Informações do Processo</h3>

            {govPwd && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#0B2545]/10 rounded-xl flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-[#0B2545]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">Senha GOV</div>
                  <div className="text-sm font-mono font-medium">{showGovPwd ? govPwd : '•'.repeat(govPwd.length)}</div>
                </div>
                <button onClick={() => setShowGovPwd((v) => !v)}
                  className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg border border-border">
                  {showGovPwd ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            )}

            {psychDate && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#3E92CC]/10 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-[#3E92CC]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">Exame Psicológico</div>
                  <div className="text-sm font-medium">
                    {new Date(psychDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                    {psychTime ? ` às ${psychTime}` : ''}
                    {psychLoc ? ` — ${psychLoc}` : ''}
                  </div>
                </div>
                {phone && (
                  <a href={waLink('Exame Psicológico', psychDate, psychTime, psychLoc)} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" className="text-xs gap-1.5 text-[#00C853] border-[#00C853]/30 hover:bg-[#00C853]/5 shrink-0">
                      <MessageSquare className="w-3 h-3" /> Lembrar cliente
                    </Button>
                  </a>
                )}
              </div>
            )}

            {shootDate && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#FFAB00]/10 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-[#FFAB00]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">Exame de Tiro</div>
                  <div className="text-sm font-medium">
                    {new Date(shootDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                    {shootTime ? ` às ${shootTime}` : ''}
                    {shootLoc ? ` — ${shootLoc}` : ''}
                  </div>
                </div>
                {phone && (
                  <a href={waLink('Exame de Tiro', shootDate, shootTime, shootLoc)} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" className="text-xs gap-1.5 text-[#00C853] border-[#00C853]/30 hover:bg-[#00C853]/5 shrink-0">
                      <MessageSquare className="w-3 h-3" /> Lembrar cliente
                    </Button>
                  </a>
                )}
              </div>
            )}

            {sentDate && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#00C853]/10 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-[#00C853]" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Enviado para Análise</div>
                  <div className="text-sm font-medium">{new Date(sentDate + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="font-bold text-foreground mb-5">Dados Pessoais</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Nome completo', value: client.name },
              { label: 'CPF', value: client.cpf },
              { label: 'RG', value: client.rg },
              { label: 'Telefone', value: client.phone },
              { label: 'E-mail', value: client.email },
              { label: 'Cidade / Estado', value: client.city ? `${client.city}${client.state ? ` / ${client.state}` : ''}` : null },
              { label: 'Endereço', value: client.address },
              { label: 'Profissão', value: client.profession },
              { label: 'Origem', value: client.leadSource },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                <div className="text-sm font-medium text-foreground">{item.value || '—'}</div>
              </div>
            ))}
          </div>
        </div>

        {client.observations && (
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="font-bold text-foreground mb-3">Observações</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{client.observations}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h3 className="font-bold text-foreground mb-4 text-sm">Ações Rápidas</h3>
          <div className="space-y-2">
            <Button className="w-full justify-start gap-2 bg-[#0B2545] hover:bg-[#13315C] text-sm" onClick={onNewProcess}>
              <Plus className="w-4 h-4" /> Novo Processo
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 text-sm text-[#00C853] border-[#00C853]/30 hover:bg-[#00C853]/5" onClick={onWhatsApp}>
              <MessageSquare className="w-4 h-4" /> Enviar WhatsApp
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 text-sm text-[#D50000] border-[#D50000]/30 hover:bg-[#D50000]/5" onClick={onArchive}>
              <Trash2 className="w-4 h-4" /> Arquivar Cliente
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <h3 className="font-bold text-foreground mb-4 text-sm">Resumo</h3>
          <div className="space-y-3">
            {[
              { label: 'Processos', value: String(processes.length) },
              { label: 'Processos ativos', value: String(processes.filter((p) => p.status === 'IN_PROGRESS').length) },
              { label: 'Dias como cliente', value: String(daysAsClient) },
            ].map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-sm font-bold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
