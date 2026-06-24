'use client'

import { DollarSign, TrendingUp, TrendingDown, CheckCircle2, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const mockTransactions = [
  { id: '1', type: 'INCOME', description: 'Honorários — Processo CR', amount: 850, status: 'PAID', paidAt: '15/06/2026', method: 'PIX' },
  { id: '2', type: 'EXPENSE', description: 'Exame Psicológico', amount: 180, status: 'PAID', paidAt: '08/06/2026', method: 'PIX' },
  { id: '3', type: 'EXPENSE', description: 'GRU — Taxa SINARM', amount: 92.50, status: 'PENDING', paidAt: null, method: null },
  { id: '4', type: 'EXPENSE', description: 'Filiação ao Clube', amount: 120, status: 'PENDING', paidAt: null, method: null },
]

export function ClientFinancial({ clientId }: { clientId: string }) {
  const totalIncome = mockTransactions.filter((t) => t.type === 'INCOME' && t.status === 'PAID').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = mockTransactions.filter((t) => t.type === 'EXPENSE' && t.status === 'PAID').reduce((sum, t) => sum + t.amount, 0)
  const totalPending = mockTransactions.filter((t) => t.status === 'PENDING').reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      {/* Summary */}
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

      <Button className="gap-2 bg-[#0B2545] hover:bg-[#13315C]">
        <DollarSign className="w-4 h-4" /> Registrar Lançamento
      </Button>

      {/* Transactions */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-bold text-foreground">Lançamentos</h3>
        </div>
        <div className="divide-y divide-border">
          {mockTransactions.map((t) => (
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
                  {t.paidAt ? `Pago em ${t.paidAt}` : 'Aguardando pagamento'}
                  {t.method && ` · ${t.method}`}
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
