'use client'

import { Eye, Download, FileText, Paperclip, Shield } from 'lucide-react'
import type { Process } from '@/lib/api'

type StepDoc = { id: string; name: string; url: string; size: number; type: string; uploadedAt: string }

type ProcessDoc = StepDoc & { stepName: string; processType: string }

function fileIcon(mimeType: string) {
  if (mimeType?.includes('pdf')) return '📄'
  if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝'
  if (mimeType?.includes('image')) return '🖼️'
  return '📁'
}

function formatBytes(bytes: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ClientDocuments({
  clientId, documents, processes,
}: {
  clientId: string
  documents: unknown[]
  processes?: Process[]
}) {
  // Flatten all documents from process steps
  const processDocs: ProcessDoc[] = (processes ?? []).flatMap((p) =>
    (p.steps ?? []).flatMap((s) => {
      const meta = (s as any).metadata ?? {}
      const docs: StepDoc[] = meta.documents ?? []

      // Also include cert docs
      const certDocs: StepDoc[] = Object.values(meta.certificationDocs ?? {})
        .filter(Boolean)
        .map((d: any) => ({ id: d.id, name: d.name, url: d.url, size: 0, type: 'application/pdf', uploadedAt: '' }))

      // Include address declaration doc
      const declDoc: StepDoc[] = meta.addressDeclarationDoc
        ? [{ id: meta.addressDeclarationDoc.id, name: meta.addressDeclarationDoc.name, url: meta.addressDeclarationDoc.url, size: 0, type: 'application/pdf', uploadedAt: '' }]
        : []

      return [...docs, ...certDocs, ...declDoc].map((doc) => ({
        ...doc,
        stepName: s.stepName,
        processType: p.type,
      }))
    })
  )

  if (processDocs.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground space-y-3">
        <FileText className="w-12 h-12 mx-auto opacity-20" />
        <p className="text-sm font-medium">Nenhum documento anexado</p>
        <p className="text-xs">Anexe documentos nas etapas do processo para que apareçam aqui</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <div className="text-2xl font-bold text-foreground">{processDocs.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Total de documentos</div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <div className="text-2xl font-bold text-[#3E92CC]">
            {new Set(processDocs.map((d) => d.stepName)).size}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Etapas com documentos</div>
        </div>
      </div>

      {/* Group by process */}
      {(processes ?? []).map((p) => {
        const pDocs = processDocs.filter((d) => d.processType === p.type)
        if (pDocs.length === 0) return null

        // Group by stepName
        const byStep: Record<string, ProcessDoc[]> = {}
        pDocs.forEach((d) => {
          if (!byStep[d.stepName]) byStep[d.stepName] = []
          byStep[d.stepName].push(d)
        })

        return (
          <div key={p.id} className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#3E92CC]" />
              <span className="text-sm font-bold text-foreground">Processo {p.type}</span>
              <span className="ml-auto text-xs text-muted-foreground">{pDocs.length} documento{pDocs.length > 1 ? 's' : ''}</span>
            </div>

            {Object.entries(byStep).map(([stepName, docs]) => (
              <div key={stepName}>
                <div className="px-5 py-2 bg-muted/10 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{stepName}</span>
                </div>
                <div className="divide-y divide-border">
                  {docs.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/10 transition-colors">
                      <span className="text-xl leading-none">{fileIcon(doc.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(doc.size)}
                          {doc.uploadedAt ? ` · ${new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <a href={doc.url} target="_blank" rel="noreferrer"
                          className="w-8 h-8 rounded-lg bg-[#3E92CC]/10 text-[#3E92CC] flex items-center justify-center hover:bg-[#3E92CC]/20 transition-colors"
                          title="Visualizar">
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        <a href={doc.url} download={doc.name}
                          className="w-8 h-8 rounded-lg bg-[#00C853]/10 text-[#00C853] flex items-center justify-center hover:bg-[#00C853]/20 transition-colors"
                          title="Baixar">
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
