import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import * as ws from 'ws'

@Injectable()
export class SupabaseService {
  private client: SupabaseClient

  constructor(private config: ConfigService) {
    const url = this.config.get('SUPABASE_URL') ?? process.env.SUPABASE_URL
    const key = this.config.get('SUPABASE_SERVICE_ROLE_KEY') ?? process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error(`Missing Supabase config. URL=${url ? 'ok' : 'missing'} KEY=${key ? 'ok' : 'missing'}`)
    this.client = createClient(
      url,
      key,
      {
        auth: { persistSession: false },
        realtime: { transport: ws as unknown as typeof WebSocket },
      },
    )
  }

  get db() {
    return this.client
  }

  from(table: string) {
    return this.client.from(table)
  }

  async query(sql: string) {
    const { data, error } = await this.client.rpc('exec_sql', { sql })
    if (error) throw error
    return data
  }
}
