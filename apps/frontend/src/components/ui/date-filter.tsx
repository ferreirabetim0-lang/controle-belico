'use client'

import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

export type DatePreset = 'today' | 'yesterday' | 'week' | 'fortnight' | 'month' | 'last_month' | 'quarter' | 'custom'

export type DateRange = {
  preset: DatePreset
  label: string
  from: Date
  to: Date
}

const presets: { id: DatePreset; label: string; short: string }[] = [
  { id: 'today', label: 'Hoje', short: 'Hoje' },
  { id: 'yesterday', label: 'Ontem', short: 'Ontem' },
  { id: 'week', label: 'Esta semana', short: 'Semana' },
  { id: 'fortnight', label: 'Quinzena', short: 'Quinzena' },
  { id: 'month', label: 'Este mês', short: 'Mês' },
  { id: 'last_month', label: 'Mês passado', short: 'Mês ant.' },
  { id: 'quarter', label: 'Trimestre', short: 'Trimestre' },
]

function getRange(preset: DatePreset): { from: Date; to: Date } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (preset) {
    case 'today':
      return { from: today, to: today }
    case 'yesterday': {
      const y = new Date(today); y.setDate(y.getDate() - 1)
      return { from: y, to: y }
    }
    case 'week': {
      const day = today.getDay()
      const mon = new Date(today); mon.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
      return { from: mon, to: today }
    }
    case 'fortnight': {
      const from = new Date(today); from.setDate(today.getDate() - 14)
      return { from, to: today }
    }
    case 'month':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: today }
    case 'last_month': {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const to = new Date(now.getFullYear(), now.getMonth(), 0)
      return { from, to }
    }
    case 'quarter': {
      const from = new Date(today); from.setDate(today.getDate() - 90)
      return { from, to: today }
    }
    default:
      return { from: today, to: today }
  }
}

function formatDate(d: Date) {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

type Props = {
  value?: DatePreset
  onChange: (range: DateRange) => void
  size?: 'sm' | 'md'
}

export function DateFilter({ value = 'month', onChange, size = 'md' }: Props) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<DatePreset>(value)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const activePreset = presets.find((p) => p.id === active)
  const range = active !== 'custom' ? getRange(active) : null

  function select(preset: DatePreset) {
    if (preset === 'custom') {
      setShowCustom(true)
      return
    }
    setActive(preset)
    setShowCustom(false)
    const { from, to } = getRange(preset)
    const label = presets.find((p) => p.id === preset)!.label
    onChange({ preset, label, from, to })
    setOpen(false)
  }

  function applyCustom() {
    if (!customFrom || !customTo) return
    const from = new Date(customFrom)
    const to = new Date(customTo)
    const label = `${formatDate(from)} – ${formatDate(to)}`
    setActive('custom')
    onChange({ preset: 'custom', label, from, to })
    setOpen(false)
    setShowCustom(false)
  }

  const displayLabel = active === 'custom'
    ? (customFrom && customTo
        ? `${formatDate(new Date(customFrom))} – ${formatDate(new Date(customTo))}`
        : 'Personalizado')
    : activePreset?.label ?? 'Período'

  const rangeLabel = range
    ? `${formatDate(range.from)} – ${formatDate(range.to)}`
    : null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 bg-card border border-border rounded-xl font-medium text-foreground hover:border-[#3E92CC]/50 transition-all ${
          size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'
        }`}
      >
        <Calendar className={size === 'sm' ? 'w-3.5 h-3.5 text-[#3E92CC]' : 'w-4 h-4 text-[#3E92CC]'} />
        <span>{displayLabel}</span>
        {rangeLabel && <span className="text-muted-foreground hidden sm:inline">· {rangeLabel}</span>}
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setShowCustom(false) }} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-2xl shadow-soft overflow-hidden w-56">
            <div className="p-2 space-y-0.5">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => select(p.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                    active === p.id && !showCustom
                      ? 'bg-[#0B2545] text-white'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <span>{p.label}</span>
                  {active === p.id && !showCustom && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3E92CC]" />
                  )}
                </button>
              ))}

              <div className="border-t border-border mt-1 pt-1">
                <button
                  onClick={() => select('custom')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    showCustom ? 'bg-muted text-foreground' : 'hover:bg-muted text-foreground'
                  }`}
                >
                  Personalizado…
                </button>
              </div>

              {showCustom && (
                <div className="border-t border-border pt-3 px-1 space-y-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">De</label>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Até</label>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  </div>
                  <button
                    onClick={applyCustom}
                    disabled={!customFrom || !customTo}
                    className="w-full py-2 bg-[#0B2545] text-white rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-[#13315C] transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
