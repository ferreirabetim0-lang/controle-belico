'use client'

import { useState } from 'react'
import { Upload, FileText, CheckCircle2, AlertTriangle, Clock, Eye, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const mockDocuments = [
  { id: '1', category: 'Foto 3x4', name: 'foto_3x4.jpg', status: 'PENDING', uploadedAt: null, expiresAt: null },
  { id: '2', category: 'RG', name: 'rg_frente.pdf', status: 'APPROVED', uploadedAt: '10/06/2026', expiresAt: null },
  { id: '3', category: 'Comprovante de Endereço', name: 'comp_endereco.pdf', status: 'APPROVED', uploadedAt: '11/06/2026', expiresAt: '10/12/2026' },
  { id: '4', category: 'Comprovante de Renda', name: null, status: 'PENDING', uploadedAt: null, expiresAt: null },
  { id: '5', category: 'Exame Psicológico', name: 'laudo_psicologo.pdf', status: 'APPROVED', uploadedAt: '08/06/2026', expiresAt: '08/12/2026' },
  { id: '6', category: 'Exame de Tiro', name: null, status: 'PENDING', uploadedAt: null, expiresAt: null },
  { id: '7', category: 'Certidões Negativas', name: null, status: 'PENDING', uploadedAt: null, expiresAt: null },
  { id: '8', category: 'Filiação ao Clube', name: null, status: 'PENDING', uploadedAt: null, expiresAt: null },
  { id: '9', category: 'GRU', name: null, status: 'PENDING', uploadedAt: null, expiresAt: null },
  { id: '10', category: 'Declaração Inquérito', name: 'decl_inquerito.pdf', status: 'APPROVED', uploadedAt: '12/06/2026', expiresAt: null },
]

const statusConfig = {
  APPROVED: { label: 'Aprovado', icon: CheckCircle2, color: 'text-[#00C853]', bg: 'bg-[#00C853]/10', badge: 'success' as const },
  PENDING: { label: 'Pendente', icon: AlertTriangle, color: 'text-[#FFAB00]', bg: 'bg-[#FFAB00]/10', badge: 'warning' as const },
  REJECTED: { label: 'Rejeitado', icon: AlertTriangle, color: 'text-[#D50000]', bg: 'bg-[#D50000]/10', badge: 'danger' as const },
  EXPIRED: { label: 'Vencido', icon: Clock, color: 'text-[#D50000]', bg: 'bg-[#D50000]/10', badge: 'danger' as const },
}

export function ClientDocuments({ clientId }: { clientId: string }) {
  const [docs, setDocs] = useState(mockDocuments)
  const received = docs.filter((d) => d.status === 'APPROVED').length

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <div className="text-2xl font-bold text-foreground">{docs.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Total esperado</div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <div className="text-2xl font-bold text-[#00C853]">{received}</div>
          <div className="text-xs text-muted-foreground mt-1">Recebidos</div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <div className="text-2xl font-bold text-[#D50000]">{docs.length - received}</div>
          <div className="text-xs text-muted-foreground mt-1">Pendentes</div>
        </div>
      </div>

      {/* Upload button */}
      <Button className="gap-2 bg-[#0B2545] hover:bg-[#13315C]">
        <Upload className="w-4 h-4" /> Enviar Documento
      </Button>

      {/* Document list */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {docs.map((doc) => {
            const config = statusConfig[doc.status as keyof typeof statusConfig]
            const StatusIcon = config.icon

            return (
              <div key={doc.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                <div className={`w-9 h-9 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  {doc.name ? (
                    <FileText className={`w-4 h-4 ${config.color}`} />
                  ) : (
                    <StatusIcon className={`w-4 h-4 ${config.color}`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{doc.category}</div>
                  {doc.name ? (
                    <div className="text-xs text-muted-foreground truncate">{doc.name}</div>
                  ) : (
                    <div className="text-xs text-[#D50000]">Aguardando envio</div>
                  )}
                </div>

                {doc.expiresAt && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    Vence em {doc.expiresAt}
                  </div>
                )}

                <Badge variant={config.badge}>{config.label}</Badge>

                <div className="flex gap-1">
                  {doc.name && (
                    <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg">
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg">
                    <Upload className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
