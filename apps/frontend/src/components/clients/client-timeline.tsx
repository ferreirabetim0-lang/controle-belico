'use client'

import { CheckCircle2, Upload, MessageSquare, DollarSign, User, Shield, AlertTriangle } from 'lucide-react'

const mockTimeline = [
  { id: '1', type: 'process_update', title: 'Declaração Guarda Acervo concluída', description: 'Etapa marcada como concluída', createdBy: 'Admin', createdAt: '20/06/2026 14:32', icon: CheckCircle2, color: 'text-[#00C853]', bg: 'bg-[#00C853]/10' },
  { id: '2', type: 'document_upload', title: 'Documento enviado: Declaração Inquérito', description: 'decl_inquerito.pdf — 245 KB', createdBy: 'Admin', createdAt: '20/06/2026 14:30', icon: Upload, color: 'text-[#3E92CC]', bg: 'bg-[#3E92CC]/10' },
  { id: '3', type: 'whatsapp', title: 'Mensagem enviada via WhatsApp', description: 'Lembrete: "Olá João, precisamos da sua foto 3x4 para dar andamento no processo. Pode enviar por aqui?"', createdBy: 'Sistema', createdAt: '19/06/2026 09:15', icon: MessageSquare, color: 'text-[#00C853]', bg: 'bg-[#00C853]/10' },
  { id: '4', type: 'payment', title: 'Pagamento registrado', description: 'R$ 850,00 — PIX — Processo CR', createdBy: 'Admin', createdAt: '15/06/2026 10:00', icon: DollarSign, color: 'text-[#FFAB00]', bg: 'bg-[#FFAB00]/10' },
  { id: '5', type: 'process_update', title: 'Processo CR iniciado', description: 'Checklist de 18 etapas criado automaticamente', createdBy: 'Admin', createdAt: '15/06/2026 09:50', icon: Shield, color: 'text-[#3E92CC]', bg: 'bg-[#3E92CC]/10' },
  { id: '6', type: 'status_change', title: 'Status atualizado: Lead → Documentação', description: 'Negociação concluída, documentação iniciada', createdBy: 'Admin', createdAt: '15/06/2026 09:45', icon: User, color: 'text-[#0B2545]', bg: 'bg-[#0B2545]/10' },
  { id: '7', type: 'created', title: 'Cliente cadastrado', description: 'Indicação de João Silva', createdBy: 'Admin', createdAt: '15/06/2026 09:30', icon: User, color: 'text-[#3E92CC]', bg: 'bg-[#3E92CC]/10' },
]

export function ClientTimeline({ clientId }: { clientId: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">Histórico completo</h3>
        <span className="text-xs text-muted-foreground">{mockTimeline.length} eventos</span>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border" />

        <div className="space-y-4">
          {mockTimeline.map((event, i) => (
            <div key={event.id} className="flex gap-4 relative">
              <div className={`w-10 h-10 ${event.bg} rounded-xl flex items-center justify-center flex-shrink-0 relative z-10 border-2 border-background`}>
                <event.icon className={`w-4 h-4 ${event.color}`} />
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
                    <div className="text-xs text-muted-foreground">{event.createdAt}</div>
                    <div className="text-xs text-muted-foreground">{event.createdBy}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
