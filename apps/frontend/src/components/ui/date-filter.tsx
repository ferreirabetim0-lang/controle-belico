'use client'

import { useState } from 'react'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

export type DatePreset = 'today' | 'yesterday' | 'week' | 'fortnight' | 'month' | 'last_month' | 'quarter' | 'custom'

export type DateRange = {
  preset: DatePreset
  label: string
  from: Date
  to: Date
}

const presets: { id: DatePreset; label: string }[] = [
  { id: 'today',      label: 'Hoje' },
  { id: 'yesterday',  label: 'Ontem' },
  { id: 'week',       label: 'Esta semana' },
  { id: 'fortnight',  label: 'Quinzena' },
  { id: 'month',      label: 'Este mês' },
  { id: 'last_month', label: 'Mês passado' },
  { id: 'quarter',    label: 'Trimestre' },
]

function getRange(preset: DatePreset): { from: Date; to: Date } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  switch (preset) {
    case 'today':     return { from: today, to: today }
    case 'yesterday': { const y = new Date(today); y.setDate(y.getDate() - 1); return { from: y, to: y } }
    case 'week': {
      const day = today.getDay()
      const mon = new Date(today); mon.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
      return { from: mon, to: today }
    }
    case 'fortnight': { const f = new Date(today); f.setDate(today.getDate() - 14); return { from: f, to: today } }
    case 'month':     return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: today }
    case 'last_month': return {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to:   new Date(now.getFullYear(), now.getMonth(), 0),
    }
    case 'quarter':   { const q = new Date(today); q.setDate(today.getDate() - 90); return { from: q, to: today } }
    default:          return { from: today, to: today }
  }
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function CalendarMonth({
  year, month, rangeStart, rangeEnd, hovered,
  onDayClick, onDayHover,
}: {
  year: number; month: number
  rangeStart: Date | null; rangeEnd: Date | null; hovered: Date | null
  onDayClick: (d: Date) => void; onDayHover: (d: Date | null) => void
}) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = Array(firstDay).fill(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(year, month, i))

  const lo = rangeStart && rangeEnd ? (rangeStart <= rangeEnd ? rangeStart : rangeEnd) : rangeStart
  const hi = rangeStart && rangeEnd ? (rangeStart <= rangeEnd ? rangeEnd : rangeStart) : null
  const hiPreview = rangeStart && !rangeEnd && hovered
    ? (rangeStart <= hovered ? hovered : rangeStart)
    : null
  const loPreview = rangeStart && !rangeEnd && hovered
    ? (rangeStart <= hovered ? rangeStart : hovered)
    : null

  function cls(d: Date | null) {
    if (!d) return ''
    const t = d.getTime()
    const isStart = lo && lo.getTime() === t
    const isEnd = (hi ?? hiPreview) && (hi ?? hiPreview)!.getTime() === t
    const inRange = lo && (hi ?? hiPreview) && t > (lo ?? loPreview!).getTime() && t < (hi ?? hiPreview)!.getTime()
    const isRangeStart = (loPreview ?? lo) && (loPreview ?? lo)!.getTime() === t

    if (isStart || isRangeStart) return 'bg-[#0B2545] text-white rounded-l-full'
    if (isEnd) return 'bg-[#0B2545] text-white rounded-r-full'
    if (inRange) return 'bg-[#3E92CC]/15 text-foreground'
    return 'hover:bg-muted text-foreground rounded-full'
  }

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center text-[10px] text-muted-foreground py-1 font-medium">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => (
          <div key={i} className="flex items-center justify-center h-7">
            {d ? (
              <button
                onClick={() => onDayClick(d)}
                onMouseEnter={() => onDayHover(d)}
                onMouseLeave={() => onDayHover(null)}
                className={`w-full h-7 text-xs font-medium transition-colors ${cls(d)}`}
              >
                {d.getDate()}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

type Props = {
  value?: DatePreset
  onChange: (range: DateRange) => void
  size?: 'sm' | 'md'
}

export function DateFilter({ value = 'month', onChange, size = 'md' }: Props) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<DatePreset>(value)
  const [showCal, setShowCal] = useState(false)

  // calendar state
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [rangeStart, setRangeStart] = useState<Date | null>(null)
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null)
  const [hovered, setHovered] = useState<Date | null>(null)

  const activePreset = presets.find((p) => p.id === active)
  const range = active !== 'custom' ? getRange(active) : null

  function select(preset: DatePreset) {
    if (preset === 'custom') { setShowCal(true); return }
    setActive(preset)
    setShowCal(false)
    const { from, to } = getRange(preset)
    onChange({ preset, label: presets.find((p) => p.id === preset)!.label, from, to })
    setOpen(false)
  }

  function handleDayClick(d: Date) {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(d); setRangeEnd(null)
    } else {
      const start = rangeStart <= d ? rangeStart : d
      const end   = rangeStart <= d ? d : rangeStart
      setRangeEnd(end); setRangeStart(start)
      const label = `${fmtDate(start)} – ${fmtDate(end)}`
      setActive('custom')
      onChange({ preset: 'custom', label, from: start, to: end })
      setOpen(false)
      setShowCal(false)
    }
  }

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  const displayLabel = active === 'custom'
    ? (rangeStart && rangeEnd ? `${fmtDate(rangeStart)} – ${fmtDate(rangeEnd)}` : 'Personalizado')
    : (activePreset?.label ?? 'Período')

  const rangeLabel = range ? `${fmtDate(range.from)} – ${fmtDate(range.to)}` : null

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
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setShowCal(false) }} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-2xl shadow-soft overflow-hidden"
            style={{ width: showCal ? 280 : 220 }}>

            {!showCal ? (
              <div className="p-2 space-y-0.5">
                {presets.map((p) => (
                  <button key={p.id} onClick={() => select(p.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                      active === p.id ? 'bg-[#0B2545] text-white' : 'hover:bg-muted text-foreground'
                    }`}>
                    <span>{p.label}</span>
                    {active === p.id && <div className="w-1.5 h-1.5 rounded-full bg-[#3E92CC]" />}
                  </button>
                ))}
                <div className="border-t border-border mt-1 pt-1">
                  <button onClick={() => select('custom')}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-muted text-foreground flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#3E92CC]" />
                    Calendário personalizado…
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                {/* header */}
                <div className="flex items-center justify-between mb-3">
                  <button onClick={prevMonth} className="p-1 hover:bg-muted rounded-lg transition-colors">
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <span className="text-sm font-semibold text-foreground">
                    {MONTHS_PT[calMonth]} {calYear}
                  </span>
                  <button onClick={nextMonth} className="p-1 hover:bg-muted rounded-lg transition-colors">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <CalendarMonth
                  year={calYear} month={calMonth}
                  rangeStart={rangeStart} rangeEnd={rangeEnd} hovered={hovered}
                  onDayClick={handleDayClick} onDayHover={setHovered}
                />

                {rangeStart && !rangeEnd && (
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    Clique no segundo dia para definir o período
                  </p>
                )}

                {rangeStart && rangeEnd && (
                  <div className="mt-3 pt-3 border-t border-border text-[11px] text-center text-muted-foreground">
                    {fmtDate(rangeStart)} – {fmtDate(rangeEnd)}
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setShowCal(false); setRangeStart(null); setRangeEnd(null) }}
                    className="flex-1 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                    Voltar
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
