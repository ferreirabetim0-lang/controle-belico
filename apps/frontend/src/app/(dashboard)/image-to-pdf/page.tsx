'use client'

import { useState, useRef, useCallback } from 'react'
import { Image as ImageIcon, Upload, X, Download, FileText, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ImageItem = {
  id: string
  file: File
  preview: string
  width: number
  height: number
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [converting, setConverting] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(files: FileList | null) {
    if (!files) return
    const valid = Array.from(files).filter((f) => f.type === 'image/jpeg' || f.type === 'image/png')
    if (!valid.length) return

    valid.forEach((file) => {
      const url = URL.createObjectURL(file)
      const img = new window.Image()
      img.onload = () => {
        setImages((prev) => [
          ...prev,
          { id: `${Date.now()}-${Math.random()}`, file, preview: url, width: img.naturalWidth, height: img.naturalHeight },
        ])
      }
      img.src = url
    })
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }, [])

  function remove(id: string) {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item) URL.revokeObjectURL(item.preview)
      return prev.filter((i) => i.id !== id)
    })
  }

  function move(index: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  async function convert() {
    if (!images.length) return
    setConverting(true)
    try {
      const { jsPDF } = await import('jspdf')

      const first = images[0]
      const orientation = first.width >= first.height ? 'landscape' : 'portrait'
      const doc = new jsPDF({ unit: 'px', format: [first.width, first.height], orientation })

      for (let i = 0; i < images.length; i++) {
        const item = images[i]
        if (i > 0) doc.addPage([item.width, item.height], item.width >= item.height ? 'landscape' : 'portrait')

        // Draw image filling the whole page
        const canvas = document.createElement('canvas')
        canvas.width = item.width
        canvas.height = item.height
        const ctx = canvas.getContext('2d')!
        const img = new window.Image()
        await new Promise<void>((res) => { img.onload = () => res(); img.src = item.preview })
        ctx.drawImage(img, 0, 0)
        const dataUrl = canvas.toDataURL(item.file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92)
        const fmt = item.file.type === 'image/png' ? 'PNG' : 'JPEG'
        doc.addImage(dataUrl, fmt, 0, 0, item.width, item.height)
      }

      doc.save('imagens.pdf')
    } finally {
      setConverting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Transformar em PDF</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Converta imagens PNG ou JPG em um único arquivo PDF — adicione várias e reordene conforme necessário
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${dragging ? 'border-[#3E92CC] bg-[#3E92CC]/5' : 'border-border hover:border-[#3E92CC]/50 hover:bg-muted/30'}`}
      >
        <input ref={inputRef} type="file" accept="image/png,image/jpeg" multiple className="hidden"
          onChange={(e) => addFiles(e.target.files)} />
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="w-14 h-14 bg-[#0B2545]/10 rounded-2xl flex items-center justify-center">
            <ImageIcon className="w-7 h-7 text-[#0B2545]" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Arraste imagens aqui</p>
            <p className="text-sm text-muted-foreground mt-0.5">ou clique para selecionar</p>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">PNG e JPG — múltiplas imagens permitidas</span>
        </div>
      </div>

      {/* Image list */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground text-sm">{images.length} {images.length === 1 ? 'imagem' : 'imagens'} — arraste para reordenar</h3>
            <button onClick={() => inputRef.current?.click()}
              className="text-xs text-[#3E92CC] hover:underline flex items-center gap-1">
              <Upload className="w-3 h-3" /> Adicionar mais
            </button>
          </div>

          <div className="space-y-2">
            {images.map((item, i) => (
              <div key={item.id}
                className="flex items-center gap-3 bg-card border border-border rounded-2xl p-3 group">
                {/* Thumb */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt={item.file.name}
                  className="w-14 h-14 object-cover rounded-xl flex-shrink-0 border border-border" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{item.file.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.width}×{item.height}px · {formatBytes(item.file.size)}
                  </p>
                </div>

                {/* Page badge */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg flex-shrink-0">
                  <FileText className="w-3 h-3" />
                  Pág. {i + 1}
                </div>

                {/* Reorder */}
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button onClick={() => move(i, -1)} disabled={i === 0}
                    className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button onClick={() => move(i, 1)} disabled={i === images.length - 1}
                    className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors">
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Remove */}
                <button onClick={() => remove(item.id)}
                  className="text-muted-foreground hover:text-[#D50000] transition-colors flex-shrink-0 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Convert button */}
          <Button onClick={convert} disabled={converting} size="lg"
            className="w-full gap-2 bg-[#0B2545] hover:bg-[#13315C] h-12 mt-2">
            {converting
              ? <><span className="animate-spin">⏳</span> Gerando PDF…</>
              : <><Download className="w-5 h-5" /> Gerar PDF com {images.length} {images.length === 1 ? 'página' : 'páginas'}</>}
          </Button>
        </div>
      )}

      {/* Info */}
      <div className="bg-muted/50 rounded-2xl p-5 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Como funciona</p>
        <ul className="space-y-1.5">
          {[
            'Selecione ou arraste imagens PNG ou JPG',
            'Reordene as imagens usando as setas — a ordem define as páginas do PDF',
            'Clique em "Gerar PDF" para baixar o arquivo pronto',
            'Cada imagem vira uma página no tamanho original',
            'Nenhum arquivo é enviado para a internet — tudo no seu navegador',
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
