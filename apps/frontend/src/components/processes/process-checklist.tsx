'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp, Loader2,
  Paperclip, Trash2, Eye, EyeOff, Download, X, Calendar, Clock,
  MapPin, FileText, Lock, CheckSquare, Square, Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { processes as processesApi, type Process } from '@/lib/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const OBSERVATION_ONLY_STEPS: string[] = []

const INCOME_TYPES = [
  { key: 'cnpj', label: 'CNPJ' },
  { key: 'mei', label: 'MEI' },
  { key: 'clt', label: 'Carteira de Trabalho' },
  { key: 'aposentadoria', label: 'Aposentadoria' },
  { key: 'pensao', label: 'Pensão' },
  { key: 'informal', label: 'Renda Informal' },
  { key: 'outro', label: 'Outro' },
]

const CERT_OPTS = [
  { key: 'federal', label: 'Certidão Federal' },
  { key: 'estadual', label: 'Certidão Estadual' },
  { key: 'militar', label: 'Certidão Militar' },
  { key: 'eleitoral', label: 'Certidão Eleitoral' },
]

// ─── Types ────────────────────────────────────────────────────────────────────

type StepDoc = { id: string; name: string; url: string; size: number; type: string; uploadedAt: string }
type CertDoc = { id: string; name: string; url: string }
type StepMeta = {
  govPassword?: string
  schedulingDate?: string; schedulingTime?: string; schedulingLocation?: string
  certifications?: string[]
  certificationDocs?: Record<string, CertDoc | undefined>
  addressOwner?: 'client' | 'third_party'
  addressDeclarationDoc?: CertDoc | null
  incomeType?: string
  observations?: string
  sentAnalysisDate?: string
  documents?: StepDoc[]
  // CRAF
  weaponType?: string; weaponModel?: string; weaponCaliber?: string; weaponBrand?: string
  storeName?: string; storeCnpj?: string
  // Datas de status
  gruDate?: string
  queueDate?: string
  analysisDate?: string
  deferralDate?: string
}

// ─── Utilities ────────────────────────────────────────────────────────────────

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

function getApiUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || 'https://controle-belico-production.up.railway.app') + '/api/v1'
}

function uploadWithProgress(
  url: string, token: string, file: File, onProgress: (pct: number) => void,
): Promise<{ id: string; name: string; url: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    })
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        try { reject(new Error(JSON.parse(xhr.responseText).message || `HTTP ${xhr.status}`)) }
        catch { reject(new Error(`HTTP ${xhr.status}`)) }
      }
    })
    xhr.addEventListener('error', () => reject(new Error('Erro de rede')))
    const fd = new FormData()
    fd.append('file', file)
    xhr.open('POST', url)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.send(fd)
  })
}

// ─── Upload progress bar ──────────────────────────────────────────────────────

function UploadProgressBar({ progress }: { progress: number }) {
  return (
    <div className="space-y-1 py-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Carregando documento...</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-gradient-to-r from-[#3E92CC] to-[#00C853] h-2 rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// ─── WeaponChoiceField ────────────────────────────────────────────────────────

function WeaponChoiceField({ meta, onSave }: { meta: StepMeta; onSave: (m: Partial<StepMeta>) => void }) {
  const [type, setType] = useState(meta.weaponType ?? '')
  const [model, setModel] = useState(meta.weaponModel ?? '')
  const [caliber, setCaliber] = useState(meta.weaponCaliber ?? '')
  const [brand, setBrand] = useState(meta.weaponBrand ?? '')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    onSave({ weaponType: type, weaponModel: model, weaponCaliber: caliber, weaponBrand: brand })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputCls = 'w-full px-3 py-2 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20'

  return (
    <div className="space-y-3 pt-2">
      <label className="text-xs font-semibold text-muted-foreground">DADOS DA ARMA</label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
          <input value={type} onChange={(e) => { setType(e.target.value); setSaved(false) }}
            placeholder="Ex: Pistola" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Marca</label>
          <input value={brand} onChange={(e) => { setBrand(e.target.value); setSaved(false) }}
            placeholder="Ex: Taurus" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Modelo</label>
          <input value={model} onChange={(e) => { setModel(e.target.value); setSaved(false) }}
            placeholder="Ex: G2c" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Calibre</label>
          <input value={caliber} onChange={(e) => { setCaliber(e.target.value); setSaved(false) }}
            placeholder="Ex: .380" className={inputCls} />
        </div>
      </div>
      {meta.weaponType && (
        <div className="bg-[#0B2545]/5 border border-[#0B2545]/20 rounded-xl px-3 py-2 text-sm text-foreground">
          <span className="font-semibold">{meta.weaponBrand} {meta.weaponModel}</span>
          {meta.weaponType ? ` · ${meta.weaponType}` : ''}
          {meta.weaponCaliber ? ` · Cal. ${meta.weaponCaliber}` : ''}
        </div>
      )}
      <Button size="sm" onClick={handleSave} className="bg-[#0B2545] hover:bg-[#13315C]">
        {saved ? '✓ Salvo' : 'Salvar'}
      </Button>
    </div>
  )
}

// ─── StoreChoiceField ─────────────────────────────────────────────────────────

function StoreChoiceField({ meta, onSave }: { meta: StepMeta; onSave: (m: Partial<StepMeta>) => void }) {
  const [name, setName] = useState(meta.storeName ?? '')
  const [cnpj, setCnpj] = useState(meta.storeCnpj ?? '')
  const [saved, setSaved] = useState(false)

  function formatCnpj(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 14)
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  function handleSave() {
    onSave({ storeName: name, storeCnpj: cnpj })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputCls = 'w-full px-3 py-2 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20'

  return (
    <div className="space-y-3 pt-2">
      <label className="text-xs font-semibold text-muted-foreground">DADOS DA LOJA</label>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Nome da Loja</label>
        <input value={name} onChange={(e) => { setName(e.target.value); setSaved(false) }}
          placeholder="Ex: Armas & Munições LTDA" className={inputCls} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">CNPJ da Loja</label>
        <input value={cnpj}
          onChange={(e) => { setCnpj(formatCnpj(e.target.value)); setSaved(false) }}
          placeholder="00.000.000/0000-00" className={inputCls} />
      </div>
      {meta.storeName && (
        <div className="bg-[#0B2545]/5 border border-[#0B2545]/20 rounded-xl px-3 py-2 text-sm text-foreground">
          <span className="font-semibold">{meta.storeName}</span>
          {meta.storeCnpj ? <span className="text-muted-foreground"> · CNPJ: {meta.storeCnpj}</span> : ''}
        </div>
      )}
      <Button size="sm" onClick={handleSave} className="bg-[#0B2545] hover:bg-[#13315C]">
        {saved ? '✓ Salvo' : 'Salvar'}
      </Button>
    </div>
  )
}

// ─── GovPasswordField ─────────────────────────────────────────────────────────

function GovPasswordField({ meta, onSave }: { meta: StepMeta; onSave: (m: Partial<StepMeta>) => void }) {
  const [value, setValue] = useState(meta.govPassword ?? '')
  const [saved, setSaved] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

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
        <div className="relative flex-1">
          <input
            type={showPwd ? 'text' : 'password'}
            value={value}
            onChange={(e) => { setValue(e.target.value); setSaved(false) }}
            placeholder="Digite a senha GOV..."
            className="w-full px-3 py-2 pr-9 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <Button size="sm" onClick={handleSave} className="bg-[#0B2545] hover:bg-[#13315C] shrink-0">
          {saved ? '✓ Salvo' : 'Salvar'}
        </Button>
      </div>
      {meta.govPassword && (
        <div className="flex items-center gap-2 bg-[#00C853]/10 border border-[#00C853]/20 rounded-xl px-3 py-2">
          <Lock className="w-3.5 h-3.5 text-[#00C853] shrink-0" />
          <span className="text-xs text-[#00C853] font-medium shrink-0">Senha registrada:</span>
          <span className="text-xs font-mono text-foreground">
            {showPwd ? meta.govPassword : '•'.repeat(meta.govPassword.length)}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── ScheduleField ────────────────────────────────────────────────────────────

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
          {date && <p className="text-xs text-muted-foreground mt-1">{weekday(date)}</p>}
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

// ─── CertificationsField ──────────────────────────────────────────────────────

function CertificationsField({
  meta, onSave, processId, stepKey, onRefresh,
}: { meta: StepMeta; onSave: (m: Partial<StepMeta>) => void; processId: string; stepKey: string; onRefresh: () => void }) {
  const [selected, setSelected] = useState<string[]>(meta.certifications ?? [])
  const [uploading, setUploading] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  function toggle(key: string) {
    const next = selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]
    setSelected(next)
    onSave({ certifications: next })
  }

  async function handleCertUpload(e: React.ChangeEvent<HTMLInputElement>, certKey: string) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(certKey)
    setProgress(0)
    try {
      const token = localStorage.getItem('accessToken')
      const result = await uploadWithProgress(
        `${getApiUrl()}/processes/${processId}/steps/${stepKey}/upload`,
        token!, file, setProgress,
      )
      onSave({ certificationDocs: { ...(meta.certificationDocs ?? {}), [certKey]: { id: result.id, name: result.name, url: result.url } } })
      onRefresh()
    } catch (err) {
      alert(`Erro ao enviar: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setUploading(null)
      const ref = fileRefs.current[certKey]
      if (ref) ref.value = ''
    }
  }

  function removeCertDoc(certKey: string) {
    const updated = { ...(meta.certificationDocs ?? {}), [certKey]: undefined }
    onSave({ certificationDocs: updated })
  }

  return (
    <div className="space-y-3 pt-2">
      <label className="text-xs font-semibold text-muted-foreground">CERTIDÕES NEGATIVAS</label>
      <div className="space-y-2">
        {CERT_OPTS.map((opt) => {
          const checked = selected.includes(opt.key)
          const certDoc = meta.certificationDocs?.[opt.key]
          const isUploading = uploading === opt.key
          return (
            <div key={opt.key} className={`rounded-xl border transition-all ${checked ? 'border-[#00C853]/30 bg-[#00C853]/5' : 'border-border bg-muted'}`}>
              <div className="flex items-center gap-2 px-3 py-2.5">
                <button type="button" onClick={() => toggle(opt.key)} className="flex items-center gap-2 flex-1 text-sm font-medium text-left">
                  {checked
                    ? <CheckSquare className="w-4 h-4 text-[#00C853] shrink-0" />
                    : <Square className="w-4 h-4 text-muted-foreground shrink-0" />}
                  <span className={checked ? 'text-foreground' : 'text-muted-foreground'}>{opt.label}</span>
                </button>

                {checked && !certDoc && (
                  <>
                    <input
                      ref={(el) => { fileRefs.current[opt.key] = el }}
                      type="file" accept=".pdf" className="hidden"
                      onChange={(e) => handleCertUpload(e, opt.key)}
                    />
                    <Button size="sm" variant="outline"
                      className="text-xs h-7 px-2 border-[#3E92CC]/30 text-[#3E92CC] shrink-0"
                      onClick={() => fileRefs.current[opt.key]?.click()}
                      disabled={isUploading}
                    >
                      {isUploading
                        ? <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        : <Paperclip className="w-3 h-3 mr-1" />}
                      {isUploading ? `${progress}%` : 'PDF'}
                    </Button>
                  </>
                )}

                {checked && certDoc && (
                  <div className="flex items-center gap-1 shrink-0">
                    <a href={certDoc.url} target="_blank" rel="noreferrer"
                      className="w-6 h-6 rounded bg-[#3E92CC]/10 text-[#3E92CC] flex items-center justify-center hover:bg-[#3E92CC]/20" title="Ver">
                      <Eye className="w-3 h-3" />
                    </a>
                    <a href={certDoc.url} download={certDoc.name}
                      className="w-6 h-6 rounded bg-[#00C853]/10 text-[#00C853] flex items-center justify-center hover:bg-[#00C853]/20" title="Baixar">
                      <Download className="w-3 h-3" />
                    </a>
                    <button onClick={() => removeCertDoc(opt.key)}
                      className="w-6 h-6 rounded bg-[#D50000]/10 text-[#D50000] flex items-center justify-center hover:bg-[#D50000]/20" title="Remover">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="px-3 pb-2">
                  <UploadProgressBar progress={progress} />
                </div>
              )}
              {checked && certDoc && (
                <div className="px-3 pb-2">
                  <p className="text-xs text-[#00C853] truncate">📄 {certDoc.name}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── AddressOwnerField ────────────────────────────────────────────────────────

function AddressOwnerField({
  meta, onSave, processId, stepKey, onRefresh,
}: { meta: StepMeta; onSave: (m: Partial<StepMeta>) => void; processId: string; stepKey: string; onRefresh: () => void }) {
  const [owner, setOwner] = useState<'client' | 'third_party' | ''>(meta.addressOwner ?? '')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  function selectOwner(val: 'client' | 'third_party') {
    setOwner(val)
    onSave({ addressOwner: val })
  }

  async function handleDeclUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setProgress(0)
    try {
      const token = localStorage.getItem('accessToken')
      const data = await uploadWithProgress(
        `${getApiUrl()}/processes/${processId}/steps/${stepKey}/upload`,
        token!, file, setProgress,
      )
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
          <button key={val} type="button" onClick={() => selectOwner(val)}
            className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              owner === val ? 'bg-[#0B2545] border-[#0B2545] text-white' : 'bg-muted border-border text-muted-foreground hover:border-[#0B2545]/40'
            }`}>
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
              {uploading
                ? <UploadProgressBar progress={progress} />
                : (
                  <Button size="sm" variant="outline" className="w-full gap-2 border-[#FFAB00]/40 text-[#FFAB00]"
                    onClick={() => fileRef.current?.click()}>
                    <Upload className="w-4 h-4" /> Anexar declaração assinada
                  </Button>
                )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── ProofOfIncomeField ───────────────────────────────────────────────────────

function ProofOfIncomeField({
  meta, onSave, processId, stepKey, onRefresh,
}: { meta: StepMeta; onSave: (m: Partial<StepMeta>) => void; processId: string; stepKey: string; onRefresh: () => void }) {
  return (
    <div className="space-y-4 pt-2">
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">TIPO DE COMPROVANTE DE RENDA</label>
        <div className="grid grid-cols-2 gap-2">
          {INCOME_TYPES.map((t) => (
            <button key={t.key} type="button" onClick={() => onSave({ incomeType: t.key })}
              className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                meta.incomeType === t.key
                  ? 'bg-[#0B2545] border-[#0B2545] text-white'
                  : 'bg-muted border-border text-muted-foreground hover:border-[#0B2545]/40'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        {meta.incomeType && (
          <p className="text-xs text-[#00C853] mt-2">
            ✓ Tipo selecionado: {INCOME_TYPES.find((t) => t.key === meta.incomeType)?.label}
          </p>
        )}
      </div>
      <DocumentUploader meta={meta} processId={processId} stepKey={stepKey} onRefresh={onRefresh} />
    </div>
  )
}

// ─── ObservationField ─────────────────────────────────────────────────────────

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
      <textarea rows={3} value={text}
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

// ─── DateObservationField (reutilizável) ─────────────────────────────────────

function DateObservationField({
  meta, onSave, dateKey, dateLabel,
}: {
  meta: StepMeta
  onSave: (m: Partial<StepMeta>) => void
  dateKey: keyof StepMeta
  dateLabel: string
}) {
  const [date, setDate] = useState((meta[dateKey] as string) ?? '')
  const [text, setText] = useState(meta.observations ?? '')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    onSave({ [dateKey]: date, observations: text } as Partial<StepMeta>)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-3 pt-2">
      <div>
        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
          <Calendar className="w-3.5 h-3.5" /> {dateLabel.toUpperCase()}
        </label>
        <input type="date" value={date}
          onChange={(e) => { setDate(e.target.value); setSaved(false) }}
          className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
        {date && (
          <p className="text-xs text-muted-foreground mt-1">
            {weekday(date)}, {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">OBSERVAÇÃO</label>
        <textarea rows={3} value={text}
          onChange={(e) => { setText(e.target.value); setSaved(false) }}
          placeholder="Adicione uma observação..."
          className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
      </div>
      <Button size="sm" onClick={handleSave} className="bg-[#0B2545] hover:bg-[#13315C]">
        {saved ? '✓ Salvo' : 'Salvar'}
      </Button>
    </div>
  )
}

// ─── GruField ─────────────────────────────────────────────────────────────────

function GruField({
  meta, onSave, processId, stepKey, onRefresh,
}: { meta: StepMeta; onSave: (m: Partial<StepMeta>) => void; processId: string; stepKey: string; onRefresh: () => void }) {
  const [date, setDate] = useState(meta.gruDate ?? '')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    onSave({ gruDate: date })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-3 pt-2">
      <div>
        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
          <Calendar className="w-3.5 h-3.5" /> DATA DE PAGAMENTO DA GRU
        </label>
        <div className="flex gap-2">
          <input type="date" value={date}
            onChange={(e) => { setDate(e.target.value); setSaved(false) }}
            className="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
          <Button size="sm" onClick={handleSave} className="bg-[#0B2545] hover:bg-[#13315C] shrink-0">
            {saved ? '✓ Salvo' : 'Salvar'}
          </Button>
        </div>
        {date && (
          <p className="text-xs text-muted-foreground mt-1">
            {weekday(date)}, {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
      <DocumentUploader meta={meta} processId={processId} stepKey={stepKey} onRefresh={onRefresh} />
    </div>
  )
}

// ─── SentAnalysisField ────────────────────────────────────────────────────────

function SentAnalysisField({ meta, onSave }: { meta: StepMeta; onSave: (m: Partial<StepMeta>) => void }) {
  const [date, setDate] = useState(meta.sentAnalysisDate ?? '')
  const [text, setText] = useState(meta.observations ?? '')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    onSave({ sentAnalysisDate: date, observations: text })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-3 pt-2">
      <div>
        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
          <Calendar className="w-3.5 h-3.5" /> DATA DE ENVIO PARA ANÁLISE
        </label>
        <input type="date" value={date}
          onChange={(e) => { setDate(e.target.value); setSaved(false) }}
          className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
        {date && (
          <p className="text-xs text-muted-foreground mt-1">
            {weekday(date)}, {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">OBSERVAÇÃO</label>
        <textarea rows={3} value={text}
          onChange={(e) => { setText(e.target.value); setSaved(false) }}
          placeholder="Adicione uma observação..."
          className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
      </div>
      <Button size="sm" onClick={handleSave} className="bg-[#0B2545] hover:bg-[#13315C]">
        {saved ? '✓ Salvo' : 'Salvar'}
      </Button>
    </div>
  )
}

// ─── DocumentUploader ─────────────────────────────────────────────────────────

function DocumentUploader({
  meta, processId, stepKey, onRefresh,
}: { meta: StepMeta; processId: string; stepKey: string; onRefresh: () => void }) {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setProgress(0)
    try {
      const token = localStorage.getItem('accessToken')
      await uploadWithProgress(
        `${getApiUrl()}/processes/${processId}/steps/${stepKey}/upload`,
        token!, file, setProgress,
      )
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
      await fetch(`${getApiUrl()}/processes/${processId}/steps/${stepKey}/files/${fileId}`, {
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
                  className="w-7 h-7 rounded-lg bg-[#3E92CC]/10 text-[#3E92CC] flex items-center justify-center hover:bg-[#3E92CC]/20" title="Ver">
                  <Eye className="w-3.5 h-3.5" />
                </a>
                <a href={doc.url} download={doc.name}
                  className="w-7 h-7 rounded-lg bg-[#00C853]/10 text-[#00C853] flex items-center justify-center hover:bg-[#00C853]/20" title="Baixar">
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button onClick={() => handleDelete(doc.id)} disabled={deleting === doc.id}
                  className="w-7 h-7 rounded-lg bg-[#D50000]/10 text-[#D50000] flex items-center justify-center hover:bg-[#D50000]/20 disabled:opacity-50" title="Excluir">
                  {deleting === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="hidden" onChange={handleUpload} />

      {uploading
        ? <UploadProgressBar progress={progress} />
        : (
          <Button size="sm" variant="outline" className="w-full gap-2 border-dashed"
            onClick={() => fileRef.current?.click()}>
            <Upload className="w-4 h-4" /> Anexar documento (PDF, Word, PNG, JPEG)
          </Button>
        )}
    </div>
  )
}

// ─── StepRow ──────────────────────────────────────────────────────────────────

function StepRow({
  step, index, processId, onToggle, onMetaSave, onRefresh,
}: {
  step: { stepKey: string; stepName: string; isCompleted: boolean; order: number; metadata?: StepMeta }
  index: number; processId: string
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
    if (step.stepKey === 'weapon_choice') {
      return <WeaponChoiceField meta={meta} onSave={(patch) => onMetaSave(step.stepKey, patch)} />
    }
    if (step.stepKey === 'store_choice') {
      return <StoreChoiceField meta={meta} onSave={(patch) => onMetaSave(step.stepKey, patch)} />
    }
    if (step.stepKey === 'gov_password') {
      return <GovPasswordField meta={meta} onSave={(patch) => onMetaSave(step.stepKey, patch)} />
    }
    if (step.stepKey === 'psych_schedule' || step.stepKey === 'shooting_schedule') {
      return <ScheduleField meta={meta} onSave={(patch) => onMetaSave(step.stepKey, patch)} />
    }
    if (step.stepKey === 'certifications') {
      return <CertificationsField meta={meta} onSave={(patch) => onMetaSave(step.stepKey, patch)} processId={processId} stepKey={step.stepKey} onRefresh={onRefresh} />
    }
    if (step.stepKey === 'proof_income') {
      return <ProofOfIncomeField meta={meta} onSave={(patch) => onMetaSave(step.stepKey, patch)} processId={processId} stepKey={step.stepKey} onRefresh={onRefresh} />
    }
    if (step.stepKey === 'proof_address') {
      return (
        <>
          <AddressOwnerField meta={meta} onSave={(patch) => onMetaSave(step.stepKey, patch)} processId={processId} stepKey={step.stepKey} onRefresh={onRefresh} />
          <DocumentUploader meta={meta} processId={processId} stepKey={step.stepKey} onRefresh={onRefresh} />
        </>
      )
    }
    if (step.stepKey === 'sent_analysis') {
      return <SentAnalysisField meta={meta} onSave={(patch) => onMetaSave(step.stepKey, patch)} />
    }
    if (step.stepKey === 'gru') {
      return <GruField meta={meta} onSave={(patch) => onMetaSave(step.stepKey, patch)} processId={processId} stepKey={step.stepKey} onRefresh={onRefresh} />
    }
    if (step.stepKey === 'in_queue') {
      return <DateObservationField meta={meta} onSave={(patch) => onMetaSave(step.stepKey, patch)} dateKey="queueDate" dateLabel="Data de entrada em fila" />
    }
    if (step.stepKey === 'in_analysis') {
      return <DateObservationField meta={meta} onSave={(patch) => onMetaSave(step.stepKey, patch)} dateKey="analysisDate" dateLabel="Data de entrada em análise" />
    }
    if (step.stepKey === 'approved') {
      return <DateObservationField meta={meta} onSave={(patch) => onMetaSave(step.stepKey, patch)} dateKey="deferralDate" dateLabel="Data de deferimento" />
    }
    if (isObsOnly) {
      return <ObservationField meta={meta} onSave={(patch) => onMetaSave(step.stepKey, patch)} />
    }
    return <DocumentUploader meta={meta} processId={processId} stepKey={step.stepKey} onRefresh={onRefresh} />
  }

  const hasContent = meta.documents?.length || meta.govPassword || meta.schedulingDate ||
    meta.certifications?.length || meta.addressOwner || meta.observations || meta.addressDeclarationDoc ||
    meta.incomeType || meta.sentAnalysisDate

  return (
    <div className={`border-b border-border last:border-0 transition-colors ${step.isCompleted ? 'bg-[#00C853]/5' : ''}`}>
      <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded(!expanded)}>
        <button onClick={handleToggle} disabled={toggling}
          className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded transition-all ${toggling ? 'opacity-50' : 'hover:scale-110'}`}
          title={step.isCompleted ? 'Desmarcar etapa' : 'Marcar como concluída'}>
          {toggling
            ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            : step.isCompleted
              ? <CheckCircle2 className="w-5 h-5 text-[#00C853]" />
              : <Circle className="w-5 h-5 text-border" />}
        </button>

        <div className="flex-1 min-w-0">
          <span className={`text-sm font-medium ${step.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
            {index + 1}. {step.stepName}
          </span>
          {hasContent && !expanded && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {meta.documents?.length ? `${meta.documents.length} arquivo(s) · ` : ''}
              {meta.schedulingDate ? `Agendado: ${new Date(meta.schedulingDate + 'T12:00:00').toLocaleDateString('pt-BR')} · ` : ''}
              {meta.sentAnalysisDate ? `Enviado: ${new Date(meta.sentAnalysisDate + 'T12:00:00').toLocaleDateString('pt-BR')} · ` : ''}
              {meta.govPassword ? 'Senha GOV registrada · ' : ''}
              {meta.certifications?.length ? `${meta.certifications.length}/4 certidões · ` : ''}
              {meta.incomeType ? `${INCOME_TYPES.find((t) => t.key === meta.incomeType)?.label} · ` : ''}
              {meta.addressOwner ? (meta.addressOwner === 'client' ? 'Em nome do cliente' : 'Em nome de terceiro') : ''}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!step.isCompleted && (
            <span className="text-xs text-[#D50000] font-medium bg-[#D50000]/10 px-2 py-0.5 rounded-full">Pendente</span>
          )}
          {step.isCompleted && <span className="text-xs text-[#00C853] font-medium">✓</span>}
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border/50 bg-muted/10">
          {renderSpecialContent()}
        </div>
      )}
    </div>
  )
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function normalizeSteps(raw: Process['steps']) {
  return (raw ?? [])
    .map((s) => ({ ...s, metadata: (s as any).metadata ?? {} }))
    .sort((a, b) => a.order - b.order)
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProcessChecklist({ process, onUpdate }: { process: Process; onUpdate?: () => void }) {
  const [steps, setSteps] = useState(() => normalizeSteps(process.steps))
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    setSteps(normalizeSteps(process.steps))
  }, [process.steps])

  const completed = steps.filter((s) => s.isCompleted).length
  const progress = steps.length ? Math.round((completed / steps.length) * 100) : 0
  // Mostra todas se concluído ou se usuário clicou em "ver todas"
  const visibleSteps = (showAll || progress === 100) ? steps : steps.slice(0, 10)

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

  const handleMetaSave = useCallback(async (stepKey: string, patch: Partial<StepMeta>) => {
    try {
      const step = steps.find((s) => s.stepKey === stepKey)
      const newMeta = { ...(step?.metadata ?? {}), ...patch }
      // deep merge certificationDocs
      if (patch.certificationDocs && (step?.metadata as StepMeta)?.certificationDocs) {
        newMeta.certificationDocs = { ...(step!.metadata as StepMeta).certificationDocs, ...patch.certificationDocs }
      }
      await processesApi.updateStepMetadata(process.id, stepKey, newMeta)
      setSteps((prev) => prev.map((s) => s.stepKey === stepKey ? { ...s, metadata: newMeta } : s))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar')
    }
  }, [process.id, steps])

  const handleRefresh = useCallback(() => { onUpdate?.() }, [onUpdate])

  return (
    <div className="space-y-6">
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
          <span>Início</span><span>Conclusão</span>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground">Checklist do Processo</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
            {steps.filter((s) => !s.isCompleted).length} pendentes
          </span>
        </div>

        <div>
          {visibleSteps.map((step, i) => (
            <StepRow key={step.stepKey} step={step} index={i} processId={process.id}
              onToggle={handleToggle} onMetaSave={handleMetaSave} onRefresh={handleRefresh} />
          ))}
        </div>

        {steps.length > 10 && (
          <div className="p-4 border-t border-border">
            <Button variant="ghost" className="w-full text-sm gap-2" onClick={() => setShowAll(!showAll)}>
              {showAll
                ? <><ChevronUp className="w-4 h-4" /> Mostrar menos</>
                : <><ChevronDown className="w-4 h-4" /> Ver todas as {steps.length} etapas</>}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
