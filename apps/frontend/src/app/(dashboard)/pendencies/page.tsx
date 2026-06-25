'use client'

import { useState, useMemo } from 'react'
import { AlertTriangle, Camera, FileWarning, CreditCard, Clock, UserX, FileX, Search, Loader2, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useApi } from '@/hooks/use-api'
import { clients } from '@/lib/api'

type Urgency = 'high' | 'medium' | 'low'

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; urgency: Urgency }> = {
  NO_PHOTO:              { label: 'Foto 3x4 ausente',           icon: Camera,       urgency: 'high' },
  NO_RG_CNH:            { label: 'Sem RG ou CNH',              icon: FileX,        urgency: 'high' },
  NO_PROOF_OF_INCOME:   { label: 'Sem comprovante de renda',   icon: UserX,        urgency: 'medium' },
  NO_PROOF_OF_RESIDENCE:{ label: 'Sem comprovante de endereço',icon: FileWarning,  urgency: 'medium' },
  NO_CERTIFICATIONS:    { label: 'Certidões pendentes',        icon: FileX,        urgency: 'medium' },
  NO_CLUB_MEMBERSHIP:   { label: 'Sem filiação ao clube',      icon: UserX,        urgency: 'medium' },
  EXPIRING_PSYCH_EXAM:  { label: 'Exame psicológico vencendo', icon: Clock,        urgency: 'high' },
  EXPIRING_SHOOTING_EXAM:{ label: 'Exame de tiro vencendo',   icon: Clock,        urgency: 'high' },
  EXPIRING_CR:          { label: 'CR vence em 30 dias',        icon: AlertTriangle,urgency: 'medium' },
  EXPIRING_CRAF:        { label: 'CRAF vence em 30 dias',      icon: AlertTriangle,urgency: 'medium' },
}

const urgencyConfig = {
  high:   { badge: 'danger'    as const, label: 'Urgente',   border: 'border-l-[#D50000]', iconBg: 'bg-[#D50000]/10', iconColor: 'text-[#D50000]' },
  medium: { badge: 'warning'   as const, label: 'Atenção',   border: 'border-l-[#FFAB00]', iconBg: 'bg-[#FFAB00]/10', iconColor: 'text-[#FFAB00]' },
  low:    { badge: 'secondary' as const, label: 'Monitorar', border: 'border-l-[#3E92CC]', iconBg: 'bg-[#3E92CC]/10', iconColor: 'text-[#3E92CC]' },
}

export default function PendenciesPage() {
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | Urgency>('all')
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const { data: rawData, loading, error } = useApi(() => clients.pendencies(), [refreshKey])

  // Monta lista de categorias com dados reais da API
  const categories = useMemo(() => {
    if (!rawData) return []
    return Object.entries(CATEGORY_CONFIG)
      .map(([key, cfg]) => ({
        key,
        ...cfg,
        clientNames: (rawData[key] ?? []) as string[],
      }))
      .filter((c) => c.clientNames.length > 0) // só mostra categorias com pendências reais
  }, [rawData])

  // Aplica filtros de urgência e busca
  const filtered = useMemo(() => {
    return categories.filter((c) => {
      if (urgencyFilter !== 'all' && c.urgency !== urgencyFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const matchLabel = c.label.toLowerCase().includes(q)
        const matchClient = c.clientNames.some((n) => n.toLowerCase().includes(q))
        if (!matchLabel && !matchClient) return false
      }
      return true
    })
  }, [categories, urgencyFilter, search])

  const totalHigh   = categories.filter((c) => c.urgency === 'high').reduce((s, c) => s + c.clientNames.length, 0)
  const totalMedium = categories.filter((c) => c.urgency === 'medium').reduce((s, c) => s + c.clientNames.length, 0)
  const totalAll    = categories.reduce((s, c) => s + c.clientNames.length, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Central de Pendências</h1>
          <p className="text-muted-foreground text-sm mt-1">Identificação automática de pendências de todos os clientes</p>
        </div>
        <Button size="sm" className="gap-2 bg-[#0B2545] hover:bg-[#13315C]"
          onClick={() => setRefreshKey((k) => k + 1)} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {loading ? 'Carregando...' : 'Atualizar'}
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card border-l-4 border-l-[#D50000]">
          <div className="text-3xl font-extrabold text-[#D50000] mb-1">{loading ? '—' : totalHigh}</div>
          <div className="text-sm font-medium text-foreground">Urgentes</div>
          <div className="text-xs text-muted-foreground">Ação imediata necessária</div>
        </div>
        <div className="stat-card border-l-4 border-l-[#FFAB00]">
          <div className="text-3xl font-extrabold text-[#FFAB00] mb-1">{loading ? '—' : totalMedium}</div>
          <div className="text-sm font-medium text-foreground">Atenção</div>
          <div className="text-xs text-muted-foreground">Resolver em breve</div>
        </div>
        <div className="stat-card border-l-4 border-l-[#3E92CC]">
          <div className="text-3xl font-extrabold text-[#3E92CC] mb-1">{loading ? '—' : totalAll}</div>
          <div className="text-sm font-medium text-foreground">Total</div>
          <div className="text-xs text-muted-foreground">Todas as pendências</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2">
          {([['all', 'Todos'], ['high', 'Urgentes'], ['medium', 'Atenção'], ['low', 'Monitorar']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setUrgencyFilter(val)}
              className={`px-4 py-2 text-sm rounded-xl font-medium transition-all ${
                urgencyFilter === val ? 'bg-[#0B2545] text-white' : 'bg-card border border-border text-muted-foreground hover:border-[#0B2545]/40'
              }`}>
              {label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pendência ou cliente..."
            className="pl-8 pr-3 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 w-64" />
        </div>
      </div>

      {/* Estado de carregamento / erro */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Carregando pendências...</span>
        </div>
      )}

      {error && !loading && (
        <div className="bg-[#D50000]/10 border border-[#D50000]/30 rounded-2xl p-6 text-center text-sm text-[#D50000]">
          Erro ao carregar pendências. <button onClick={() => setRefreshKey((k) => k + 1)} className="underline">Tentar novamente</button>
        </div>
      )}

      {/* Cards de pendências */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-16 text-center space-y-3">
              <div className="w-12 h-12 bg-[#00C853]/10 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-2xl">✓</span>
              </div>
              <p className="font-semibold text-foreground">
                {search || urgencyFilter !== 'all' ? 'Nenhuma pendência encontrada para os filtros aplicados' : 'Nenhuma pendência identificada!'}
              </p>
              <p className="text-sm text-muted-foreground">
                {search || urgencyFilter !== 'all' ? 'Tente remover os filtros.' : 'Todos os clientes estão com a documentação em dia.'}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((category) => {
                const config = urgencyConfig[category.urgency]
                const Icon = category.icon
                const visibleClients = search
                  ? category.clientNames.filter((n) => n.toLowerCase().includes(search.toLowerCase()))
                  : category.clientNames

                return (
                  <div key={category.key}
                    className={`bg-card rounded-2xl p-5 border border-border border-l-4 ${config.border} shadow-card hover:shadow-soft transition-all duration-200`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 ${config.iconBg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${config.iconColor}`} />
                      </div>
                      <Badge variant={config.badge}>{config.label}</Badge>
                    </div>

                    <div className="text-2xl font-extrabold text-foreground mb-1">
                      {search ? visibleClients.length : category.clientNames.length}
                      {search && visibleClients.length !== category.clientNames.length && (
                        <span className="text-sm font-normal text-muted-foreground ml-1">de {category.clientNames.length}</span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-foreground mb-3">{category.label}</div>

                    {visibleClients.length > 0 && (
                      <div className="space-y-1">
                        {visibleClients.slice(0, 4).map((client) => (
                          <div key={client} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: config.iconColor.replace('text-', '').replace('[', '').replace(']', '') }} />
                            {client}
                          </div>
                        ))}
                        {visibleClients.length > 4 && (
                          <div className="text-xs text-muted-foreground pl-3">+{visibleClients.length - 4} outros</div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
