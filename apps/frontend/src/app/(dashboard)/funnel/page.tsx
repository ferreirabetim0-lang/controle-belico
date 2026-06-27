'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Plus, X, Phone, Mail, MapPin, DollarSign, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'
import { useApi } from '@/hooks/use-api'
import { leads as leadsApi, type Lead, type LeadStage } from '@/lib/api'

// ─── Config ──────────────────────────────────────────────────────────────────

const STAGES: { key: LeadStage; label: string; color: string; bg: string; dot: string }[] = [
  { key: 'NOVO',        label: 'Novos Leads',    color: 'text-[#3E92CC]', bg: 'bg-[#3E92CC]/10', dot: 'bg-[#3E92CC]' },
  { key: 'CONTATO',     label: 'Contato Feito',  color: 'text-[#FFAB00]', bg: 'bg-[#FFAB00]/10', dot: 'bg-[#FFAB00]' },
  { key: 'PROPOSTA',    label: 'Proposta Enviada', color: 'text-[#7B2FBE]', bg: 'bg-[#7B2FBE]/10', dot: 'bg-[#7B2FBE]' },
  { key: 'NEGOCIACAO',  label: 'Negociação',     color: 'text-[#FF6B2B]', bg: 'bg-[#FF6B2B]/10', dot: 'bg-[#FF6B2B]' },
  { key: 'FECHADO',     label: 'Fechado',        color: 'text-[#00C853]', bg: 'bg-[#00C853]/10', dot: 'bg-[#00C853]' },
  { key: 'PERDIDO',     label: 'Perdido',        color: 'text-[#D50000]', bg: 'bg-[#D50000]/10', dot: 'bg-[#D50000]' },
]

const SOURCES = ['Indicação', 'Instagram', 'Facebook', 'Google', 'WhatsApp', 'Site', 'Outro']

function fmtCurrency(v?: number) {
  if (!v) return null
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

// ─── Lead Modal ──────────────────────────────────────────────────────────────

type ModalProps = {
  lead?: Lead | null
  defaultStage?: LeadStage
  onSave: (data: Partial<Lead>) => Promise<void>
  onClose: () => void
}

function LeadModal({ lead, defaultStage = 'NOVO', onSave, onClose }: ModalProps) {
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: lead?.name ?? '',
    phone: lead?.phone ?? '',
    email: lead?.email ?? '',
    city: lead?.city ?? '',
    source: lead?.source ?? '',
    value: lead?.value ? String(lead.value) : '',
    notes: lead?.notes ?? '',
    stage: lead?.stage ?? defaultStage,
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setApiError(null)
    try {
      await onSave({
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        city: form.city.trim() || undefined,
        source: form.source || undefined,
        value: form.value ? Number(form.value) : undefined,
        notes: form.notes.trim() || undefined,
        stage: form.stage as LeadStage,
      })
      onClose()
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Erro ao salvar lead')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground">{lead ? 'Editar Lead' : 'Novo Lead'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nome *</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} required
              placeholder="Nome do lead" className="w-full px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/30" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Telefone / WhatsApp</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)}
                placeholder="(00) 00000-0000" className="w-full px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">E-mail</label>
              <input value={form.email} onChange={(e) => set('email', e.target.value)} type="email"
                placeholder="email@exemplo.com" className="w-full px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/30" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Cidade</label>
              <input value={form.city} onChange={(e) => set('city', e.target.value)}
                placeholder="São Paulo, SP" className="w-full px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Valor Estimado (R$)</label>
              <input value={form.value} onChange={(e) => set('value', e.target.value)} type="number" min="0"
                placeholder="0" className="w-full px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/30" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Origem</label>
              <select value={form.source} onChange={(e) => set('source', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/30">
                <option value="">Selecionar...</option>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Estágio</label>
              <select value={form.stage} onChange={(e) => set('stage', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/30">
                {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Observações</label>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3}
              placeholder="Anotações sobre o lead..."
              className="w-full px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/30 resize-none" />
          </div>

          {apiError && (
            <div className="text-xs text-[#D50000] bg-[#D50000]/10 border border-[#D50000]/30 rounded-lg px-3 py-2">
              {apiError}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-[#0B2545] hover:bg-[#13315C]">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (lead ? 'Salvar' : 'Criar Lead')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Lead Card ────────────────────────────────────────────────────────────────

type CardProps = {
  lead: Lead
  stageIndex: number
  maxStage: number
  onEdit: () => void
  onDelete: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
  // drag
  dragging: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
}

function LeadCard({ lead, stageIndex, maxStage, onEdit, onDelete, onMoveLeft, onMoveRight, onMoveUp, onMoveDown, isFirst, isLast, dragging, onDragStart, onDragEnd }: CardProps) {
  const stage = STAGES[stageIndex]
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`bg-card border border-border rounded-xl p-3.5 cursor-grab active:cursor-grabbing transition-all select-none
        ${dragging ? 'opacity-40 scale-95' : 'hover:shadow-md hover:border-border/80'}`}
    >
      {/* Header */}
      <div className="flex items-start gap-2.5 mb-2.5">
        <div className="w-8 h-8 bg-gradient-to-br from-[#0B2545] to-[#3E92CC] rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {getInitials(lead.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">{lead.name}</div>
          {lead.city && <div className="text-[11px] text-muted-foreground flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{lead.city}</div>}
        </div>
        {showActions && (
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={onEdit} className="w-6 h-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Edit2 className="w-3 h-3" />
            </button>
            <button onClick={onDelete} className="w-6 h-6 rounded-md hover:bg-[#D50000]/10 flex items-center justify-center text-muted-foreground hover:text-[#D50000] transition-colors">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1 mb-2.5">
        {lead.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="w-2.5 h-2.5 flex-shrink-0 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground truncate flex-1">{lead.phone}</span>
            <a
              href={`https://wa.me/55${lead.phone.replace(/\D/g, '').replace(/^55/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#00C853]/15 text-[#00C853] text-[10px] font-semibold hover:bg-[#00C853]/25 transition-colors"
              title="Abrir WhatsApp"
            >
              <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WA
            </a>
          </div>
        )}
        {lead.email && (
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Mail className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {lead.value ? (
            <div className="text-xs font-bold text-[#00C853] flex items-center gap-0.5">
              <DollarSign className="w-3 h-3" />{fmtCurrency(lead.value)}
            </div>
          ) : null}
          {lead.source && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{lead.source}</span>
          )}
        </div>

        {/* Move arrows */}
        <div className="flex gap-0.5">
          <button onClick={onMoveUp} disabled={isFirst} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 transition-colors" title="Mover para cima">
            <ChevronLeft className="w-3 h-3 rotate-90" />
          </button>
          <button onClick={onMoveDown} disabled={isLast} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 transition-colors" title="Mover para baixo">
            <ChevronRight className="w-3 h-3 rotate-90" />
          </button>
          <button onClick={onMoveLeft} disabled={stageIndex === 0} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 transition-colors" title="Coluna anterior">
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button onClick={onMoveRight} disabled={stageIndex === maxStage} className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 transition-colors" title="Próxima coluna">
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {lead.notes && (
        <div className="mt-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground line-clamp-2">{lead.notes}</div>
      )}
    </div>
  )
}

// ─── Column ───────────────────────────────────────────────────────────────────

type ColumnProps = {
  stage: typeof STAGES[number]
  stageIndex: number
  items: Lead[]
  draggingId: string | null
  onDragStart: (lead: Lead, e: React.DragEvent) => void
  onDragEnd: () => void
  onDrop: (stage: LeadStage, overIndex: number) => void
  onAddLead: (stage: LeadStage) => void
  onEdit: (lead: Lead) => void
  onDelete: (id: string) => void
  onMoveStage: (lead: Lead, direction: 'left' | 'right') => void
  onMoveOrder: (lead: Lead, direction: 'up' | 'down') => void
}

function Column({ stage, stageIndex, items, draggingId, onDragStart, onDragEnd, onDrop, onAddLead, onEdit, onDelete, onMoveStage, onMoveOrder }: ColumnProps) {
  const [dragOver, setDragOver] = useState(false)
  const totalValue = items.reduce((s, l) => s + (l.value ?? 0), 0)

  return (
    <div className="flex flex-col min-w-[260px] w-[260px]">
      {/* Column header */}
      <div className={`rounded-xl p-3 mb-3 ${stage.bg}`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${stage.dot}`} />
            <span className={`text-xs font-bold ${stage.color}`}>{stage.label}</span>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 ${stage.color}`}>{items.length}</span>
        </div>
        {totalValue > 0 && (
          <div className={`text-[11px] font-semibold ${stage.color} opacity-80`}>
            {fmtCurrency(totalValue)} em potencial
          </div>
        )}
      </div>

      {/* Cards */}
      <div
        className={`flex-1 space-y-2 min-h-[120px] rounded-xl transition-all p-1 ${dragOver ? 'bg-muted/50 ring-2 ring-dashed ring-border' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); onDrop(stage.key, items.length) }}
      >
        {items.map((lead, idx) => (
          <div key={lead.id}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(stage.key, idx) }}
          >
            <LeadCard
              lead={lead}
              stageIndex={stageIndex}
              maxStage={STAGES.length - 1}
              dragging={draggingId === lead.id}
              onDragStart={(e) => onDragStart(lead, e)}
              onDragEnd={onDragEnd}
              onEdit={() => onEdit(lead)}
              onDelete={() => onDelete(lead.id)}
              onMoveLeft={() => onMoveStage(lead, 'left')}
              onMoveRight={() => onMoveStage(lead, 'right')}
              onMoveUp={() => onMoveOrder(lead, 'up')}
              onMoveDown={() => onMoveOrder(lead, 'down')}
              isFirst={idx === 0}
              isLast={idx === items.length - 1}
            />
          </div>
        ))}
      </div>

      {/* Add button */}
      <button onClick={() => onAddLead(stage.key)}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg border border-dashed border-border transition-all">
        <Plus className="w-3.5 h-3.5" /> Adicionar lead
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FunilPage() {
  const { data, loading, refetch } = useApi(() => leadsApi.list(), [])
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [defaultStage, setDefaultStage] = useState<LeadStage>('NOVO')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const draggingLead = useRef<Lead | null>(null)

  useEffect(() => {
    if (data) setAllLeads(data)
  }, [data])

  const leadsInStage = (stage: LeadStage) =>
    allLeads.filter((l) => l.stage === stage).sort((a, b) => a.order - b.order)

  const totalValue = allLeads.filter((l) => l.stage === 'FECHADO').reduce((s, l) => s + (l.value ?? 0), 0)
  const totalLeads = allLeads.length

  // Optimistic update helper
  const updateLocal = (updates: Lead[]) => {
    setAllLeads((prev) => {
      const map = new Map(prev.map((l) => [l.id, l]))
      updates.forEach((u) => map.set(u.id, u))
      return Array.from(map.values())
    })
  }

  const handleCreate = async (formData: Partial<Lead>) => {
    const created = await leadsApi.create(formData)
    setAllLeads((prev) => [...prev, created])
  }

  const handleUpdate = async (formData: Partial<Lead>) => {
    if (!editingLead) return
    const updated = await leadsApi.update(editingLead.id, formData)
    updateLocal([updated])
  }

  const handleDelete = async (id: string) => {
    setAllLeads((prev) => prev.filter((l) => l.id !== id))
    await leadsApi.remove(id).catch(() => refetch())
  }

  const handleMoveStage = async (lead: Lead, direction: 'left' | 'right') => {
    const idx = STAGES.findIndex((s) => s.key === lead.stage)
    const newIdx = direction === 'left' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= STAGES.length) return
    const newStage = STAGES[newIdx].key
    const order = leadsInStage(newStage).length
    const updated = { ...lead, stage: newStage, order }
    updateLocal([updated])
    await leadsApi.move(lead.id, newStage, order).catch(() => refetch())
  }

  const handleMoveOrder = async (lead: Lead, direction: 'up' | 'down') => {
    const stageLeads = leadsInStage(lead.stage)
    const idx = stageLeads.findIndex((l) => l.id === lead.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= stageLeads.length) return
    const other = stageLeads[swapIdx]
    const updates = [
      { ...lead, order: other.order },
      { ...other, order: lead.order },
    ]
    updateLocal(updates)
    await leadsApi.reorder(updates.map((l) => ({ id: l.id, stage: l.stage, order: l.order }))).catch(() => refetch())
  }

  const handleDrop = async (targetStage: LeadStage, targetOrder: number) => {
    const lead = draggingLead.current
    if (!lead) return
    if (lead.stage === targetStage) return
    const order = targetOrder
    const updated = { ...lead, stage: targetStage, order }
    updateLocal([updated])
    await leadsApi.move(lead.id, targetStage, order).catch(() => refetch())
  }

  const openAdd = (stage: LeadStage) => { setDefaultStage(stage); setEditingLead(null); setModalOpen(true) }
  const openEdit = (lead: Lead) => { setEditingLead(lead); setModalOpen(true) }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="page-header mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Funil de Vendas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? 'Carregando...' : `${totalLeads} leads · ${fmtCurrency(totalValue) ?? 'R$ 0'} fechados`}
          </p>
        </div>
        <Button onClick={() => openAdd('NOVO')} className="gap-2 bg-[#0B2545] hover:bg-[#13315C]">
          <Plus className="w-4 h-4" /> Novo Lead
        </Button>
      </div>

      {/* KPI strip */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
        {STAGES.map((s) => {
          const count = leadsInStage(s.key).length
          const val = leadsInStage(s.key).reduce((sum, l) => sum + (l.value ?? 0), 0)
          return (
            <div key={s.key} className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl ${s.bg} border border-border/30`}>
              <div className={`w-2 h-2 rounded-full ${s.dot}`} />
              <div>
                <div className={`text-lg font-extrabold ${s.color}`}>{count}</div>
                <div className="text-[10px] text-muted-foreground whitespace-nowrap">{s.label}</div>
                {val > 0 && <div className={`text-[10px] font-semibold ${s.color}`}>{fmtCurrency(val)}</div>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Carregando funil...</span>
        </div>
      )}

      {/* Board */}
      {!loading && (
        <div className="flex gap-4 overflow-x-auto pb-6 flex-1">
          {STAGES.map((stage, stageIndex) => (
            <Column
              key={stage.key}
              stage={stage}
              stageIndex={stageIndex}
              items={leadsInStage(stage.key)}
              draggingId={draggingId}
              onDragStart={(lead, e) => { setDraggingId(lead.id); draggingLead.current = lead; e.dataTransfer.effectAllowed = 'move' }}
              onDragEnd={() => { setDraggingId(null); draggingLead.current = null }}
              onDrop={handleDrop}
              onAddLead={openAdd}
              onEdit={openEdit}
              onDelete={handleDelete}
              onMoveStage={handleMoveStage}
              onMoveOrder={handleMoveOrder}
            />
          ))}
        </div>
      )}

      {/* Modal rendered via portal to escape animate-fade-in transform context */}
      {modalOpen && typeof document !== 'undefined' && createPortal(
        <LeadModal
          lead={editingLead}
          defaultStage={defaultStage}
          onSave={editingLead ? handleUpdate : handleCreate}
          onClose={() => setModalOpen(false)}
        />,
        document.body
      )}
    </div>
  )
}