'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Plus, Download, Search, Loader2, X, Pencil, Trash2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { DateFilter, DateRange } from '@/components/ui/date-filter'
import { useApi } from '@/hooks/use-api'
import { financial as financialApi, dashboard as dashboardApi, type Transaction } from '@/lib/api'

const inputCls = 'w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20'
const labelCls = 'text-xs font-semibold text-muted-foreground mb-1 block'

const CATEGORIES_INCOME = ['Honorários CR', 'Honorários CRAF', 'Honorários GT', 'Renovação', 'Consultoria', 'Outros']
const CATEGORIES_EXPENSE = ['Aluguel', 'Salários', 'Impostos', 'Despachante', 'Material', 'Marketing', 'Outros']
const ALL_CATEGORIES = [...new Set([...CATEGORIES_INCOME, ...CATEGORIES_EXPENSE])]

const statusConfig = {
  PAID: { label: 'Pago', badge: 'success' as const },
  PENDING: { label: 'Pendente', badge: 'warning' as const },
  OVERDUE: { label: 'Atrasado', badge: 'danger' as const },
  CANCELLED: { label: 'Cancelado', badge: 'secondary' as const },
}

// ─── Modal (create + edit) ────────────────────────────────────────────────────

function LancamentoModal({ initial, onClose, onSuccess }: {
  initial?: Transaction; onClose: () => void; onSuccess: () => void
}) {
  const isEdit = !!initial
  const [form, setForm] = useState({
    type: (initial?.type ?? 'INCOME') as 'INCOME' | 'EXPENSE',
    description: initial?.description ?? '',
    amount: initial?.amount ? String(initial.amount) : '',
    category: initial?.category ?? '',
    status: initial?.status ?? 'PENDING',
    dueDate: initial?.dueDate ? initial.dueDate.split('T')[0] : '',
    paidAt: initial?.paidAt ? initial.paidAt.split('T')[0] : '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = form.type === 'INCOME' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        type: form.type,
        description: form.description,
        amount: parseFloat(form.amount.replace(',', '.')),
        category: form.category || 'Outros',
        status: form.status,
        dueDate: form.dueDate || undefined,
        paidAt: form.paidAt ? new Date(form.paidAt + 'T12:00:00').toISOString() : undefined,
      }
      if (isEdit) {
        await financialApi.update(initial!.id, payload)
      } else {
        await financialApi.create(payload)
      }
      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar lançamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-foreground text-lg">{isEdit ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelCls}>TIPO *</label>
            <div className="flex gap-2">
              {(['INCOME', 'EXPENSE'] as const).map((t) => (
                <button type="button" key={t}
                  onClick={() => setForm({ ...form, type: t, category: '' })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                    form.type === t
                      ? t === 'INCOME' ? 'border-[#00C853] bg-[#00C853]/10 text-[#00C853]' : 'border-[#D50000] bg-[#D50000]/10 text-[#D50000]'
                      : 'border-border text-muted-foreground hover:border-muted-foreground'
                  }`}>
                  {t === 'INCOME' ? '↑ Receita' : '↓ Despesa'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>DESCRIÇÃO *</label>
            <input required value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Ex: Honorários CR - João Silva" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>VALOR (R$) *</label>
              <input required value={form.amount} onChange={(e) => set('amount', e.target.value)}
                placeholder="0,00" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>STATUS</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls}>
                <option value="PENDING">Pendente</option>
                <option value="PAID">Pago</option>
                <option value="OVERDUE">Atrasado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>CATEGORIA</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
              <option value="">Selecionar categoria</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>VENCIMENTO</label>
              <input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>DATA DE PAGAMENTO</label>
              <input type="date" value={form.paidAt} onChange={(e) => set('paidAt', e.target.value)} className={inputCls} />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-xl">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}
              className={`flex-1 ${form.type === 'INCOME' ? 'bg-[#00C853] hover:bg-[#00C853]/90' : 'bg-[#D50000] hover:bg-[#D50000]/90'}`}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? 'Salvar Alterações' : 'Salvar Lançamento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCsv(rows: Transaction[]) {
  const headers = ['Tipo', 'Descrição', 'Cliente', 'Categoria', 'Valor', 'Status', 'Vencimento', 'Pago em', 'Criado em']
  const lines = rows.map((t) => [
    t.type === 'INCOME' ? 'Receita' : 'Despesa',
    `"${(t.description ?? '').replace(/"/g, '""')}"`,
    `"${((t.client as any)?.name ?? '').replace(/"/g, '""')}"`,
    t.category ?? '',
    String(Number(t.amount).toFixed(2)).replace('.', ','),
    statusConfig[t.status as keyof typeof statusConfig]?.label ?? t.status,
    t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : '',
    t.paidAt ? new Date(t.paidAt).toLocaleDateString('pt-BR') : '',
    t.createdAt ? new Date(t.createdAt).toLocaleDateString('pt-BR') : '',
  ].join(';'))

  const csv = '﻿' + [headers.join(';'), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lancamentos_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function FinancialPage() {
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Transaction | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = () => setRefreshKey((k) => k + 1)

  const { data: historyData, loading: loadingHistory } = useApi(() => dashboardApi.monthlyHistory(), [refreshKey])
  const { data: transactionList, loading: loadingTx } = useApi(() => financialApi.list(), [refreshKey])

  const transactions: Transaction[] = transactionList ?? []

  const filtered = useMemo(() => transactions.filter((t) => {
    if (typeFilter && t.type !== typeFilter) return false
    if (statusFilter && t.status !== statusFilter) return false
    if (categoryFilter && t.category !== categoryFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const matchDesc = t.description?.toLowerCase().includes(q)
      const matchClient = (t.client as any)?.name?.toLowerCase().includes(q)
      if (!matchDesc && !matchClient) return false
    }
    if (dateRange) {
      const date = new Date(t.paidAt ?? t.dueDate ?? t.createdAt)
      const from = new Date(dateRange.from); from.setHours(0, 0, 0, 0)
      const to = new Date(dateRange.to); to.setHours(23, 59, 59, 999)
      if (date < from || date > to) return false
    }
    return true
  }), [transactions, typeFilter, statusFilter, categoryFilter, search, dateRange])

  async function handleDelete(id: string) {
    if (!confirm('Excluir este lançamento?')) return
    setDeletingId(id)
    try {
      await financialApi.remove(id)
      refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir')
    } finally {
      setDeletingId(null)
    }
  }

  const hasFilters = !!(typeFilter || statusFilter || categoryFilter || search || dateRange)

  // KPIs calculados das transações filtradas (refletem todos os filtros ativos)
  const kpiStats = useMemo(() => {
    const income = filtered.filter((t) => t.type === 'INCOME' && t.status === 'PAID').reduce((s, t) => s + Number(t.amount), 0)
    const expenses = filtered.filter((t) => t.type === 'EXPENSE' && t.status === 'PAID').reduce((s, t) => s + Number(t.amount), 0)
    const profit = income - expenses
    const margin = income > 0 ? (profit / income) * 100 : 0
    return { totalIncome: income, totalExpenses: expenses, profit, margin }
  }, [filtered])

  const periodLabel = dateRange ? dateRange.label : 'do Período'

  return (
    <div className="space-y-8 animate-fade-in">
      {(showModal || editTarget) && (
        <LancamentoModal
          initial={editTarget ?? undefined}
          onClose={() => { setShowModal(false); setEditTarget(null) }}
          onSuccess={refresh}
        />
      )}

      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground text-sm mt-1">Receitas, despesas e fluxo de caixa</p>
        </div>
        <div className="flex gap-2">
          <DateFilter value="month" onChange={setDateRange} />
          <Button variant="outline" size="sm" className="gap-2" onClick={() => exportCsv(filtered)}>
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
          <Button size="sm" className="gap-2 bg-[#0B2545] hover:bg-[#13315C]" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" /> Novo Lançamento
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: `Receita ${periodLabel}`, value: kpiStats.totalIncome, icon: TrendingUp, color: 'text-[#00C853]', bg: 'bg-[#00C853]/10', border: 'border-l-[#00C853]' },
          { label: `Despesas ${periodLabel}`, value: kpiStats.totalExpenses, icon: TrendingDown, color: 'text-[#D50000]', bg: 'bg-[#D50000]/10', border: 'border-l-[#D50000]' },
          { label: `Lucro ${periodLabel}`, value: kpiStats.profit, icon: DollarSign, color: 'text-[#3E92CC]', bg: 'bg-[#3E92CC]/10', border: 'border-l-[#3E92CC]' },
          { label: 'Margem', value: null, margin: kpiStats.margin, icon: TrendingUp, color: 'text-[#FFAB00]', bg: 'bg-[#FFAB00]/10', border: 'border-l-[#FFAB00]' },
        ].map((kpi) => (
          <div key={kpi.label} className={`stat-card border-l-4 ${kpi.border}`}>
            <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center mb-4`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <div className={`text-2xl font-bold ${kpi.color} mb-1 ${loadingTx ? 'animate-pulse' : ''}`}>
              {loadingTx ? '...' : kpi.value !== null ? formatCurrency(kpi.value) : `${kpi.margin?.toFixed(1)}%`}
            </div>
            <div className="text-xs text-muted-foreground">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border shadow-card">
          <div className="mb-5">
            <h3 className="font-bold text-foreground">Receita x Lucro x Despesas</h3>
            <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
          </div>
          {loadingHistory ? (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm animate-pulse">Carregando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={historyData ?? []}>
                <defs>
                  <linearGradient id="gradReceita2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3E92CC" stopOpacity={0.2} /><stop offset="95%" stopColor="#3E92CC" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradLucro2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C853" stopOpacity={0.2} /><stop offset="95%" stopColor="#00C853" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} formatter={(v: number) => [`R$ ${v.toLocaleString('pt-BR')}`, '']} />
                <Area type="monotone" dataKey="receita" stroke="#3E92CC" strokeWidth={2} fill="url(#gradReceita2)" />
                <Area type="monotone" dataKey="lucro" stroke="#00C853" strokeWidth={2} fill="url(#gradLucro2)" />
                <Area type="monotone" dataKey="despesas" stroke="#D50000" strokeWidth={1.5} fill="none" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
          <div className="mb-5">
            <h3 className="font-bold text-foreground">Por Tipo</h3>
            <p className="text-sm text-muted-foreground">{filtered.length} lançamentos filtrados</p>
          </div>
          {(() => {
            const inc = filtered.filter((t) => t.type === 'INCOME').length
            const exp = filtered.filter((t) => t.type === 'EXPENSE').length
            const pieData = [{ name: 'Receitas', value: inc }, { name: 'Despesas', value: exp }]
            return (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                      <Cell fill="#00C853" /><Cell fill="#D50000" />
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {[{ name: 'Receitas', count: inc, color: '#00C853' }, { name: 'Despesas', count: exp, color: '#D50000' }].map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">{item.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )
          })()}
        </div>
      </div>

      {/* Tabela de lançamentos */}
      <div className="bg-card rounded-2xl border border-border shadow-card">
        <div className="p-5 border-b border-border space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="font-bold text-foreground">
              Lançamentos
              {filtered.length !== transactions.length && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({filtered.length} de {transactions.length})
                </span>
              )}
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por descrição ou cliente..."
                className="pl-8 pr-3 py-2 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 w-64" />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium shrink-0">Tipo:</span>
            {[['', 'Todos'], ['INCOME', 'Receitas'], ['EXPENSE', 'Despesas']].map(([val, label]) => (
              <button key={val} onClick={() => setTypeFilter(val)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${typeFilter === val ? 'bg-[#0B2545] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {label}
              </button>
            ))}
            <span className="text-xs text-muted-foreground font-medium ml-2 shrink-0">Status:</span>
            {[['', 'Todos'], ['PAID', 'Pago'], ['PENDING', 'Pendente'], ['OVERDUE', 'Atrasado']].map(([val, label]) => (
              <button key={val} onClick={() => setStatusFilter(val)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${statusFilter === val ? 'bg-[#0B2545] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {label}
              </button>
            ))}
            <span className="text-xs text-muted-foreground font-medium ml-2 shrink-0">Categoria:</span>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg bg-muted border border-border text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20">
              <option value="">Todas</option>
              {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {hasFilters && (
              <button onClick={() => { setTypeFilter(''); setStatusFilter(''); setCategoryFilter(''); setSearch(''); setDateRange(null) }}
                className="px-3 py-1.5 text-xs rounded-lg text-[#D50000] bg-[#D50000]/10 hover:bg-[#D50000]/20 font-medium transition-all ml-auto">
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {loadingTx ? (
          <div className="py-12 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Carregando lançamentos...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Tipo', 'Cliente', 'Descrição', 'Categoria', 'Valor', 'Data', 'Status', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const cfg = statusConfig[t.status as keyof typeof statusConfig]
                  const clientName = (t.client as any)?.name ?? '—'
                  return (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'INCOME' ? 'bg-[#00C853]/10' : 'bg-[#D50000]/10'}`}>
                          {t.type === 'INCOME' ? <TrendingUp className="w-4 h-4 text-[#00C853]" /> : <TrendingDown className="w-4 h-4 text-[#D50000]" />}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground max-w-[120px] truncate">{clientName}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground max-w-[200px] truncate">{t.description}</td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {t.category ? <span className="bg-muted px-2 py-0.5 rounded-md">{t.category}</span> : '—'}
                      </td>
                      <td className={`px-5 py-3.5 text-sm font-bold ${t.type === 'INCOME' ? 'text-[#00C853]' : 'text-[#D50000]'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">
                        {t.paidAt ? new Date(t.paidAt).toLocaleDateString('pt-BR')
                          : t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR')
                          : new Date(t.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={cfg?.badge ?? 'secondary'}>{cfg?.label ?? t.status}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditTarget(t)}
                            className="p-1.5 rounded-lg hover:bg-[#3E92CC]/10 text-[#3E92CC] transition-colors"
                            title="Editar">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(t.id)} disabled={deletingId === t.id}
                            className="p-1.5 rounded-lg hover:bg-[#D50000]/10 text-[#D50000] transition-colors"
                            title="Excluir">
                            {deletingId === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-sm">
                {hasFilters ? 'Nenhum lançamento encontrado com os filtros aplicados.' : 'Nenhum lançamento cadastrado.'}
              </div>
            )}
          </div>
        )}

        {/* Totais do rodapé */}
        {filtered.length > 0 && (
          <div className="p-4 border-t border-border bg-muted/20 flex items-center gap-6 text-sm flex-wrap">
            <span className="text-muted-foreground font-medium">Totais filtrados:</span>
            <span className="font-bold text-[#00C853]">
              ↑ Receitas: {formatCurrency(filtered.filter((t) => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0))}
            </span>
            <span className="font-bold text-[#D50000]">
              ↓ Despesas: {formatCurrency(filtered.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0))}
            </span>
            <span className="font-bold text-[#3E92CC] ml-auto">
              Resultado: {formatCurrency(
                filtered.filter((t) => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0) -
                filtered.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
