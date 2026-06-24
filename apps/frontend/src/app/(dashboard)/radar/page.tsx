'use client'

import { useState } from 'react'
import { RefreshCw, AlertTriangle, Clock, Bell, MessageSquare, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { daysUntil, getUrgencyColor, getInitials } from '@/lib/utils'

const renewals = [
  { id: '1', clientName: 'Carlos Lima', clientCity: 'Belo Horizonte', type: 'CR', docType: 'Certificado de Registro', expiresAt: '2026-07-05', responsible: 'Admin', phone: '(31) 99999-0001' },
  { id: '2', clientName: 'Ana Costa', clientCity: 'Curitiba', type: 'CR', docType: 'Exame Psicológico', expiresAt: '2026-07-10', responsible: 'Carlos', phone: '(41) 99999-0002' },
  { id: '3', clientName: 'Marina Silva', clientCity: 'Rio de Janeiro', type: 'CRAF', docType: 'Certificado CRAF', expiresAt: '2026-07-22', responsible: 'Fernanda', phone: '(21) 99999-0003' },
  { id: '4', clientName: 'Pedro Alves', clientCity: 'Brasília', type: 'CR', docType: 'Exame de Tiro', expiresAt: '2026-08-01', responsible: 'Admin', phone: '(61) 99999-0004' },
  { id: '5', clientName: 'Lucia Santos', clientCity: 'Florianópolis', type: 'CR', docType: 'Comprovante de Endereço', expiresAt: '2026-08-10', responsible: 'Carlos', phone: '(48) 99999-0005' },
  { id: '6', clientName: 'Tatiana Moura', clientCity: 'Curitiba', type: 'CRAF', docType: 'Certificado CRAF', expiresAt: '2026-08-15', responsible: 'Admin', phone: '(41) 99999-0006' },
  { id: '7', clientName: 'Roberto Gomes', clientCity: 'Salvador', type: 'GT', docType: 'Guia de Trânsito', expiresAt: '2026-09-01', responsible: 'Admin', phone: '(71) 99999-0007' },
]

const urgencyLabels = {
  danger: { label: 'Urgente (≤ 15 dias)', color: 'bg-[#D50000]' },
  warning: { label: 'Atenção (16-30 dias)', color: 'bg-[#FFAB00]' },
  info: { label: 'Monitorar (31-60 dias)', color: 'bg-[#3E92CC]' },
}

export default function RadarPage() {
  const [filter, setFilter] = useState<'all' | 'danger' | 'warning' | 'info'>('all')

  const enriched = renewals.map((r) => ({
    ...r,
    days: daysUntil(r.expiresAt),
    urgency: getUrgencyColor(daysUntil(r.expiresAt)),
  }))

  const filtered = filter === 'all' ? enriched : enriched.filter((r) => r.urgency === filter)

  const counts = {
    danger: enriched.filter((r) => r.urgency === 'danger').length,
    warning: enriched.filter((r) => r.urgency === 'warning').length,
    info: enriched.filter((r) => r.urgency === 'info').length,
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-[#3E92CC]" />
            Radar de Renovação
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitore vencimentos e renove proativamente em até 60 dias de antecedência
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" /> Exportar lista
        </Button>
      </div>

      {/* Urgency summary */}
      <div className="grid grid-cols-3 gap-4">
        {(Object.entries(urgencyLabels) as [keyof typeof urgencyLabels, typeof urgencyLabels[keyof typeof urgencyLabels]][]).map(([key, { label, color }]) => (
          <button
            key={key}
            onClick={() => setFilter(filter === key ? 'all' : key)}
            className={`stat-card border-l-4 text-left transition-all hover:scale-[1.01] ${
              key === 'danger' ? 'border-l-[#D50000]' : key === 'warning' ? 'border-l-[#FFAB00]' : 'border-l-[#3E92CC]'
            } ${filter === key ? 'ring-2 ring-ring/30' : ''}`}
          >
            <div className={`w-9 h-9 ${key === 'danger' ? 'bg-[#D50000]/10' : key === 'warning' ? 'bg-[#FFAB00]/10' : 'bg-[#3E92CC]/10'} rounded-xl flex items-center justify-center mb-4`}>
              {key === 'danger' ? (
                <AlertTriangle className={`w-4 h-4 ${key === 'danger' ? 'text-[#D50000]' : key === 'warning' ? 'text-[#FFAB00]' : 'text-[#3E92CC]'}`} />
              ) : (
                <Clock className={`w-4 h-4 ${key === 'warning' ? 'text-[#FFAB00]' : 'text-[#3E92CC]'}`} />
              )}
            </div>
            <div className={`text-3xl font-extrabold mb-1 ${key === 'danger' ? 'text-[#D50000]' : key === 'warning' ? 'text-[#FFAB00]' : 'text-[#3E92CC]'}`}>
              {counts[key]}
            </div>
            <div className="text-xs text-muted-foreground leading-tight">{label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {([['all', 'Todos', enriched.length], ['danger', 'Urgente', counts.danger], ['warning', 'Atenção', counts.warning], ['info', 'Monitorar', counts.info]] as const).map(([val, label, count]) => (
          <button
            key={val}
            onClick={() => setFilter(val as any)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${filter === val ? 'bg-[#0B2545] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {label} <span className={`px-1 py-0 rounded-full text-[10px] ${filter === val ? 'bg-white/20' : 'bg-border'}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {['Cliente', 'Tipo', 'Documento', 'Vencimento', 'Dias Restantes', 'Responsável', 'Ações'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#0B2545] to-[#3E92CC] rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitials(r.clientName)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{r.clientName}</div>
                        <div className="text-xs text-muted-foreground">{r.clientCity}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={r.type === 'CR' ? 'info' : r.type === 'CRAF' ? 'warning' : 'secondary'}>
                      {r.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{r.docType}</td>
                  <td className="px-5 py-4 text-sm font-medium text-foreground">{new Date(r.expiresAt).toLocaleDateString('pt-BR')}</td>
                  <td className="px-5 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      r.urgency === 'danger' ? 'bg-[#D50000]/10 text-[#D50000]' :
                      r.urgency === 'warning' ? 'bg-[#FFAB00]/10 text-[#FFAB00]' :
                      'bg-[#3E92CC]/10 text-[#3E92CC]'
                    }`}>
                      {r.urgency === 'danger' && <AlertTriangle className="w-3 h-3" />}
                      {r.days} dias
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-5 h-5 bg-gradient-to-br from-[#0B2545] to-[#3E92CC] rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                        {getInitials(r.responsible)}
                      </div>
                      {r.responsible}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs text-[#00C853] border-[#00C853]/30 hover:bg-[#00C853]/10">
                        <MessageSquare className="w-3 h-3" /> WhatsApp
                      </Button>
                      <Button size="sm" className="gap-1.5 h-7 text-xs bg-[#0B2545] hover:bg-[#13315C]">
                        Renovar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
