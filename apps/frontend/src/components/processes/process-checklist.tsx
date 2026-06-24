'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp, Loader2,
  Paperclip, Trash2, Eye, Download, X, Calendar, Clock,
  MapPin, FileText, Lock, CheckSquare, Square, Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { processes as processesApi, type Process } from '@/lib/api'

// ─── Step type helpers ────────────────────────────────────────────────────────

const OBSERVATION_ONLY_STEPS = ['sent_analysis', 'in_queue', 'in_analysis', 'approved']

type StepDoc = { id: string; name: string; url: string; size: number; type: string; uploadedAt: string }
type StepMeta = {
  govPassword?: string
  schedulingDate?: string
  schedulingTime?: string
  schedulingLocation?: string
  certifications?: string[]
  addressOwner?: 'client' | 'third_party'
  addressDeclarationDoc?: { id: string; name: string; url: string } | null
  observations?: string
  documents?: StepDoc[]
}

function fileIcon(mimeType: string) {
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('image')) return '🖼️'
  return '📁'
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function weekday(dateStr: string) {
  if (!dateStr) return ''
  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  return days[new Date(dateStr + 'T12:00:00').getDay()]
}

// ─── Special step UIs ─────────────────────────────────────────────────────────

function GovPasswordField({ meta, onSave }: { meta: StepMeta; onSave: (m: Partial<StepMeta>) => void }) {
  const [value, setValue] = useState(meta.govPassword ?? '')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    onSave({ govPassword: value })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-3 pt-2">
      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5" /> SENHA GOV DO CLIENTE
      </label>
      <div className="flex gap-2">
        <input
          type="password"
          value={value}
          onChange={(e) => { setValue(e.target.value); setSaved(false) }}
          placeholder="Digite a senha GOV..."
          className="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
        <Button size="sm" onClick={handleSave} className="bg-[#0B2545] hover:bg-[#13315C] shrink-0">
          {saved ? '✓ Salvo' : 'Salvar'}
        </Button>
      </div>
      {meta.govPassword && (
        <p className="text-xs text-[#00C853]">✓ Senha registrada</p>
      )}
    </div>
  )
}

function ScheduleField({ meta, onSave }: { meta: StepMeta; onSave: (m: Partial<StepMeta>) => void }) {
  const [date, setDate] = useState(meta.schedulingDate ?? '')
  const [time, setTime] = useState(meta.schedulingTime ?? '')
  const [location, setLocation] = useState(meta.schedulingLocation ?? '')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    onSave({ schedulingDate: date, schedulingTime: time, schedulingLocation: location })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-3.5 h-3.5" /> DATA
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setSaved(false) }}
            className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
          {date && (
            <p className="text-xs text-muted-foreground mt-1">{weekday(date)}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
            <Clock className="w-3.5 h-3.5" /> HORÁRIO
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => { setTime(e.target.value); setSaved(false) }}
            className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
          <MapPin className="w-3.5 h-3.5" /> LOCAL
        </label>
        <input
          value={location}
          onChange={(e) => { setLocation(e.target.value); setSaved(false) }}
          placeholder="Ex: Clínica ABC — Rua das Flores, 123"
          className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
      </div>
      {date && time && location && (
        <div className="bg-[#134074]/10 border border-[#134074]/20 rounded-xl p-3 text-sm text-foreground">
          <span className="font-semibold">{weekday(date)}</span>, {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')} às {time} — {location}
        </div>
      )}
      <Button size="sm" onClick={handleSave} className="bg-[#0B2545] hover:bg-[#13315C]">
        {saved ? '✓ Salvo' : 'Salvar Agendamento'}
      </Button>
    </div>
  )
}

function CertificationsField({ meta, onSave }: { meta: StepMeta; onSave: (m: Partial<StepMeta>) => void }) {
  const opts = [
    { key: 'federal', label: 'Certidão Federal' },
    { key: 'estadual', label: 'Certidão Estadual' },
    { key: 'militar', label: 'Certidão Militar' },
    { key: 'eleitoral', label: 'Certidão Eleitoral' },
  ]
  const [selected, setSelected] = useState<string[]>(meta.certifications ?? [])

  function toggle(key: string) {
    const next = selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]
    setSelected(next)
    onSave({ certifications: next })
  }

  return (
    <div className="space-y-2 pt-2">
      <label className="text-xs font-semibold text-muted-foreground">CERTIDÕES NEGATIVAS</label>
      <div className="grid grid-cols-2 gap-2">
        {opts.map((opt) => {
          const checked = selected.includes(opt.key)
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => toggle(opt.key)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                checked
                  ? 'bg-[#00C853]/10 border-[#00C853]/40 text-[#00C853]'
                  : 'bg-muted border-border text-muted-foreground hover:border-border/80'
              }`}
            >
              {checked ? <CheckSquare className="w-4 h-4 shrink-0" /> : <Square className="w-4 h-4 shrink-0" />}
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AddressOwnerField({
  meta, onSave, processId, stepKey, onRefresh,
}: { meta: StepMeta; onSave: (m: Partial<StepMeta>) => void; processId: string; stepKey: string; onRefresh: () => void }) {
  const [owner, setOwner] = useState<'client' | 'third_party' | ''>(meta.addressOwner ?? '')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function selectOwner(val: 'client' | 'third_party') {
    setOwner(val)
    onSave({ addressOwner: val })
  }

  async function handleDeclUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const token = localStorage.getItem('accessToken')
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api/v1'
      const res = await fetch(`${apiUrl}/processes/${processId}/steps/${stepKey}/upload`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
        throw new Error(err.message || `HTTP ${res.status}`)
      }
      const data = await res.json()
      onSave({ addressDeclarationDoc: { id: data.id, name: data.name, url: data.url } })
      onRefresh()
    } catch (err) {
      alert(`Erro ao enviar arquivo: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3 pt-2">
      <label className="text-xs font-semibold text-muted-foreground">COMPROVANTE EM NOME DE</label>
      <div className="flex gap-2">
        {(['client', 'third_party'] as const).map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => selectOwner(val)}
            className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              owner === val
                ? 'bg-[#0B2545] border-[#0B2545] text-white'
                : 'bg-muted border-border text-muted-foreground hover:border-[#0B2545]/40'
            }`}
          >
            {val === 'client' ? 'Do Próprio Cliente' : 'De Terceiro'}
          </button>
        ))}
      </div>

      {owner === 'third_party' && (
        <div className="bg-[#FFAB00]/10 border border-[#FFAB00]/30 rounded-xl p-3 space-y-2">
          <p className="text-xs font-semibold text-[#FFAB00]">⚠️ Declaração de endereço assinada necessária</p>
          {meta.addressDeclarationDoc ? (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-[#00C853]" />
              <span className="flex-1 truncate text-foreground">{meta.addressDeclarationDoc.name}</span>
              <a href={meta.addressDeclarationDoc.url} target="_blank" rel="noreferrer" className="text-[#3E92CC] hover:underline text-xs">Ver</a>
            </div>
          ) : (
            <>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="hidden" onChange={handleDeclUpload} />
              <Button size="sm" variant="outline" className="w-full gap-2 border-[#FFAB00]/40 text-[#FFAB00]"
                onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Anexar declaração assinada
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ObservationField({ meta, onSave }: { meta: StepMeta; onSave: (m: Partial<StepMeta>) => void }) {
  const [text, setText] = useState(meta.observations ?? '')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    onSave({ observations: text })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-2 pt-2">
      <label className="text-xs font-semibold text-muted-foreground">OBSERVAÇÃO</label>
      <textarea
        rows={3}
        value={text}
        onChange={(e) => { setText(e.target.value); setSaved(false) }}
        placeholder="Adicione uma observação sobre esta etapa..."
        className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-ring/20"
      />
      <Button size="sm" onClick={handleSave} className="bg-[#0B2545] hover:bg-[#13315C]">
        {saved ? '✓ Salvo' : 'Salvar'}
      </Button>
    </div>
  )
}

function DocumentUploader({
  meta, processId, stepKey, onRefresh,
}: { meta: StepMeta; processId: string; stepKey: string; onRefresh: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api/v1'

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`${apiUrl}/processes/${processId}/steps/${stepKey}/upload`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
        throw new Error(err.message || `HTTP ${res.status}`)
      }
      onRefresh()
    } catch (err) {
      alert(`Erro ao enviar arquivo: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete(fileId: string) {
    if (!confirm('Excluir este arquivo?')) return
    setDeleting(fileId)
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`${apiUrl}/processes/${processId}/steps/${stepKey}/files/${fileId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      })
      onRefresh()
    } catch {
      alert('Erro ao excluir arquivo')
    } finally {
      setDeleting(null)
    }
  }

  const docs = meta.documents ?? []

  return (
    <div className="space-y-3 pt-2">
      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
        <Paperclip className="w-3.5 h-3.5" /> DOCUMENTOS ANEXADOS
      </label>

      {docs.length > 0 && (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
              <span className="text-base leading-none">{fileIcon(doc.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(doc.size)} · {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a href={doc.url} target="_blank" rel="noreferrer"
                  className="w-7 h-7 rounded-lg bg-[#3E92CC]/10 text-[#3E92CC] flex items-center justify-center hover:bg-[#3E92CC]/20 transition-colors"
                  title="Ver documento">
                  <Eye className="w-3.5 h-3.5" />
                </a>
                <a href={doc.url} download={doc.name}
                  className="w-7 h-7 rounded-lg bg-[#00C853]/10 text-[#00C853] flex items-center justify-center hover:bg-[#00C853]/20 transition-colors"
                  title="Baixar documento">
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deleting === doc.id}
                  className="w-7 h-7 rounded-lg bg-[#D50000]/10 text-[#D50000] flex items-center justify-center hover:bg-[#D50000]/20 transition-colors disabled:opacity-50"
                  title="Excluir documento">
                  {deleting === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        className="hidden"
        onChange={handleUpload}
      />
      <Button
        size="sm"
        variant="outline"
        className="w-full gap-2 border-dashed"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uploading ? 'Enviando...' : 'Anexar documento (PDF, Word, PNG, JPEG)'}
      </Button>
    </div>
  )
}

// ─── Step row ─────────────────────────────────────────────────────────────────

function StepRow({
  step, index, processId, onToggle, onMetaSave, onRefresh,
}: {
  step: { stepKey: string; stepName: string; isCompleted: boolean; order: number; metadata?: StepMeta }
  index: number
  processId: string
  onToggle: (stepKey: string, current: boolean) => Promise<void>
  onMetaSave: (stepKey: string, patch: Partial<StepMeta>) => Promise<void>
  onRefresh: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [toggling, setToggling] = useState(false)
  const meta: StepMeta = (step.metadata as StepMeta) ?? {}
  const isObsOnly = OBSERVATION_ONLY_STEPS.includes(step.stepKey)

  async function handleToggle(e: React.MouseEvent) {
    e.stopPropagation()
    setToggling(true)
    try { await onToggle(step.stepKey, step.isCompleted) }
    finally { setToggling(false) }
  }

  function renderSpecialContent() {
    if (step.stepKey === 'gov_password') {
      return <GovPasswordField meta={meta} onSave={(patch) => onMetaSave(step.stepKey, patch)} />
    }
    if (step.stepKey === 'psych_schedule' || step.stepKey === 'shooting_schedule') {
      return <ScheduleField meta={meta} onSave={(patch) => onMetaSave(step.stepKey, patch)} />
    }
    if (step.stepKey === 'certifications') {
      return <CertificationsField meta={meta} onSave={(patch) => onMetaSave(step.stepKey, patch)} />
    }
    if (step.stepKey === 'proof_address') {
      return (
        <>
          <AddressOwnerField
            meta={meta}
            onSave={(patch) => onMetaSave(step.stepKey, patch)}
            processId={processId}
            stepKey={step.stepKey}
            onRefresh={onRefresh}
          />
          <DocumentUploader meta={meta} processId={processId} stepKey={step.stepKey} onRefresh={onRefresh} />
        </>
      )
    }
    if (isObsOnly) {
      return <ObservationField meta={meta} onSave={(patch) => onMetaSave(step.stepKey, patch)} />
    }
    return <DocumentUploader meta={meta} processId={processId} stepKey={step.stepKey} onRefresh={onRefresh} />
  }

  const hasContent = meta.documents?.length || meta.govPassword || meta.schedulingDate ||
    meta.certifications?.length || meta.addressOwner || meta.observations || meta.addressDeclarationDoc

  return (
    <div className={`border-b border-border last:border-0 transition-colors ${step.isCompleted ? 'bg-[#00C853]/5' : ''}`}>
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Toggle checkbox */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded transition-all ${
            toggling ? 'opacity-50' : 'hover:scale-110'
          }`}
          title={step.isCompleted ? 'Desmarcar etapa' : 'Marcar como concluída'}
        >
          {toggling ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : step.isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-[#00C853]" />
          ) : (
            <Circle className="w-5 h-5 text-border" />
          )}
        </button>

        {/* Step name */}
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-medium ${step.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
            {index + 1}. {step.stepName}
          </span>
          {hasContent && !expanded && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {meta.documents?.length ? `${meta.documents.length} arquivo(s) anexado(s)` : ''}
              {meta.schedulingDate ? `Agendado: ${new Date(meta.schedulingDate + 'T12:00:00').toLocaleDateString('pt-BR')}` : ''}
              {meta.govPassword ? 'Senha registrada' : ''}
              {meta.certifications?.length ? `${meta.certifications.length}/4 certidões` : ''}
              {meta.addressOwner ? (meta.addressOwner === 'client' ? 'Em nome do cliente' : 'Em nome de terceiro') : ''}
              {meta.observations && !meta.schedulingDate && !meta.documents?.length ? 'Com observação' : ''}
            </p>
          )}
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 shrink-0">
          {!step.isCompleted && (
            <span className="text-xs text-[#D50000] font-medium bg-[#D50000]/10 px-2 py-0.5 rounded-full">
              Pendente
            </span>
          )}
          {step.isCompleted && (
            <span className="text-xs text-[#00C853] font-medium">✓</span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-border/50 bg-muted/10">
          {renderSpecialContent()}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProcessChecklist({ process, onUpdate }: { process: Process; onUpdate?: () => void }) {
  const [steps, setSteps] = useState(
    (process.steps ?? []).map((s) => ({ ...s, metadata: (s as any).metadata ?? {} }))
  )

  useEffect(() => {
    setSteps((process.steps ?? []).map((s) => ({ ...s, metadata: (s as any).metadata ?? {} })))
  }, [process.steps])
  const [showAll, setShowAll] = useState(false)

  const completed = steps.filter((s) => s.isCompleted).length
  const progress = steps.length ? Math.round((completed / steps.length) * 100) : 0
  const visibleSteps = showAll ? steps : steps.slice(0, 10)

  const handleToggle = useCallback(async (stepKey: string, current: boolean) => {
    try {
      if (current) {
        await processesApi.uncompleteStep(process.id, stepKey)
        setSteps((prev) => prev.map((s) => s.stepKey === stepKey ? { ...s, isCompleted: false } : s))
      } else {
        await processesApi.completeStep(process.id, stepKey)
        setSteps((prev) => prev.map((s) => s.stepKey === stepKey ? { ...s, isCompleted: true } : s))
      }
      onUpdate?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar etapa')
    }
  }, [process.id, onUpdate])

  const handleMetaSave = useCallback(async (stepKey: string, patch: Partial<any>) => {
    try {
      const step = steps.find((s) => s.stepKey === stepKey)
      const newMeta = { ...(step?.metadata ?? {}), ...patch }
      await processesApi.updateStepMetadata(process.id, stepKey, newMeta)
      setSteps((prev) => prev.map((s) => s.stepKey === stepKey ? { ...s, metadata: newMeta } : s))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar')
    }
  }, [process.id, steps])

  const handleRefresh = useCallback(() => {
    onUpdate?.()
  }, [onUpdate])

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="bg-gradient-to-r from-[#0B2545] to-[#134074] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">Processo {process.type}</h3>
            <p className="text-white/60 text-sm">Iniciado em {new Date(process.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-extrabold text-[#3E92CC]">{progress}%</div>
            <div className="text-white/60 text-xs">{completed}/{steps.length} etapas</div>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div className="bg-gradient-to-r from-[#3E92CC] to-[#00C853] h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-xs text-white/40 mt-2">
          <span>Início</span>
          <span>Conclusão</span>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground">Checklist do Processo</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
            {steps.filter((s) => !s.isCompleted).length} pendentes
          </span>
        </div>

        <div>
          {visibleSteps.map((step, i) => (
            <StepRow
              key={step.stepKey}
              step={step}
              index={i}
              processId={process.id}
              onToggle={handleToggle}
              onMetaSave={handleMetaSave}
              onRefresh={handleRefresh}
            />
          ))}
        </div>

        {steps.length > 10 && (
          <div className="p-4 border-t border-border">
            <Button variant="ghost" className="w-full text-sm gap-2" onClick={() => setShowAll(!showAll)}>
              {showAll
                ? <><ChevronUp className="w-4 h-4" /> Mostrar menos</>
                : <><ChevronDown className="w-4 h-4" /> Ver todas as {steps.length} etapas</>
              }
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
