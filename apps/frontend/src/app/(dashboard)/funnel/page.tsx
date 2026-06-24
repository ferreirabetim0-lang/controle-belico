'use client'

import { useState } from 'react'
import { Plus, GripVertical, User, DollarSign, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, getInitials } from '@/lib/utils'

type Card = {
  id: string
  name: string
  value: number
  city: string
  responsible: string
  daysInStage: number
  tag?: string
}

type Column = {
  id: string
  label: string
  color: string
  cards: Card[]
}

const initialColumns: Column[] = [
  {
    id: 'lead', label: 'Lead', color: '#94a3b8',
    cards: [
      { id: 'c1', name: 'Roberto Gomes', value: 850, city: 'Salvador', responsible: 'Admin', daysInStage: 3 },
      { id: 'c2', name: 'Camila Dias', value: 850, city: 'Fortaleza', responsible: 'Fernanda', daysInStage: 1 },
    ],
  },
  {
    id: 'contact', label: 'Contato Realizado', color: '#3E92CC',
    cards: [
      { id: 'c3', name: 'Paulo Nunes', value: 850, city: 'Recife', responsible: 'Carlos', daysInStage: 5 },
    ],
  },
  {
    id: 'negotiation', label: 'Negociação', color: '#FFAB00',
    cards: [
      { id: 'c4', name: 'Tatiana Moura', value: 1200, city: 'Curitiba', responsible: 'Admin', daysInStage: 7, tag: 'CRAF' },
    ],
  },
  {
    id: 'payment', label: 'Pagamento', color: '#7c3aed',
    cards: [
      { id: 'c5', name: 'Marcos Pinto', value: 850, city: 'BH', responsible: 'Admin', daysInStage: 2 },
    ],
  },
  {
    id: 'documentation', label: 'Documentação', color: '#0B2545',
    cards: [
      { id: 'c6', name: 'João Mendes', value: 850, city: 'SP', responsible: 'Admin', daysInStage: 12 },
      { id: 'c7', name: 'Ana Costa', value: 850, city: 'Curitiba', responsible: 'Carlos', daysInStage: 8 },
    ],
  },
  {
    id: 'cr', label: 'CR', color: '#134074',
    cards: [
      { id: 'c8', name: 'Carlos Lima', value: 850, city: 'BH', responsible: 'Admin', daysInStage: 21 },
      { id: 'c9', name: 'Marina Silva', value: 850, city: 'RJ', responsible: 'Fernanda', daysInStage: 15 },
    ],
  },
  {
    id: 'craf', label: 'CRAF', color: '#3E92CC',
    cards: [
      { id: 'c10', name: 'Pedro Alves', value: 1200, city: 'Brasília', responsible: 'Admin', daysInStage: 30, tag: 'CRAF' },
    ],
  },
  {
    id: 'completed', label: 'Finalizado', color: '#00C853',
    cards: [
      { id: 'c11', name: 'Lucia Santos', value: 850, city: 'Floripa', responsible: 'Carlos', daysInStage: 45 },
    ],
  },
  {
    id: 'lost', label: 'Perdido', color: '#D50000',
    cards: [],
  },
]

export default function FunnelPage() {
  const [columns, setColumns] = useState(initialColumns)
  const [dragging, setDragging] = useState<{ cardId: string; fromCol: string } | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const totalCards = columns.reduce((s, c) => s + c.cards.length, 0)
  const totalValue = columns
    .filter((c) => c.id !== 'lost')
    .reduce((s, c) => s + c.cards.reduce((cs, card) => cs + card.value, 0), 0)

  function handleDragStart(cardId: string, fromCol: string) {
    setDragging({ cardId, fromCol })
  }

  function handleDrop(toColId: string) {
    if (!dragging || dragging.fromCol === toColId) {
      setDragging(null)
      setDragOver(null)
      return
    }

    setColumns((prev) => {
      const fromCol = prev.find((c) => c.id === dragging.fromCol)!
      const toCol = prev.find((c) => c.id === toColId)!
      const card = fromCol.cards.find((c) => c.id === dragging.cardId)!

      return prev.map((col) => {
        if (col.id === dragging.fromCol) return { ...col, cards: col.cards.filter((c) => c.id !== dragging.cardId) }
        if (col.id === toColId) return { ...col, cards: [...col.cards, { ...card, daysInStage: 0 }] }
        return col
      })
    })

    setDragging(null)
    setDragOver(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Funil de Vendas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalCards} clientes · {formatCurrency(totalValue)} em pipeline
          </p>
        </div>
        <Button size="sm" className="gap-2 bg-[#0B2545] hover:bg-[#13315C]">
          <Plus className="w-4 h-4" /> Novo Lead
        </Button>
      </div>

      {/* Summary row */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.filter((c) => c.id !== 'lost').map((col) => (
          <div key={col.id} className="flex-shrink-0 flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
            <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
            <span className="text-xs text-muted-foreground whitespace-nowrap">{col.label}</span>
            <span className="text-xs font-bold text-foreground">{col.cards.length}</span>
          </div>
        ))}
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '500px' }}>
        {columns.map((col) => (
          <div
            key={col.id}
            className={`flex-shrink-0 w-64 flex flex-col rounded-2xl border-2 transition-colors ${
              dragOver === col.id ? 'border-[#3E92CC] bg-[#3E92CC]/5' : 'border-border bg-muted/30'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(col.id) }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => handleDrop(col.id)}
          >
            {/* Column header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                  <span className="text-sm font-semibold text-foreground">{col.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-bold text-muted-foreground">
                    {col.cards.length}
                  </span>
                  <button className="text-muted-foreground hover:text-foreground">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {col.cards.length > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(col.cards.reduce((s, c) => s + c.value, 0))}
                </div>
              )}
            </div>

            {/* Cards */}
            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
              {col.cards.map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => handleDragStart(card.id, col.id)}
                  className={`bg-card rounded-xl p-3.5 border border-border cursor-grab active:cursor-grabbing shadow-card hover:shadow-soft transition-all group ${
                    dragging?.cardId === card.id ? 'opacity-50 rotate-1' : ''
                  }`}
                >
                  <div className="flex items-start gap-2 mb-3">
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0 group-hover:text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{card.name}</div>
                      <div className="text-xs text-muted-foreground">{card.city}</div>
                    </div>
                    {card.tag && (
                      <span className="text-xs bg-[#FFAB00]/15 text-[#FFAB00] px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                        {card.tag}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-[#00C853] font-semibold">
                      <DollarSign className="w-3 h-3" />
                      {formatCurrency(card.value)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <div className="w-5 h-5 bg-gradient-to-br from-[#0B2545] to-[#3E92CC] rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                        {getInitials(card.responsible)}
                      </div>
                      <span className={card.daysInStage > 14 ? 'text-[#D50000] font-medium' : ''}>
                        {card.daysInStage}d
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {col.cards.length === 0 && (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-border rounded-xl">
                  <span className="text-xs text-muted-foreground">Arraste um card aqui</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
