'use client'

import { CheckCircle2, Upload, MessageSquare, DollarSign, User, Shield, FileText, Clock } from 'lucide-react'

type TimelineEvent = {
  id: string
  type: string
  title: string
  description?: string
  createdBy?: string
  createdAt: string
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  process_update: { icon: CheckCircle2, color: 'text-[#00C853]', bg: 'bg-[#00C853]/10' },
  process_created: { icon: Shield, color: 'text-[#3E92CC]', bg: 'bg-[#3E92CC]/10' },
  document_upload: { icon: Upload, color: 'text-[#3E92CC]', bg: 'bg-[#3E92CC]/10' },
  document_approved: { icon: FileText, color: 'text-[#00C853]', bg: 'bg-[#00C853]/10' },
  whatsapp: { icon: MessageSquare, color: 'text-[#00C853]', bg: 'bg-[#00C853]/10' },
  payment: { icon: DollarSign, color: 'text-[#FFAB00]', bg: 'bg-[#FFAB00]/10' },
  status_change: { icon: User, color: 'text-[#0B2545]', bg: 'bg-[#0B2545]/10' },
  created: { icon: User, color: 'text-[#3E92CC]', bg: 'bg-[#3E92CC]/10' },
  default: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' },
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateStr
  }
}

export function ClientTimeline({ clientId, timeline }: { clientId: string; timeline: TimelineEvent[] }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground space-y-2">
        <Clock className="w-10 h-10 mx-auto opacity-20" />
        <p className="text-sm">Nenhum evento registrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">Histórico completo</h3>
        <span className="text-xs text-muted-foreground">{timeline.length} eventos</span>
      </div>

      <div className="relative">
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border" />
        <div className="space-y-4">
          {timeline.map((event) => {
            const cfg = typeConfig[event.type] ?? typeConfig.default
            const Icon = cfg.icon
            return (
              <div key={event.id} className="flex gap-4 relative">
                <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0 relative z-10 border-2 border-background`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{event.title}</p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{event.description}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</div>
                      {event.createdBy && <div className="text-xs text-muted-foreground">{event.createdBy}</div>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
