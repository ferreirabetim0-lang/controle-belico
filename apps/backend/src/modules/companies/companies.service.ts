import { Injectable } from '@nestjs/common'
import { SupabaseService } from '../../supabase/supabase.service'

@Injectable()
export class CompaniesService {
  constructor(private sb: SupabaseService) {}

  async findOne(id: string) {
    const { data } = await this.sb.from('companies')
      .select('*, subscription:subscriptions(*, plan:plans(*))')
      .eq('id', id).single()
    return data
  }

  async update(id: string, dto: any) {
    const { data, error } = await this.sb.from('companies')
      .update({ ...dto, updatedAt: new Date().toISOString() })
      .eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  }

  async getDashboardStats(companyId: string) {
    const [
      { count: totalClients },
      { count: activeProcesses },
      { count: completedProcesses },
      { count: openNotifications },
    ] = await Promise.all([
      this.sb.from('clients').select('id', { count: 'exact', head: true }).eq('companyId', companyId).eq('isActive', true),
      this.sb.from('processes').select('id', { count: 'exact', head: true }).eq('companyId', companyId).in('status', ['IN_PROGRESS', 'WAITING_ANALYSIS', 'IN_QUEUE', 'IN_ANALYSIS']),
      this.sb.from('processes').select('id', { count: 'exact', head: true }).eq('companyId', companyId).eq('status', 'COMPLETED'),
      this.sb.from('notifications').select('id', { count: 'exact', head: true }).eq('companyId', companyId).eq('status', 'UNREAD'),
    ])

    return {
      totalClients: totalClients ?? 0,
      activeProcesses: activeProcesses ?? 0,
      completedProcesses: completedProcesses ?? 0,
      openNotifications: openNotifications ?? 0,
    }
  }
}
