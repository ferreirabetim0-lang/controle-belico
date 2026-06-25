'use client'

import { useState, useRef, useCallback } from 'react'
import { FileDown, Upload, X, CheckCircle2, Loader2, AlertTriangle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

const TARGET_MB = 1
const TARGET_BYTES = TARGET_MB * 1024 * 1024

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

type Status = 'idle' | 'compressing' | 'done' | 'error'

export default function PdfCompressPage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [result, setResult] = useState<{ blob: Blob; name: string; size: number } | null>(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(f: File | null) {
    if (!f) return
    if (f.type !== 'application/pdf') { setError('Selecione um arquivo PDF.'); return }
    setFile(f)
    setResult(null)
    setError('')
    setStatus('idle')
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFileSelect(e.dataTransfer.files[0] ?? null)
  }, [])

  async function compress() {
    if (!file) return
    setStatus('compressing')
    setProgress(0)
    setError('')
    setResult(null)

    try {
      // Dynamic imports to avoid SSR issues — use `any` to avoid pdfjs type version mismatch
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfjsLib: any = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).href

      const { jsPDF } = await import('jspdf')

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const totalPages = pdf.numPages

      let quality = 0.75
      let outputBlob: Blob | null = null

      for (let attempt = 0; attempt < 4; attempt++) {
        setProgressLabel(`Tentativa ${attempt + 1} — qualidade ${Math.round(quality * 100)}%`)

        const doc = new jsPDF({ unit: 'pt', compress: true })
        let isFirst = true

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          setProgress(Math.round(((attempt * totalPages + pageNum) / (4 * totalPages)) * 100))
          setProgressLabel(`Processando página ${pageNum}/${totalPages}…`)

          const page = await pdf.getPage(pageNum)
          const viewport = page.getViewport({ scale: 1.5 })

          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height
          const ctx = canvas.getContext('2d')

          await page.render({ canvasContext: ctx, viewport, canvas }).promise

          const imgData = canvas.toDataURL('image/jpeg', quality)

          const pdfW = doc.internal.pageSize.getWidth()
          const pdfH = (viewport.height / viewport.width) * pdfW

          if (isFirst) {
            doc.deletePage(1)
          }
          doc.addPage([pdfW, pdfH], pdfH > pdfW ? 'portrait' : 'landscape')
          doc.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST')
          isFirst = false
        }

        const output = doc.output('blob')
        outputBlob = output

        if (output.size <= TARGET_BYTES) break
        quality = Math.max(0.2, quality - 0.15)
      }

      if (!outputBlob) throw new Error('Falha ao gerar PDF')

      const name = file.name.replace(/\.pdf$/i, '_comprimido.pdf')
      setResult({ blob: outputBlob, name, size: outputBlob.size })
      setStatus('done')
      setProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao comprimir PDF')
      setStatus('error')
    }
  }

  function download() {
    if (!result) return
    const url = URL.createObjectURL(result.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.name
    a.click()
    URL.revokeObjectURL(url)
  }

  function reset() {
    setFile(null)
    setResult(null)
    setStatus('idle')
    setError('')
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  const reduction = file && result ? Math.round((1 - result.size / file.size) * 100) : 0
  const underTarget = result ? result.size <= TARGET_BYTES : false

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Diminuir PDF</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Comprime arquivos PDF para menos de 1 MB — padrão aceito pela Polícia Federal
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${dragging ? 'border-[#3E92CC] bg-[#3E92CC]/5' : file ? 'border-border bg-card cursor-default' : 'border-border hover:border-[#3E92CC]/50 hover:bg-muted/30'}`}
      >
        <input ref={inputRef} type="file" accept="application/pdf" className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)} />

        {!file ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 bg-[#0B2545]/10 rounded-2xl flex items-center justify-center">
              <Upload className="w-8 h-8 text-[#0B2545]" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Arraste um PDF aqui</p>
              <p className="text-sm text-muted-foreground mt-1">ou clique para selecionar</p>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">Somente arquivos .PDF</span>
          </div>
        ) : (
          <div className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#D50000]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileDown className="w-6 h-6 text-[#D50000]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tamanho original: <span className={file.size > TARGET_BYTES ? 'text-[#D50000] font-semibold' : 'text-[#00C853] font-semibold'}>{formatBytes(file.size)}</span>
                {file.size <= TARGET_BYTES && ' — já está abaixo de 1 MB'}
              </p>
            </div>
            {status === 'idle' && (
              <button onClick={(e) => { e.stopPropagation(); reset() }}
                className="text-muted-foreground hover:text-foreground flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-[#D50000]/10 border border-[#D50000]/30 rounded-2xl p-4">
          <AlertTriangle className="w-5 h-5 text-[#D50000] flex-shrink-0" />
          <p className="text-sm text-[#D50000]">{error}</p>
        </div>
      )}

      {/* Progress */}
      {status === 'compressing' && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#3E92CC]" />
            <span className="text-sm font-medium text-foreground">Comprimindo PDF…</span>
            <span className="ml-auto text-sm font-bold text-[#3E92CC]">{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div className="bg-gradient-to-r from-[#3E92CC] to-[#00C853] h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{progressLabel}</p>
        </div>
      )}

      {/* Result */}
      {status === 'done' && result && (
        <div className={`rounded-2xl border p-5 space-y-4 ${underTarget ? 'bg-[#00C853]/5 border-[#00C853]/30' : 'bg-[#FFAB00]/5 border-[#FFAB00]/30'}`}>
          <div className="flex items-center gap-3">
            {underTarget
              ? <CheckCircle2 className="w-6 h-6 text-[#00C853] flex-shrink-0" />
              : <AlertTriangle className="w-6 h-6 text-[#FFAB00] flex-shrink-0" />}
            <div>
              <p className="font-bold text-foreground">
                {underTarget ? 'PDF comprimido com sucesso!' : 'PDF comprimido — ainda acima de 1 MB'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {underTarget
                  ? 'O arquivo está dentro do padrão da Polícia Federal (menos de 1 MB).'
                  : 'O PDF tem muitas imagens de alta resolução. Tente um arquivo menor.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Original', value: formatBytes(file!.size), color: 'text-[#D50000]' },
              { label: 'Comprimido', value: formatBytes(result.size), color: underTarget ? 'text-[#00C853]' : 'text-[#FFAB00]' },
              { label: 'Redução', value: `${reduction}%`, color: 'text-[#3E92CC]' },
            ].map((item) => (
              <div key={item.label} className="bg-card rounded-xl p-3 text-center border border-border">
                <div className={`text-xl font-extrabold ${item.color}`}>{item.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button onClick={download} className="flex-1 gap-2 bg-[#0B2545] hover:bg-[#13315C]">
              <Download className="w-4 h-4" /> Baixar PDF Comprimido
            </Button>
            <Button variant="outline" onClick={reset} className="gap-2">
              <Upload className="w-4 h-4" /> Novo PDF
            </Button>
          </div>
        </div>
      )}

      {/* Action button */}
      {file && status === 'idle' && (
        <Button onClick={compress} size="lg" className="w-full gap-2 bg-[#0B2545] hover:bg-[#13315C] h-12">
          <FileDown className="w-5 h-5" /> Diminuir PDF
        </Button>
      )}

      {/* Info */}
      <div className="bg-muted/50 rounded-2xl p-5 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Como funciona</p>
        <ul className="space-y-1.5">
          {[
            'Selecione ou arraste o PDF que deseja comprimir',
            'O sistema renderiza cada página e recomprime as imagens',
            'Tenta automaticamente até 4 níveis de qualidade para atingir menos de 1 MB',
            'O arquivo comprimido é baixado direto no seu computador',
            'Nenhum arquivo é enviado para a internet — tudo acontece no seu navegador',
          ].map((t) => (
            <li key={t} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="text-[#00C853] mt-0.5 flex-shrink-0">✓</span> {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
