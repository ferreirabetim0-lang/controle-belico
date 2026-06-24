'use client'

import { useState } from 'react'
import {
  DollarSign, TrendingUp, Clock, Plus, X, Loader2,
  CreditCard, Banknote, Smartphone, Building2, Barcode, AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { useApi } from '@/hooks/use-api'
import { financial, type Transaction } from '@/lib/api'

const PAYMENT_METHODS = [
  { value: 'PIX', label: 'PIX', icon: Smartphone },
  { value: 'Dinheiro', label: 'Dinheiro', icon: Banknote },
  { value: 'Cartão de Crédito', label: 'Crédito', icon: CreditCard },
  { value: 'Cartão de Débito', label: 'Débito', icon: CreditCard },
  { value: 'Transferência', label: 'Transferência', icon: Building2 },
  { value: 'Boleto', label: 'Boleto', icon: Barcode },
]

const inputCls = 'w-full px-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20'
const labelCls = 'text-xs font-semibold text-muted-foreground mb-1.5 block'

function NovoLancamentoModal({ clientId, onClose, onSuccess }: {
  clientId: string; onClose: () => void; onSuccess: () => void
}) {
  const [form, setForm] = useState({
    amountPaid: '',
    paidAt: new Date().toISOString().split('T')[0],
    paymentMethod: 'PIX',
    amountOwed: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.amountPaid && !form.amountOwed) {
      setError('Informe pelo menos o valor pago ou o valor devido.')
      return
    }
    setLoading(true)
    try {
      const now = new Date().toISOString()

      if (form.amountPaid && parseFloat(form.amountPaid) > 0) {
        await financial.create({
          type: 'INCOME',
          status: 'PAID',
          clientId,
          amount: parseFloat(form.amountPaid.replace(',', '.')),
          category: form.paymentMethod,
          description: form.description || `Pagamento via ${form.paymentMethod}`,
          paidAt: form.paidAt ? new Date(form.paidAt + 'T12:00:00').toISOString() : now,
        })
      }

      if (form.amountOwed && parseFloat(form.amountOwed) > 0) {
        await financial.create({
          type: 'INCOME',
          status: 'PENDING',
          clientId,
          amount: parseFloat(form.amountOwed.replace(',', '.')),
          category: form.paymentMethod,
          description: form.description ? `[SALDO DEVEDOR] ${form.description}` : 'Saldo devedor',
          dueDate: now,
        })
      }

      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar lançamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-bold text-foreground">Novo Lançamento Financeiro</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Registre pagamento recebido e/ou saldo devedor</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Forma de pagamento */}
          <div>
            <label className={labelCls}>FORMA DE PAGAMENTO</label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => set('paymentMethod', m.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    form.paymentMethod === m.value
                      ? 'bg-[#0B2545] border-[#0B2545] text-white'
                      : 'bg-muted border-border text-muted-foreground hover:border-[#0B2545]/40'
                  }`}
                >
                  <m.icon className="w-3.5 h-3.5 shrink-0" />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Valores */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                <span className="text-[#00C853]">↑</span> VALOR PAGO (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amountPaid}
                  onChange={(e) => set('amountPaid', e.target.value)}
                  placeholder="0,00"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>
                <span className="text-[#D50000]">↓</span> VALOR QUE DEVE (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amountOwed}
                  onChange={(e) => set('amountOwed', e.target.value)}
                  placeholder="0,00"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>
          </div>

          {/* Data de pagamento */}
          <div>
            <label className={labelCls}>DATA DO PAGAMENTO</label>
            <input
              type="date"
              value={form.paidAt}
              onChange={(e) => set('paidAt', e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Observação */}
          <div>
            <label className={labelCls}>OBSERVAÇÃO</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Ex: Entrada do processo CR, parcela 1/3..."
              className={`${inputCls} resize-none`}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-[#D50000] bg-[#D50000]/10 px-3 py-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-[#0B2545] hover:bg-[#13315C]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Registrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ClientFinancial({ clientId }: { clientId: string }) {
  const [showModal, setShowModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const { data: transactions, loading } = useApi(
    () => financial.list({ clientId }),
    [clientId, refreshKey],
  )

  const list: Transaction[] = transactions ?? []
  const totalPaid   = list.filter((t) => t.status === 'PAID').reduce((s, t) => s + t.amount, 0)
  const totalOwed   = list.filter((t) => t.status === 'PENDING').reduce((s, t) => s + t.amount, 0)
  const balance     = totalPaid - totalOwed

  return (
    <div className="space-y-6">
      {showModal && (
        <NovoLancamentoModal
          clientId={clientId}
          onClose={() => setShowModal(false)}
          onSuccess={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border p-4 border-l-4 border-l-[#00C853]">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#00C853]" />
            <span className="text-xs text-muted-foreground">Total Pago</span>
          </div>
          <div className="text-2xl font-bold text-[#00C853]">{formatCurrency(totalPaid)}</div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 border-l-4 border-l-[#D50000]">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-[#D50000]" />
            <span className="text-xs text-muted-foreground">Saldo Devedor</span>
          </div>
          <div className="text-2xl font-bold text-[#D50000]">{formatCurrency(totalOwed)}</div>
        </div>
        <div className={`bg-card rounded-2xl border border-border p-4 border-l-4 ${balance >= 0 ? 'border-l-[#3E92CC]' : 'border-l-[#FFAB00]'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[#3E92CC]" />
            <span className="text-xs text-muted-foreground">Saldo</span>
          </div>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-[#3E92CC]' : 'text-[#FFAB00]'}`}>
            {formatCurrency(Math.abs(balance))}
          </div>
        </div>
      </div>

      {/* Lista de lançamentos */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground">Lançamentos</h3>
          <Button size="sm" className="gap-2 bg-[#0B2545] hover:bg-[#13315C]" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" /> Novo Lançamento
          </Button>
        </div>

        {loading && list.length === 0 ? (
          <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        ) : list.length === 0 ? (
          <div className="py-14 text-center text-muted-foreground space-y-3">
            <DollarSign className="w-10 h-10 mx-auto opacity-20" />
            <p className="text-sm">Nenhum lançamento registrado</p>
            <Button size="sm" variant="outline" onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" /> Registrar primeiro lançamento
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {list.map((t) => {
              const isPaid = t.status === 'PAID'
              const isPending = t.status === 'PENDING'
              return (
                <div key={t.id} className="flex items-center gap-4 px-5 py-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isPaid ? 'bg-[#00C853]/10' : 'bg-[#D50000]/10'
                  }`}>
                    {isPaid
                      ? <TrendingUp className="w-4 h-4 text-[#00C853]" />
                      : <AlertCircle className="w-4 h-4 text-[#D50000]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {t.description?.replace('[SALDO DEVEDOR] ', '') || (isPaid ? 'Pagamento recebido' : 'Saldo devedor')}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap mt-0.5">
                      {t.paidAt && (
                        <span>{new Date(t.paidAt).toLocaleDateString('pt-BR')}</span>
                      )}
                      {t.category && (
                        <span className="bg-muted px-1.5 py-0.5 rounded-md">{t.category}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-sm font-bold ${isPaid ? 'text-[#00C853]' : 'text-[#D50000]'}`}>
                      {isPaid ? '+' : '-'}{formatCurrency(t.amount)}
                    </div>
                    <Badge variant={isPaid ? 'success' : 'danger'} className="mt-1">
                      {isPaid ? 'Pago' : 'Deve'}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
