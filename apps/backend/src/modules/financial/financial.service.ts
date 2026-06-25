import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../../supabase/supabase.service'
import { v4 as uuidv4 } from 'uuid'

type FindAllFilters = {
  clientId?: string
  type?: string
  status?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  category?: string
}

@Injectable()
export class FinancialService {
  constructor(private sb: SupabaseService) {}

  async getDashboard(companyId: string) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

    const { data: incomeRows } = await this.sb.from('financial_transactions')
      .select('amount').eq('companyId', companyId).eq('type', 'INCOME').eq('status', 'PAID')
      .gte('paidAt', startOfMonth).lte('paidAt', endOfMonth)

    const { data: expenseRows } = await this.sb.from('financial_transactions')
      .select('amount').eq('companyId', companyId).eq('type', 'EXPENSE').eq('status', 'PAID')
      .gte('paidAt', startOfMonth).lte('paidAt', endOfMonth)

    const totalIncome = (incomeRows ?? []).reduce((sum, r) => sum + Number(r.amount), 0)
    const totalExpenses = (expenseRows ?? []).reduce((sum, r) => sum + Number(r.amount), 0)

    return {
      totalIncome, totalExpenses,
      profit: totalIncome - totalExpenses,
      margin: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
    }
  }

  async getMonthlyHistory(companyId: string) {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i))
      return { year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('pt-BR', { month: 'short' }) }
    })

    return Promise.all(months.map(async (m) => {
      const start = new Date(m.year, m.month - 1, 1).toISOString()
      const end = new Date(m.year, m.month, 0, 23, 59, 59).toISOString()

      const [{ data: incomeRows }, { data: expenseRows }] = await Promise.all([
        this.sb.from('financial_transactions').select('amount').eq('companyId', companyId)
          .eq('type', 'INCOME').eq('status', 'PAID').gte('paidAt', start).lte('paidAt', end),
        this.sb.from('financial_transactions').select('amount').eq('companyId', companyId)
          .eq('type', 'EXPENSE').eq('status', 'PAID').gte('paidAt', start).lte('paidAt', end),
      ])

      const inc = (incomeRows ?? []).reduce((s, r) => s + Number(r.amount), 0)
      const exp = (expenseRows ?? []).reduce((s, r) => s + Number(r.amount), 0)
      return { month: m.label, receita: inc, despesas: exp, lucro: inc - exp }
    }))
  }

  async findAll(companyId: string, filters: FindAllFilters = {}) {
    const { clientId, type, status, search, dateFrom, dateTo, category } = filters

    let q = this.sb.from('financial_transactions')
      .select('*, client:clients(name)').eq('companyId', companyId)

    if (clientId) q = q.eq('clientId', clientId)
    if (type) q = q.eq('type', type)
    if (status) q = q.eq('status', status)
    if (category) q = q.eq('category', category)
    if (search) q = q.ilike('description', `%${search}%`)
    if (dateFrom) q = q.gte('createdAt', new Date(dateFrom).toISOString())
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      q = q.lte('createdAt', to.toISOString())
    }

    const { data, error } = await q.order('createdAt', { ascending: false }).limit(500)
    if (error) throw new Error(error.message)
    return data ?? []
  }

  async create(companyId: string, dto: any) {
    const now = new Date().toISOString()
    const { data, error } = await this.sb.from('financial_transactions')
      .insert({ id: uuidv4(), ...dto, companyId, createdAt: now, updatedAt: now })
      .select().single()
    if (error) throw new Error(error.message)
    return data
  }

  async update(companyId: string, id: string, dto: any) {
    const { data: existing, error: findErr } = await this.sb.from('financial_transactions')
      .select('id').eq('id', id).eq('companyId', companyId).single()
    if (findErr || !existing) throw new NotFoundException('Lançamento não encontrado')

    const { id: _id, companyId: _c, createdAt: _ca, ...safe } = dto
    const { data, error } = await this.sb.from('financial_transactions')
      .update({ ...safe, updatedAt: new Date().toISOString() })
      .eq('id', id).select('*, client:clients(name)').single()
    if (error) throw new Error(error.message)
    return data
  }

  async remove(companyId: string, id: string) {
    const { data: existing, error: findErr } = await this.sb.from('financial_transactions')
      .select('id').eq('id', id).eq('companyId', companyId).single()
    if (findErr || !existing) throw new NotFoundException('Lançamento não encontrado')

    const { error } = await this.sb.from('financial_transactions').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }
}
