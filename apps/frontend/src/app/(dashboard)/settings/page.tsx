'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Building2, User, Bell, Shield, CreditCard, Users,
  Save, Check, Loader2, AlertCircle, CheckCircle2, XCircle,
  ExternalLink, Camera, Eye, EyeOff, Plus, Trash2, Pencil, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/use-api'
import { subscriptions, users, company, type Plan, type Subscription, type TeamMember } from '@/lib/api'
import { getInitials } from '@/lib/utils'

const tabs = [
  { id: 'company',       label: 'Empresa',       icon: Building2 },
  { id: 'profile',       label: 'Perfil',         icon: User },
  { id: 'team',          label: 'Equipe',         icon: Users },
  { id: 'notifications', label: 'Notificações',   icon: Bell },
  { id: 'security',      label: 'Segurança',      icon: Shield },
  { id: 'plan',          label: 'Plano',          icon: CreditCard },
]

const inputCls = 'w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 text-foreground'
const labelCls = 'text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider'

// ─── Empresa ──────────────────────────────────────────────────────────────────

function CompanyTab() {
  const { data, loading } = useApi(() => company.get(), [])
  const [form, setForm] = useState({ name: '', cnpj: '', phone: '', email: '', city: '', state: '', address: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (data) setForm({
      name: data.name ?? '', cnpj: (data as any).cnpj ?? '',
      phone: (data as any).phone ?? '', email: data.email ?? '',
      city: (data as any).city ?? '', state: (data as any).state ?? '',
      address: (data as any).address ?? '',
    })
  }, [data])

  async function handleSave() {
    setSaving(true)
    try {
      await company.update(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  if (loading) return <div className="bg-card rounded-2xl border border-border p-6 h-64 animate-pulse" />

  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
      <h2 className="font-bold text-foreground text-lg">Dados da Empresa</h2>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Nome da empresa', key: 'name' },
          { label: 'CNPJ', key: 'cnpj' },
          { label: 'Telefone', key: 'phone' },
          { label: 'E-mail', key: 'email', type: 'email' },
          { label: 'Cidade', key: 'city' },
          { label: 'Estado (UF)', key: 'state', maxLength: 2 },
        ].map((f) => (
          <div key={f.key}>
            <label className={labelCls}>{f.label}</label>
            <input
              type={f.type ?? 'text'}
              value={(form as any)[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              maxLength={f.maxLength}
              className={inputCls}
            />
          </div>
        ))}
        <div className="col-span-2">
          <label className={labelCls}>Endereço</label>
          <input value={form.address} onChange={(e) => set('address', e.target.value)} className={inputCls} />
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving} className="gap-2 bg-[#0B2545] hover:bg-[#13315C]">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar alterações'}
      </Button>
    </div>
  )
}

// ─── Perfil ───────────────────────────────────────────────────────────────────

function ProfileTab() {
  const { data, loading, refetch } = useApi(() => users.me(), [])
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (data) {
      setForm({ name: data.name ?? '', email: data.email ?? '', phone: data.phone ?? '' })
      setAvatar(data.avatar ?? null)
    }
  }, [data])

  async function handleSave() {
    setSaving(true)
    try {
      await users.updateMe(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1]
        const { url } = await users.uploadAvatar(base64, file.type)
        setAvatar(url)
        refetch()
      }
      reader.readAsDataURL(file)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao fazer upload')
    } finally {
      setUploading(false)
    }
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  if (loading) return <div className="bg-card rounded-2xl border border-border p-6 h-64 animate-pulse" />

  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
      <h2 className="font-bold text-foreground text-lg">Meu Perfil</h2>

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          {avatar ? (
            <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-border" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0B2545] to-[#3E92CC] flex items-center justify-center text-white text-2xl font-bold">
              {getInitials(form.name || 'U')}
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-[#0B2545] hover:bg-[#13315C] rounded-lg flex items-center justify-center transition-colors border-2 border-card"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Camera className="w-3.5 h-3.5 text-white" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <div className="font-semibold text-foreground">{form.name}</div>
          <div className="text-sm text-muted-foreground">{form.email}</div>
          <button onClick={() => fileRef.current?.click()} className="text-xs text-[#3E92CC] hover:underline mt-1">
            Alterar foto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>Nome completo</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>E-mail</label>
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Telefone</label>
          <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="gap-2 bg-[#0B2545] hover:bg-[#13315C]">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar perfil'}
      </Button>
    </div>
  )
}

// ─── Equipe ───────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador', MANAGER: 'Gerente', DISPATCHER: 'Despachante',
  FINANCIAL: 'Financeiro', ATTENDANT: 'Atendente',
}

type MemberModalProps = {
  initial?: TeamMember | null
  onSave: (data: any) => Promise<void>
  onClose: () => void
}

function MemberModal({ initial, onSave, onClose }: MemberModalProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? '', email: initial?.email ?? '',
    phone: initial?.phone ?? '', role: initial?.role ?? 'ATTENDANT',
    password: '', confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!initial && form.password !== form.confirmPassword) { setError('Senhas não coincidem'); return }
    if (!initial && form.password.length < 6) { setError('Senha deve ter pelo menos 6 caracteres'); return }
    setLoading(true); setError('')
    try {
      const payload: any = { name: form.name, email: form.email, phone: form.phone || undefined, role: form.role }
      if (!initial) payload.password = form.password
      await onSave(payload)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-foreground text-lg">{initial ? 'Editar membro' : 'Novo membro'}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Nome completo</label>
            <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>E-mail</label>
            <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Telefone</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Função</label>
              <select value={form.role} onChange={(e) => set('role', e.target.value)} className={inputCls}>
                {Object.entries(ROLE_LABELS).filter(([v]) => v !== 'ADMIN').map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          {!initial && <>
            <div>
              <label className={labelCls}>Senha</label>
              <input required type="password" value={form.password} onChange={(e) => set('password', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Confirmar senha</label>
              <input required type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} className={inputCls} />
            </div>
          </>}
          {error && <p className="text-xs text-[#D50000] bg-[#D50000]/10 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-[#0B2545] hover:bg-[#13315C] gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TeamTab() {
  const { data, loading, refetch } = useApi(() => users.team(), [])
  const [modal, setModal] = useState<'create' | TeamMember | null>(null)

  async function handleSave(payload: any) {
    if (modal === 'create') await users.createMember(payload)
    else if (modal) await users.updateMember(modal.id, payload)
    refetch()
  }

  async function handleRemove(id: string) {
    if (!confirm('Desativar este membro?')) return
    await users.removeMember(id)
    refetch()
  }

  return (
    <>
      {modal && (
        <MemberModal
          initial={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-bold text-foreground">Membros da equipe</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Os membros podem ser selecionados como responsável ao cadastrar um cliente
            </p>
          </div>
          <Button size="sm" onClick={() => setModal('create')} className="gap-2 bg-[#0B2545] hover:bg-[#13315C]">
            <Plus className="w-4 h-4" /> Novo membro
          </Button>
        </div>
        {loading && <div className="p-6 animate-pulse text-sm text-muted-foreground">Carregando...</div>}
        <div className="divide-y divide-border">
          {(data ?? []).map((member) => (
            <div key={member.id} className="flex items-center gap-4 px-5 py-4">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-[#0B2545] to-[#3E92CC] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {getInitials(member.name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{member.name}</div>
                <div className="text-xs text-muted-foreground">{member.email}</div>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg hidden sm:block">
                {ROLE_LABELS[member.role] ?? member.role}
              </span>
              <span className={`text-xs px-2 py-1 rounded-lg font-medium ${member.isActive ? 'text-[#00C853] bg-[#00C853]/10' : 'text-muted-foreground bg-muted'}`}>
                {member.isActive ? 'Ativo' : 'Inativo'}
              </span>
              <div className="flex gap-1">
                <button onClick={() => setModal(member)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                {member.isActive && (
                  <button onClick={() => handleRemove(member.id)} className="p-1.5 hover:bg-[#D50000]/10 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-[#D50000]" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Notificações ─────────────────────────────────────────────────────────────

const NOTIF_OPTIONS = [
  { key: 'email',           label: 'Notificações por e-mail',              desc: 'Receba atualizações importantes no seu e-mail' },
  { key: 'push',            label: 'Notificações no navegador',            desc: 'Alertas em tempo real enquanto usa a plataforma' },
  { key: 'whatsapp',        label: 'Notificações por WhatsApp',            desc: 'Receba avisos no seu WhatsApp cadastrado' },
  { key: 'processUpdates',  label: 'Atualização de processos',             desc: 'Quando um processo muda de etapa ou status' },
  { key: 'documentExpiry',  label: 'Vencimento de documentos',             desc: 'Alertas de documentos próximos ao vencimento' },
  { key: 'teamActivity',    label: 'Atividade da equipe',                  desc: 'Quando membros da equipe realizam ações' },
]

function NotificationsTab() {
  const { data, loading } = useApi(() => users.getSettings(), [])
  const [settings, setSettings] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (data) setSettings(data)
  }, [data])

  async function handleSave() {
    setSaving(true)
    try {
      await users.updateSettings(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  function toggle(key: string) {
    setSettings((s) => ({ ...s, [key]: !s[key] }))
  }

  if (loading) return <div className="bg-card rounded-2xl border border-border p-6 h-64 animate-pulse" />

  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
      <h2 className="font-bold text-foreground text-lg">Preferências de Notificação</h2>
      <div className="space-y-3">
        {NOTIF_OPTIONS.map((opt) => (
          <div key={opt.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div className="flex-1 min-w-0 pr-4">
              <div className="text-sm font-medium text-foreground">{opt.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
            </div>
            <button
              onClick={() => toggle(opt.key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${settings[opt.key] ? 'bg-[#0B2545]' : 'bg-muted'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${settings[opt.key] ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>
      <Button onClick={handleSave} disabled={saving} className="gap-2 bg-[#0B2545] hover:bg-[#13315C]">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar preferências'}
      </Button>
    </div>
  )
}

// ─── Segurança ────────────────────────────────────────────────────────────────

function SecurityTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) { setError('As senhas não coincidem'); return }
    if (form.newPassword.length < 6) { setError('A nova senha deve ter pelo menos 6 caracteres'); return }
    setLoading(true); setError('')
    try {
      await users.changePassword(form.currentPassword, form.newPassword)
      setSuccess(true)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
      <h2 className="font-bold text-foreground text-lg">Segurança</h2>

      {success && (
        <div className="flex items-center gap-3 bg-[#00C853]/10 border border-[#00C853]/30 rounded-xl p-4 text-[#00C853]">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">Senha alterada com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div>
          <label className={labelCls}>Senha atual</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              required
              value={form.currentPassword}
              onChange={(e) => set('currentPassword', e.target.value)}
              className={inputCls + ' pr-10'}
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className={labelCls}>Nova senha</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              required
              value={form.newPassword}
              onChange={(e) => set('newPassword', e.target.value)}
              className={inputCls + ' pr-10'}
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className={labelCls}>Confirmar nova senha</label>
          <input
            type="password"
            required
            value={form.confirmPassword}
            onChange={(e) => set('confirmPassword', e.target.value)}
            className={inputCls}
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-xs text-[#D50000] bg-[#D50000]/10 px-3 py-2 rounded-lg">{error}</p>}
        <Button type="submit" disabled={loading} className="gap-2 bg-[#0B2545] hover:bg-[#13315C]">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          {loading ? 'Alterando...' : 'Alterar senha'}
        </Button>
      </form>
    </div>
  )
}

// ─── Plano ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  ACTIVE:    { label: 'Ativo',               color: 'text-[#00C853]',          bg: 'bg-[#00C853]/10',  icon: CheckCircle2 },
  TRIAL:     { label: 'Trial',               color: 'text-[#3E92CC]',          bg: 'bg-[#3E92CC]/10',  icon: CheckCircle2 },
  INACTIVE:  { label: 'Inativo',             color: 'text-muted-foreground',   bg: 'bg-muted',         icon: XCircle },
  SUSPENDED: { label: 'Suspenso',            color: 'text-[#FFAB00]',          bg: 'bg-[#FFAB00]/10',  icon: AlertCircle },
  CANCELLED: { label: 'Cancelado',           color: 'text-[#D50000]',          bg: 'bg-[#D50000]/10',  icon: XCircle },
  PENDING:   { label: 'Aguard. Pagamento',   color: 'text-[#FFAB00]',          bg: 'bg-[#FFAB00]/10',  icon: AlertCircle },
}

function displayPlanName(name: string) {
  if (!name) return name
  if (name.toLowerCase() === 'starter' || name.toLowerCase() === 'free') return 'Free'
  return name
}

function PlanTab() {
  const searchParams = useSearchParams()
  const payment = searchParams.get('payment')

  const { data: sub, loading: loadingSub, refetch: refetchSub } = useApi(() => subscriptions.status(), [])
  const { data: plans, loading: loadingPlans } = useApi(() => subscriptions.plans(), [])
  const [checkingOut, setCheckingOut] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => { if (payment === 'success') refetchSub() }, [payment])

  async function handleCheckout(planId: string) {
    setCheckingOut(planId)
    try {
      const result = await subscriptions.checkout(planId)
      const url = process.env.NODE_ENV === 'production' ? result.checkoutUrl : result.sandboxUrl
      window.open(url, '_blank')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao iniciar checkout')
    } finally {
      setCheckingOut(null)
    }
  }

  async function handleCancel() {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) return
    setCancelling(true)
    try { await subscriptions.cancel(); refetchSub() }
    catch (e) { alert(e instanceof Error ? e.message : 'Erro ao cancelar') }
    finally { setCancelling(false) }
  }

  const currentPlanId = sub?.plan?.id
  const statusCfg = sub ? (STATUS_CONFIG[sub.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.INACTIVE) : null
  const StatusIcon = statusCfg?.icon ?? CheckCircle2
  const isActive = sub?.status === 'ACTIVE' || sub?.status === 'TRIAL'

  return (
    <div className="space-y-5">
      {payment === 'success' && (
        <div className="flex items-center gap-3 bg-[#00C853]/10 border border-[#00C853]/30 rounded-2xl p-4 text-[#00C853]">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div><div className="font-semibold text-sm">Pagamento confirmado!</div><div className="text-xs opacity-80">Sua assinatura foi ativada com sucesso.</div></div>
        </div>
      )}
      {payment === 'failure' && (
        <div className="flex items-center gap-3 bg-[#D50000]/10 border border-[#D50000]/30 rounded-2xl p-4 text-[#D50000]">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <div><div className="font-semibold text-sm">Pagamento não aprovado</div><div className="text-xs opacity-80">Tente novamente com outro método de pagamento.</div></div>
        </div>
      )}
      {payment === 'pending' && (
        <div className="flex items-center gap-3 bg-[#FFAB00]/10 border border-[#FFAB00]/30 rounded-2xl p-4 text-[#FFAB00]">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div><div className="font-semibold text-sm">Pagamento pendente</div><div className="text-xs opacity-80">Aguardando confirmação. Você será notificado quando aprovado.</div></div>
        </div>
      )}

      {loadingSub ? (
        <div className="bg-gradient-to-br from-[#0B2545] to-[#134074] rounded-2xl p-6 animate-pulse h-32" />
      ) : (
        <div className="bg-gradient-to-br from-[#0B2545] to-[#134074] rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Plano atual</div>
              <div className="text-3xl font-extrabold">
                {sub?.plan ? displayPlanName(sub.plan.name) : 'Plano Free'}
              </div>
            </div>
            {sub?.plan && (
              <div className="text-right">
                <div className="text-3xl font-extrabold text-[#3E92CC]">
                  R$ {Number(sub.plan.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-white/60">por mês</div>
              </div>
            )}
          </div>
          {statusCfg && (
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {statusCfg.label}
                {sub?.daysLeft !== null && sub?.daysLeft !== undefined && (
                  <span className="opacity-70">· {sub.daysLeft}d restantes</span>
                )}
              </div>
              {sub?.currentPeriodEnd && (
                <div className="text-xs text-white/60">
                  Próx. cobrança: <strong className="text-white">{new Date(sub.currentPeriodEnd).toLocaleDateString('pt-BR')}</strong>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="font-bold text-foreground mb-4">{isActive ? 'Alterar plano' : 'Escolha seu plano'}</h3>
        {loadingPlans ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => <div key={i} className="bg-card border border-border rounded-2xl p-5 h-48 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(plans ?? []).map((plan) => {
              const isCurrent = plan.id === currentPlanId && isActive
              const features: string[] = Array.isArray(plan.features)
                ? plan.features
                : typeof plan.features === 'string'
                  ? JSON.parse(plan.features)
                  : []
              return (
                <div key={plan.id} className={`bg-card border rounded-2xl p-5 flex flex-col gap-4 transition-all ${isCurrent ? 'border-[#3E92CC] ring-2 ring-[#3E92CC]/20' : 'border-border hover:border-[#3E92CC]/40'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      {isCurrent && <span className="text-xs font-semibold text-[#3E92CC] bg-[#3E92CC]/10 px-2 py-0.5 rounded-full mb-2 inline-block">Plano atual</span>}
                      <div className="text-lg font-extrabold text-foreground">{displayPlanName(plan.name)}</div>
                      {plan.description && <div className="text-xs text-muted-foreground mt-0.5">{plan.description}</div>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-extrabold text-[#0B2545]">
                        {Number(plan.price) === 0 ? 'Grátis' : `R$ ${Number(plan.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      </div>
                      {Number(plan.price) > 0 && <div className="text-xs text-muted-foreground">/mês</div>}
                    </div>
                  </div>
                  <ul className="space-y-1.5 flex-1">
                    {features.slice(0, 6).map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-[#00C853] flex-shrink-0" />{f}
                      </li>
                    ))}
                    {plan.maxClients && (
                      <li className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-[#00C853] flex-shrink-0" />
                        Até {plan.maxClients === 999999 ? 'ilimitados' : plan.maxClients} clientes
                      </li>
                    )}
                    {plan.maxUsers && (
                      <li className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-[#00C853] flex-shrink-0" />
                        Até {plan.maxUsers === 999999 ? 'ilimitados' : plan.maxUsers} usuários
                      </li>
                    )}
                  </ul>
                  <Button
                    disabled={isCurrent || checkingOut !== null}
                    onClick={() => handleCheckout(plan.id)}
                    className={`w-full gap-2 text-sm ${isCurrent ? 'bg-muted text-muted-foreground cursor-default' : 'bg-[#0B2545] hover:bg-[#13315C] text-white'}`}
                  >
                    {checkingOut === plan.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Abrindo checkout...</>
                    ) : isCurrent ? (
                      <><Check className="w-4 h-4" />Plano ativo</>
                    ) : (
                      <><ExternalLink className="w-4 h-4" />{isActive ? 'Mudar para este plano' : 'Assinar agora'}</>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {isActive && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h4 className="font-semibold text-foreground mb-1 text-sm">Cancelar assinatura</h4>
          <p className="text-xs text-muted-foreground mb-4">Seu acesso continuará ativo até o fim do período atual.</p>
          <Button variant="outline" size="sm" className="border-[#D50000]/40 text-[#D50000] hover:bg-[#D50000]/10 gap-2" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            {cancelling ? 'Cancelando...' : 'Cancelar assinatura'}
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie sua empresa, equipe e preferências</p>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="w-52 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-[#0B2545] text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 min-w-0">
          {activeTab === 'company'       && <CompanyTab />}
          {activeTab === 'profile'       && <ProfileTab />}
          {activeTab === 'team'          && <TeamTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'security'      && <SecurityTab />}
          {activeTab === 'plan'          && <PlanTab />}
        </div>
      </div>
    </div>
  )
}
