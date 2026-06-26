'use client'

import { useState, useMemo } from 'react'
import { Download, BarChart2, Users, Shield, DollarSign, FileText, TrendingUp, Loader2 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { DateFilter, DateRange } from '@/components/ui/date-filter'
import { useApi } from '@/hooks/use-api'
import { clients, processes as processesApi, financial, type Client, type Process, type Transaction } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCSV(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  LEAD: 'Lead', CONTACT: 'Contato', NEGOTIATION: 'Negociação',
  PAYMENT: 'Pagamento', DOCUMENTATION: 'Documentação',
  CR: 'CR', CRAF: 'CRAF', GT: 'GT', COMPLETED: 'Finalizado',
  ARCHIVED: 'Arquivado', LOST: 'Perdido',
}

const STATUS_COLORS: Record<string, string> = {
  LEAD: '#94a3b8', CONTACT: '#64748b', NEGOTIATION: '#FFAB00',
  PAYMENT: '#F97316', DOCUMENTATION: '#3E92CC',
  CR: '#134074', CRAF: '#FFAB00', GT: '#0B2545',
  COMPLETED: '#00C853', ARCHIVED: '#6b7280', LOST: '#D50000',
}

const TYPE_COLORS: Record<string, string> = { CR: '#3E92CC', CRAF: '#FFAB00', GT: '#134074' }

function inRange(dateStr: string, range: DateRange | null) {
  if (!range) return true
  const d = new Date(dateStr)
  const from = new Date(range.from); from.setHours(0, 0, 0, 0)
  const to = new Date(range.to); to.setHours(23, 59, 59, 999)
  return d >= from && d <= to
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | null>(null)

  const { data: clientsData, loading: loadingClients } = useApi(() => clients.list({ limit: 1000 }), [])
  const { data: processesList, loading: loadingProcesses } = useApi(() => processesApi.list(), [])
  const { data: transactionsList, loading: loadingFinancial } = useApi(() => financial.list(), [])
  const { data: monthlyHistory, loading: loadingMonthly } = useApi(() => financial.monthlyHistory(), [])

  const allClients: Client[] = clientsData?.data ?? []
  const allProcesses: Process[] = processesList ?? []
  const allTransactions: Transaction[] = transactionsList ?? []

  const loading = loadingClients || loadingProcesses || loadingFinancial

  // Apply date filter
  const filteredClients = useMemo(() =>
    allClients.filter((c) => inRange(c.createdAt, dateRange)), [allClients, dateRange])

  const filteredProcesses = useMemo(() =>
    allProcesses.filter((p) => inRange(p.createdAt, dateRange)), [allProcesses, dateRange])

  const filteredTransactions = useMemo(() =>
    allTransactions.filter((t) => inRange(t.createdAt, dateRange)), [allTransactions, dateRange])

  // Clients by status
  const clientsByStatus = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredClients.forEach((c) => { counts[c.status] = (counts[c.status] ?? 0) + 1 })
    return Object.entries(counts)
      .map(([status, value]) => ({ name: STATUS_LABELS[status] ?? status, value, color: STATUS_COLORS[status] ?? '#94a3b8' }))
      .sort((a, b) => b.value - a.value)
  }, [filteredClients])

  // Processes by type
  const processByType = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = {}
    filteredProcesses.forEach((p) => {
      if (!counts[p.type]) counts[p.type] = { total: 0, completed: 0 }
      counts[p.type].total++
      if (p.status === 'COMPLETED' || p.progress === 100) counts[p.type].completed++
    })
    return Object.entries(counts).map(([type, v]) => ({ name: type, ...v, color: TYPE_COLORS[type] ?? '#94a3b8' }))
  }, [filteredProcesses])

  // Monthly clients chart (last 6 months or filtered range)
  const monthlyClientsChart = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i))
      return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleString('pt-BR', { month: 'short' }) }
    })
    return months.map((m) => ({
      month: m.label.charAt(0).toUpperCase() + m.label.slice(1).replace('.', ''),
      novos: allClients.filter((c) => {
        const d = new Date(c.createdAt)
        return d.getFullYear() === m.year && d.getMonth() === m.month
      }).length,
      finalizados: allProcesses.filter((p) => {
        const d = new Date(p.createdAt)
        return d.getFullYear() === m.year && d.getMonth() === m.month && p.status === 'COMPLETED'
      }).length,
    }))
  }, [allClients, allProcesses])

  // Financial summary
  const financialSummary = useMemo(() => {
    const income = filteredTransactions.filter((t) => t.type === 'INCOME' && t.status === 'PAID').reduce((s, t) => s + Number(t.amount), 0)
    const expenses = filteredTransactions.filter((t) => t.type === 'EXPENSE' && t.status === 'PAID').reduce((s, t) => s + Number(t.amount), 0)
    return { income, expenses, profit: income - expenses }
  }, [filteredTransactions])

  // ── CSV exports ──────────────────────────────────────────────────────────────

  function exportClientes() {
    exportCSV(`clientes_${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Nome', 'CPF', 'Telefone', 'E-mail', 'Cidade', 'Estado', 'Status', 'Cadastro'],
      ...filteredClients.map((c) => [
        c.name, c.cpf ?? '', c.phone ?? '', c.email ?? '',
        c.city ?? '', c.state ?? '', STATUS_LABELS[c.status] ?? c.status,
        new Date(c.createdAt).toLocaleDateString('pt-BR'),
      ]),
    ])
  }

  function exportProcessos() {
    exportCSV(`processos_${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Tipo', 'Cliente', 'Status', 'Progresso', 'Iniciado'],
      ...filteredProcesses.map((p) => [
        p.type, (p as any).client?.name ?? '', p.status,
        `${p.progress}%`, new Date(p.createdAt).toLocaleDateString('pt-BR'),
      ]),
    ])
  }

  function exportFinanceiro() {
    exportCSV(`financeiro_${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Tipo', 'Categoria', 'Descrição', 'Valor', 'Status', 'Vencimento', 'Pagamento'],
      ...filteredTransactions.map((t) => [
        t.type === 'INCOME' ? 'Receita' : 'Despesa',
        t.category ?? '', t.description ?? '',
        formatCurrency(Number(t.amount)), t.status,
        t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : '',
        t.paidAt ? new Date(t.paidAt).toLocaleDateString('pt-BR') : '',
      ]),
    ])
  }

  function exportTudo() {
    exportClientes()
    setTimeout(() => exportProcessos(), 300)
    setTimeout(() => exportFinanceiro(), 600)
  }

  const reportCards = [
    { icon: Users,     label: 'Relatório de Clientes',  description: `${filteredClients.length} clientes no período`,         color: 'bg-[#3E92CC]/10 text-[#3E92CC]',  action: exportClientes },
    { icon: Shield,    label: 'Relatório de Processos', description: `${filteredProcesses.length} processos no período`,       color: 'bg-[#134074]/10 text-[#134074]',  action: exportProcessos },
    { icon: DollarSign,label: 'Relatório Financeiro',   description: `Lucro: ${formatCurrency(financialSummary.profit)}`,      color: 'bg-[#00C853]/10 text-[#00C853]',  action: exportFinanceiro },
    { icon: FileText,  label: 'Rel. Financeiro Completo',description: `${filteredTransactions.length} lançamentos`,           color: 'bg-[#FFAB00]/10 text-[#FFAB00]',  action: exportFinanceiro },
    { icon: TrendingUp,label: 'Clientes por Status',    description: `${clientsByStatus.length} status distintos`,            color: 'bg-[#0B2545]/10 text-[#0B2545]',  action: () => exportCSV('clientes-por-status.csv', [['Status', 'Quantidade'], ...clientsByStatus.map((c) => [c.name, String(c.value)])]) },
    { icon: BarChart2, label: 'Processos por Tipo',     description: processByType.map((p) => `${p.name}: ${p.total}`).join(' · ') || 'Sem processos', color: 'bg-[#D50000]/10 text-[#D50000]', action: () => exportCSV('processos-por-tipo.csv', [['Tipo', 'Total', 'Concluídos', '% Conclusão'], ...processByType.map((p) => [p.name, String(p.total), String(p.completed), `${p.total ? Math.round((p.completed / p.total) * 100) : 0}%`])]) },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? 'Carregando...' : `${filteredClients.length} clientes · ${filteredProcesses.length} processos · ${filteredTransactions.length} lançamentos`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateFilter value="month" onChange={setDateRange} />
          <Button variant="outline" size="sm" className="gap-2" onClick={exportTudo} disabled={loading}>
            <Download className="w-4 h-4" /> Exportar tudo
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Carregando dados...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Clientes',          value: filteredClients.length,                     color: 'text-[#3E92CC]',  border: 'border-l-[#3E92CC]' },
              { label: 'Processos',         value: filteredProcesses.length,                   color: 'text-[#134074]',  border: 'border-l-[#134074]' },
              { label: 'Processos Concluídos', value: filteredProcesses.filter((p) => p.status === 'COMPLETED').length, color: 'text-[#00C853]', border: 'border-l-[#00C853]' },
              { label: 'Receita Líquida',   value: formatCurrency(financialSummary.profit),    color: financialSummary.profit >= 0 ? 'text-[#00C853]' : 'text-[#D50000]', border: 'border-l-[#FFAB00]' },
            ].map((kpi) => (
              <div key={kpi.label} className={`stat-card border-l-4 ${kpi.border}`}>
                <div className={`text-2xl font-extrabold ${kpi.color} mb-1`}>{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Report cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {reportCards.map((r) => (
              <button key={r.label} onClick={r.action}
                className="bg-card rounded-2xl p-5 border border-border shadow-card hover:shadow-soft transition-all text-left group hover:border-[#3E92CC]/30">
                <div className={`w-10 h-10 ${r.color} rounded-xl flex items-center justify-center mb-4`}>
                  <r.icon className="w-5 h-5" />
                </div>
                <div className="text-sm font-semibold text-foreground mb-1">{r.label}</div>
                <div className="text-xs text-muted-foreground">{r.description}</div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-[#3E92CC] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="w-3 h-3" /> Exportar CSV
                </div>
              </button>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Monthly chart */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
              <div className="mb-5">
                <h3 className="font-bold text-foreground">Novos Clientes vs Processos Concluídos</h3>
                <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
              </div>
              {loadingMonthly ? (
                <div className="h-[220px] flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyClientsChart} barSize={14} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="novos" name="Novos Clientes" fill="#3E92CC" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="finalizados" name="Proc. Finalizados" fill="#00C853" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Clients by status */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
              <div className="mb-5">
                <h3 className="font-bold text-foreground">Clientes por Status</h3>
                <p className="text-sm text-muted-foreground">{filteredClients.length} clientes no período</p>
              </div>
              {clientsByStatus.length === 0 ? (
                <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">Nenhum cliente no período</div>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={180}>
                    <PieChart>
                      <Pie data={clientsByStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                        {clientsByStatus.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid hsl(var(--border))' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2 overflow-y-auto max-h-[180px]">
                    {clientsByStatus.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="font-semibold text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Financial chart */}
          {monthlyHistory && monthlyHistory.length > 0 && (
            <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground">Financeiro — Últimos 6 Meses</h3>
                  <p className="text-sm text-muted-foreground">Receita · Despesas · Lucro</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={exportFinanceiro}>
                  <Download className="w-3 h-3" /> CSV
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyHistory} barSize={14} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid hsl(var(--border))' }}
                    formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="receita" name="Receita" fill="#00C853" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="#D50000" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lucro" name="Lucro" fill="#3E92CC" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Process stats table */}
          {processByType.length > 0 && (
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-foreground">Processos por Tipo</h3>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={exportProcessos}>
                  <Download className="w-3 h-3" /> Exportar CSV
                </Button>
              </div>
              <div className="divide-y divide-border">
                {processByType.map((pt) => (
                  <div key={pt.name} className="flex items-center gap-6 px-5 py-5">
                    <div className="w-12 text-center">
                      <div className="text-xl font-extrabold text-foreground">{pt.name}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
                        <span>{pt.completed} de {pt.total} finalizados</span>
                        <span className="font-semibold text-foreground">{pt.total ? Math.round((pt.completed / pt.total) * 100) : 0}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${pt.total ? (pt.completed / pt.total) * 100 : 0}%`, background: pt.color }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-foreground">{pt.total} total</div>
                      <div className="text-xs text-muted-foreground">{pt.total - pt.completed} em andamento</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
