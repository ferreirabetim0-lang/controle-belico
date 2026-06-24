import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import * as ws from 'ws'

@Injectable()
export class SupabaseService {
  private client: SupabaseClient

  constructor(private config: ConfigService) {
    this.client = createClient(
      this.config.getOrThrow('SUPABASE_URL'),
      this.config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
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
