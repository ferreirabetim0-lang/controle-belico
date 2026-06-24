'use client'

import { FileSignature, CheckCircle2, Clock, AlertTriangle, Plus, Eye, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'

const signatures = [
  { id: '1', doc: 'Declaração de Capacidade Técnica — João Mendes', client: 'João Mendes', sentAt: '20/06/2026', signedAt: '20/06/2026 16:40', status: 'SIGNED' },
  { id: '2', doc: 'Procuração para Processo CR — Ana Costa', client: 'Ana Costa', sentAt: '21/06/2026', signedAt: null, status: 'PENDING' },
  { id: '3', doc: 'Termo de Responsabilidade — Carlos Lima', client: 'Carlos Lima', sentAt: '18/06/2026', signedAt: null, status: 'EXPIRED' },
  { id: '4', doc: 'Declaração de Guarda — Marina Silva', client: 'Marina Silva', sentAt: '22/06/2026', signedAt: null, status: 'PENDING' },
  { id: '5', doc: 'Procuração CRAF — Pedro Alves', client: 'Pedro Alves', sentAt: '15/06/2026', signedAt: '16/06/2026 09:12', status: 'SIGNED' },
]

const statusConfig = {
  SIGNED: { label: 'Assinado', variant: 'success' as const, icon: CheckCircle2, color: 'text-[#00C853]', bg: 'bg-[#00C853]/10' },
  PENDING: { label: 'Aguardando', variant: 'warning' as const, icon: Clock, color: 'text-[#FFAB00]', bg: 'bg-[#FFAB00]/10' },
  EXPIRED: { label: 'Expirado', variant: 'danger' as const, icon: AlertTriangle, color: 'text-[#D50000]', bg: 'bg-[#D50000]/10' },
}

export default function SignaturesPage() {
  const signed = signatures.filter((s) => s.status === 'SIGNED').length
  const pending = signatures.filter((s) => s.status === 'PENDING').length

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assinaturas Digitais</h1>
          <p className="text-muted-foreground text-sm mt-1">{signed} assinados · {pending} aguardando</p>
        </div>
        <Button size="sm" className="gap-2 bg-[#0B2545] hover:bg-[#13315C]">
          <Plus className="w-4 h-4" /> Solicitar Assinatura
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total enviados', value: signatures.length, color: 'text-foreground', border: 'border-l-[#3E92CC]' },
          { label: 'Assinados', value: signed, color: 'text-[#00C853]', border: 'border-l-[#00C853]' },
          { label: 'Pendentes', value: pending, color: 'text-[#FFAB00]', border: 'border-l-[#FFAB00]' },
        ].map((kpi) => (
          <div key={kpi.label} className={`stat-card border-l-4 ${kpi.border}`}>
            <div className={`text-3xl font-extrabold ${kpi.color} mb-1`}>{kpi.value}</div>
            <div className="text-xs text-muted-foreground">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="divide-y divide-border">
          {signatures.map((sig) => {
            const cfg = statusConfig[sig.status as keyof typeof statusConfig]
            return (
              <div key={sig.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                <div className={`w-9 h-9 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{sig.doc}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Enviado em {sig.sentAt}
                    {sig.signedAt && ` · Assinado em ${sig.signedAt}`}
                  </div>
                </div>
                <Badge variant={cfg.variant}>{cfg.label}</Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg">
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  {sig.status === 'PENDING' && (
                    <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg text-[#3E92CC]">
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
