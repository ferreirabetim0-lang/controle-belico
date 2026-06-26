'use client'

import { useState, useMemo } from 'react'
import { RefreshCw, AlertTriangle, Clock, CheckCircle2, Download, Search, Phone, Loader2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'
import { useApi } from '@/hooks/use-api'
import { clients, type RadarItem } from '@/lib/api'
import Link from 'next/link'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function waLink(phone: string, clientName: string, docType: string, expiresAt: string) {
  const clean = phone.replace(/\D/g, '').replace(/^55/, '')
  const msg = encodeURIComponent(
    `Ola ${clientName}! Passamos para informar que seu(sua) *${docType}* vence em ${fmtDate(expiresAt)}. Entre em contato conosco para iniciar a renovacao com antecedencia.`
  )
  return `https://wa.me/55${clean}?text=${msg}`
}

const CATEGORY_ICON: Record<string, string> = {
  PSYCHOLOGICAL_EXAM: 'P', SHOOTING_EXAM: 'T', CR: 'CR', CR_RENEWAL: 'CR',
  CRAF: 'CF', CRAF_RENEWAL: 'CF', CNH: 'C', RG: 'RG', PROOF_OF_RESIDENCE: 'End',
  PROOF_OF_INCOME: 'Rnd', CLUB_MEMBERSHIP: 'Cl', CERTIFICATIONS: 'Cer', PHOTO_3X4: 'Ft',
}

const URGENCY_CONFIG = {
  danger:  { label: 'Urgente',   sublabel: '15 dias',   text: 'text-[#D50000]', border: 'border-l-[#D50000]', badge: 'bg-[#D50000]/10 text-[#D50000]', bg: 'bg-[#D50000]/10', ring: 'ring-[#D50000]/30' },
  warning: { label: 'Atencao',   sublabel: '16-30 dias', text: 'text-[#FFAB00]', border: 'border-l-[#FFAB00]', badge: 'bg-[#FFAB00]/10 text-[#FFAB00]', bg: 'bg-[#FFAB00]/10', ring: 'ring-[#FFAB00]/30' },
  info:    { label: 'Monitorar', sublabel: '31-60 dias', text: 'text-[#3E92CC]', border: 'border-l-[#3E92CC]', badge: 'bg-[#3E92CC]/10 text-[#3E92CC]', bg: 'bg-[#3E92CC]/10', ring: 'ring-[#3E92CC]/30' },
  ok:      { label: 'OK',        sublabel: '60+ dias',  text: 'text-[#00C853]', border: 'border-l-[#00C853]', badge: 'bg-[#00C853]/10 text-[#00C853]', bg: 'bg-[#00C853]/10', ring: 'ring-[#00C853]/30' },
}

type UrgencyKey = keyof typeof URGENCY_CONFIG
const HORIZON_OPTIONS = [{ label: '30 dias', days: 30 }, { label: '60 dias', days: 60 }, { label: '90 dias', days: 90 }, { label: '180 dias', days: 180 }]
const PROCESS_TYPES = ['Todos', 'CR', 'CRAF', 'GT', 'DOC']

function exportCSV(items: RadarItem[]) {
  const rows = [
    ['Cliente', 'Telefone', 'Cidade', 'Tipo', 'Documento', 'Vencimento', 'Dias', 'Urgencia'],
    ...items.map((i) => [i.clientName, i.clientPhone, i.clientCity, i.processType, i.docType, fmtDate(i.expiresAt), String(i.daysUntil), URGENCY_CONFIG[i.urgency as UrgencyKey]?.label ?? i.urgency]),
  ]
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `radar_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  URL.revokeObjectURL(url)
}

export default function RadarPage() {
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyKey | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState('Todos')
  const [search, setSearch] = useState('')
  const [horizon, setHorizon] = useState(180)
  const [showHorizonMenu, setShowHorizonMenu] = useState(false)

  const { data, loading, error, refetch } = useApi(() => clients.radarItems(), [])
  const items: RadarItem[] = data ?? []

  const inHorizon = useMemo(() => items.filter((i) => i.daysUntil <= horizon), [items, horizon])
  const filtered = useMemo(() => inHorizon.filter((item) => {
    if (urgencyFilter !== 'all' && item.urgency !== urgencyFilter) return false
    if (typeFilter !== 'Todos' && item.processType !== typeFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!item.clientName.toLowerCase().includes(q) && !item.docType.toLowerCase().includes(q)) return false
    }
    return true
  }), [inHorizon, urgencyFilter, typeFilter, search])

  const counts = useMemo(() => ({
    danger:  inHorizon.filter((i) => i.urgency === 'danger').length,
    warning: inHorizon.filter((i) => i.urgency === 'warning').length,
    info:    inHorizon.filter((i) => i.urgency === 'info').length,
    ok:      inHorizon.filter((i) => i.urgency === 'ok').length,
  }), [inHorizon])

  const horizonLabel = HORIZON_OPTIONS.find((o) => o.days === horizon)?.label ?? `${horizon} dias`

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-[#3E92CC]" /> Radar de Renovacao
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? 'Carregando...' : `${inHorizon.length} vencimentos nos proximos ${horizonLabel}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setShowHorizonMenu(!showHorizonMenu)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-muted text-foreground hover:bg-muted/80 border border-border">
              <Clock className="w-3.5 h-3.5" /> {horizonLabel} <ChevronDown className="w-3 h-3" />
            </button>
            {showHorizonMenu && (
              <div className="absolute right-0 mt-1 bg-card border border-border rounded-xl shadow-soft z-10 py-1 min-w-[120px]">
                {HORIZON_OPTIONS.map((o) => (
                  <button key={o.days} onClick={() => { setHorizon(o.days); setShowHorizonMenu(false) }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors ${horizon === o.days ? 'text-[#3E92CC] font-semibold' : 'text-foreground'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => exportCSV(filtered)} disabled={filtered.length === 0}>
            <Download className="w-4 h-4" /> Exportar
          </Button>
          <Button variant="ghost" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(['danger', 'warning', 'info', 'ok'] as UrgencyKey[]).map((key) => {
          const cfg = URGENCY_CONFIG[key]
          const Icon = key === 'danger' ? AlertTriangle : key === 'ok' ? CheckCircle2 : Clock
          return (
            <button key={key} onClick={() => setUrgencyFilter(urgencyFilter === key ? 'all' : key)}
              className={`stat-card border-l-4 ${cfg.border} text-left transition-all hover:scale-[1.01] ${urgencyFilter === key ? `ring-2 ${cfg.ring}` : ''}`}>
              <div className={`w-9 h-9 ${cfg.bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-4 h-4 ${cfg.text}`} />
              </div>
              <div className={`text-3xl font-extrabold mb-1 ${cfg.text}`}>{counts[key]}</div>
              <div className="text-xs font-semibold text-foreground">{cfg.label}</div>
              <div className="text-[10px] text-muted-foreground">{cfg.sublabel}</div>
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'danger', 'warning', 'info'] as const).map((key) => {
          const label = key === 'all' ? 'Todos' : URGENCY_CONFIG[key].label
          const count = key === 'all' ? filtered.length : counts[key]
          return (
            <button key={key} onClick={() => setUrgencyFilter(key)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${urgencyFilter === key ? 'bg-[#0B2545] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              {label} <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${urgencyFilter === key ? 'bg-white/20' : 'bg-border'}`}>{count}</span>
            </button>
          )
        })}
        <div className="w-px h-5 bg-border mx-1" />
        {PROCESS_TYPES.map((type) => (
          <button key={type} onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${typeFilter === type ? 'bg-[#134074] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {type}
          </button>
        ))}
        <div className="ml-auto relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente ou documento..."
            className="pl-8 pr-3 py-1.5 text-xs bg-muted rounded-lg border border-border w-56 focus:outline-none focus:ring-2 focus:ring-[#3E92CC]/30" />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Verificando vencimentos...</span>
        </div>
      )}
      {error && !loading && (
        <div className="bg-[#D50000]/10 border border-[#D50000]/30 rounded-2xl p-6 text-sm text-[#D50000] text-center">
          Erro ao carregar radar: {error}
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-[#00C853] mx-auto mb-4" />
          <div className="text-base font-semibold text-foreground mb-1">Nenhum vencimento encontrado</div>
          <p className="text-sm text-muted-foreground">
            {search || urgencyFilter !== 'all' || typeFilter !== 'Todos'
              ? 'Tente remover os filtros aplicados.'
              : `Nenhum documento vence nos proximos ${horizonLabel}.`}
          </p>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Cliente', 'Tipo', 'Documento', 'Vencimento', 'Dias Restantes', 'Acoes'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const cfg = URGENCY_CONFIG[item.urgency as UrgencyKey] ?? URGENCY_CONFIG.ok
                  const catLabel = CATEGORY_ICON[item.category] ?? '?'
                  return (
                    <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#0B2545] to-[#3E92CC] rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(item.clientName)}
                          </div>
                          <div>
                            <Link href={`/clients/${item.clientId}`} className="text-sm font-medium text-foreground hover:text-[#3E92CC] transition-colors">
                              {item.clientName}
                            </Link>
                            {item.clientCity && <div className="text-xs text-muted-foreground">{item.clientCity}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={item.processType === 'CR' ? 'info' : item.processType === 'CRAF' ? 'warning' : item.processType === 'GT' ? 'secondary' : 'outline'}>
                          {item.processType}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text}`}>{catLabel}</span>
                          {item.docType}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-foreground whitespace-nowrap">{fmtDate(item.expiresAt)}</td>
                      <td className="px-5 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
                          {item.urgency === 'danger' && <AlertTriangle className="w-3 h-3" />}
                          {item.daysUntil <= 0 ? 'Vencido!' : `${item.daysUntil} dias`}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          {item.clientPhone && (
                            <a href={waLink(item.clientPhone, item.clientName, item.docType, item.expiresAt)} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs text-[#00C853] border-[#00C853]/30 hover:bg-[#00C853]/10">
                                <Phone className="w-3 h-3" /> WhatsApp
                              </Button>
                            </a>
                          )}
                          <Link href={`/clients/${item.clientId}`}>
                            <Button size="sm" className="gap-1.5 h-7 text-xs bg-[#0B2545] hover:bg-[#13315C]">Ver cliente</Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            {filtered.length} vencimento{filtered.length !== 1 ? 's' : ''} exibido{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  )
}