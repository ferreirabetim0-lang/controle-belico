'use client'

import { DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { type Transaction } from '@/lib/api'

export function ClientFinancial({ clientId, transactions }: { clientId: string; transactions: Transaction[] }) {
  const totalIncome = transactions.filter((t) => t.type === 'INCOME' && t.status === 'PAID').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === 'EXPENSE' && t.status === 'PAID').reduce((sum, t) => sum + t.amount, 0)
  const totalPending = transactions.filter((t) => t.status === 'PENDING').reduce((sum, t) => sum + t.amount, 0)

  if (transactions.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground space-y-2">
        <DollarSign className="w-10 h-10 mx-auto opacity-20" />
        <p className="text-sm">Nenhum lançamento financeiro</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card border-l-4 border-l-[#00C853]">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#00C853]" />
            <span className="text-xs text-muted-foreground">Recebido</span>
          </div>
          <div className="text-2xl font-bold text-[#00C853]">{formatCurrency(totalIncome)}</div>
        </div>
        <div className="stat-card border-l-4 border-l-[#D50000]">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-[#D50000]" />
            <span className="text-xs text-muted-foreground">Despesas</span>
          </div>
          <div className="text-2xl font-bold text-[#D50000]">{formatCurrency(totalExpenses)}</div>
        </div>
        <div className="stat-card border-l-4 border-l-[#FFAB00]">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[#FFAB00]" />
            <span className="text-xs text-muted-foreground">Pendente</span>
          </div>
          <div className="text-2xl font-bold text-[#FFAB00]">{formatCurrency(totalPending)}</div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-bold text-foreground">Lançamentos</h3>
        </div>
        <div className="divide-y divide-border">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-4 px-5 py-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === 'INCOME' ? 'bg-[#00C853]/10' : 'bg-[#D50000]/10'}`}>
                {t.type === 'INCOME' ? (
                  <TrendingUp className="w-4 h-4 text-[#00C853]" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-[#D50000]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{t.description}</div>
                <div className="text-xs text-muted-foreground">
                  {t.paidAt
                    ? `Pago em ${new Date(t.paidAt).toLocaleDateString('pt-BR')}`
                    : t.dueDate
                      ? `Vence em ${new Date(t.dueDate).toLocaleDateString('pt-BR')}`
                      : 'Aguardando pagamento'}
                  {t.category && ` · ${t.category}`}
                </div>
              </div>
              <div className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-[#00C853]' : 'text-[#D50000]'}`}>
                {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
              </div>
              <Badge variant={t.status === 'PAID' ? 'success' : 'warning'}>
                {t.status === 'PAID' ? 'Pago' : 'Pendente'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
