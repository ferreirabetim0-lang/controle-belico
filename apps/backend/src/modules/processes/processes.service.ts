import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../../supabase/supabase.service'
import { v4 as uuidv4 } from 'uuid'

const CR_STEPS = [
  { stepKey: 'payment', stepName: 'Pagamento Recebido', order: 1 },
  { stepKey: 'photo_3x4', stepName: 'Foto 3x4', order: 2 },
  { stepKey: 'gov_password', stepName: 'Senha GOV', order: 3 },
  { stepKey: 'initial_registration', stepName: 'Cadastro Inicial', order: 4 },
  { stepKey: 'rg_cnh', stepName: 'RG ou CNH', order: 5 },
  { stepKey: 'proof_address', stepName: 'Comprovante de Endereço', order: 6 },
  { stepKey: 'proof_income', stepName: 'Comprovante de Renda', order: 7 },
  { stepKey: 'psych_schedule', stepName: 'Agendamento Psicológico', order: 8 },
  { stepKey: 'shooting_schedule', stepName: 'Agendamento Tiro', order: 9 },
  { stepKey: 'declaration_inquiry', stepName: 'Declaração Inquérito', order: 10 },
  { stepKey: 'declaration_storage', stepName: 'Declaração Guarda Acervo', order: 11 },
  { stepKey: 'club_membership', stepName: 'Filiação ao Clube', order: 12 },
  { stepKey: 'certifications', stepName: 'Certidões Negativas', order: 13 },
  { stepKey: 'gru', stepName: 'GRU Paga', order: 14 },
  { stepKey: 'sent_analysis', stepName: 'Enviado para Análise', order: 15 },
  { stepKey: 'in_queue', stepName: 'Em Fila', order: 16 },
  { stepKey: 'in_analysis', stepName: 'Em Análise', order: 17 },
  { stepKey: 'approved', stepName: 'Deferido', order: 18 },
]

const CRAF_STEPS = [
  { stepKey: 'weapon_choice', stepName: 'Escolha da Arma', order: 1 },
  { stepKey: 'store_choice', stepName: 'Escolha da Loja', order: 2 },
  { stepKey: 'habitualities', stepName: 'Habitualidades Recebidas', order: 3 },
  { stepKey: 'doc_update', stepName: 'Atualização Documentos', order: 4 },
  { stepKey: 'cert_update', stepName: 'Atualização Certidões', order: 5 },
  { stepKey: 'exam_update', stepName: 'Atualização Exames', order: 6 },
  { stepKey: 'declaration_update', stepName: 'Atualização Declarações', order: 7 },
  { stepKey: 'gru', stepName: 'GRU Paga', order: 8 },
  { stepKey: 'in_queue', stepName: 'Em Fila', order: 9 },
  { stepKey: 'in_analysis', stepName: 'Em Análise', order: 10 },
  { stepKey: 'approved', stepName: 'Deferido', order: 11 },
]

const GT_STEPS = [
  { stepKey: 'request', stepName: 'Solicitação GT', order: 1 },
  { stepKey: 'emission', stepName: 'Emissão GT', order: 2 },
  { stepKey: 'gru', stepName: 'GRU Paga', order: 3 },
  { stepKey: 'completed', stepName: 'Finalizado', order: 4 },
]

const STEPS_MAP: Record<string, typeof CR_STEPS> = { CR: CR_STEPS, CRAF: CRAF_STEPS, GT: GT_STEPS }

export type StepMetadata = {
  govPassword?: string
  schedulingDate?: string
  schedulingTime?: string
  schedulingLocation?: string
  certifications?: string[]
  certificationDocs?: Record<string, { id: string; name: string; url: string } | undefined>
  addressOwner?: 'client' | 'third_party'
  observations?: string
  incomeType?: string
  sentAnalysisDate?: string
  documents?: { id: string; name: string; url: string; size: number; type: string; uploadedAt: string }[]
  addressDeclarationDoc?: { id: string; name: string; url: string } | null
}

@Injectable()
export class ProcessesService {
  constructor(private sb: SupabaseService) {}

  async findAll(companyId: string, clientId?: string) {
    let q = this.sb.from('processes')
      .select('*, steps:process_steps(*), client:clients(name)')
      .eq('companyId', companyId)
    if (clientId) q = q.eq('clientId', clientId)
    const { data, error } = await q.order('createdAt', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map((p) => ({
      ...p,
      steps: (p.steps ?? []).map((s: any) => ({
        ...s,
        metadata: this._parseMeta(s.observations),
      })),
    }))
  }

  async createProcess(companyId: string, clientId: string, type: 'CR' | 'CRAF' | 'GT') {
    const now = new Date().toISOString()
    const processId = uuidv4()

    const { data: process, error } = await this.sb.from('processes').insert({
      id: processId, companyId, clientId, type, status: 'IN_PROGRESS',
      progress: 0, createdAt: now, updatedAt: now,
    }).select().single()

    if (error) throw new Error(error.message)

    const steps = STEPS_MAP[type].map((s) => ({
      id: uuidv4(), processId, stepKey: s.stepKey, stepName: s.stepName,
      order: s.order, isCompleted: false, required: true,
    }))

    await this.sb.from('process_steps').insert(steps)
    await this.sb.from('clients').update({ status: type, updatedAt: now }).eq('id', clientId)

    return { ...process, steps }
  }

  async completeStep(companyId: string, processId: string, stepKey: string, userId: string) {
    const proc = await this._assertProcess(companyId, processId)
    const now = new Date().toISOString()

    const { data: stepData } = await this.sb.from('process_steps')
      .select('stepName').eq('processId', processId).eq('stepKey', stepKey).single()

    await this.sb.from('process_steps')
      .update({ isCompleted: true, completedAt: now, completedBy: userId })
      .eq('processId', processId).eq('stepKey', stepKey)

    await this._addTimeline(proc.clientId, now, userId, 'process_update',
      `Etapa concluída: ${stepData?.stepName ?? stepKey}`,
      `Etapa "${stepData?.stepName ?? stepKey}" marcada como concluída.`)

    return this._recalcProgress(processId)
  }

  async uncompleteStep(companyId: string, processId: string, stepKey: string, userId: string) {
    const proc = await this._assertProcess(companyId, processId)

    const { data: stepData } = await this.sb.from('process_steps')
      .select('stepName').eq('processId', processId).eq('stepKey', stepKey).single()

    await this.sb.from('process_steps')
      .update({ isCompleted: false, completedAt: null, completedBy: null })
      .eq('processId', processId).eq('stepKey', stepKey)

    await this._addTimeline(proc.clientId, new Date().toISOString(), userId, 'process_update',
      `Etapa revertida: ${stepData?.stepName ?? stepKey}`,
      `Etapa "${stepData?.stepName ?? stepKey}" desmarcada.`)

    return this._recalcProgress(processId)
  }

  async updateStepMetadata(companyId: string, processId: string, stepKey: string, patch: StepMetadata, userId?: string) {
    const proc = await this._assertProcess(companyId, processId)

    const { data: step } = await this.sb.from('process_steps')
      .select('observations, stepName').eq('processId', processId).eq('stepKey', stepKey).single()
    const current = this._parseMeta(step?.observations)
    const merged = { ...current, ...patch }
    if (patch.certificationDocs && current.certificationDocs) {
      merged.certificationDocs = { ...current.certificationDocs, ...patch.certificationDocs }
    }

    const { error } = await this.sb.from('process_steps')
      .update({ observations: JSON.stringify(merged) })
      .eq('processId', processId).eq('stepKey', stepKey)

    if (error) throw new Error(error.message)

    if (userId) {
      await this._addTimeline(proc.clientId, new Date().toISOString(), userId, 'process_update',
        `Informação salva: ${step?.stepName ?? stepKey}`,
        `Dados da etapa "${step?.stepName ?? stepKey}" atualizados.`)
    }

    return { ok: true }
  }

  async uploadStepFile(
    companyId: string, processId: string, stepKey: string,
    fileName: string, fileBuffer: Buffer, mimeType: string, userId?: string,
  ) {
    const proc = await this._assertProcess(companyId, processId)

    const fileId = uuidv4()
    const ext = fileName.split('.').pop()
    const storagePath = `process-steps/${processId}/${stepKey}/${fileId}.${ext}`

    const { error: uploadError } = await this.sb.db.storage
      .from('documents')
      .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: false })

    if (uploadError) throw new Error(uploadError.message)

    const { data: urlData } = this.sb.db.storage.from('documents').getPublicUrl(storagePath)

    const { data: stepData } = await this.sb.from('process_steps')
      .select('observations, stepName').eq('processId', processId).eq('stepKey', stepKey).single()

    const meta: StepMetadata = this._parseMeta(stepData?.observations)
    const docs = meta.documents ?? []
    docs.push({ id: fileId, name: fileName, url: urlData.publicUrl, size: fileBuffer.length, type: mimeType, uploadedAt: new Date().toISOString() })

    await this.sb.from('process_steps')
      .update({ observations: JSON.stringify({ ...meta, documents: docs }) })
      .eq('processId', processId).eq('stepKey', stepKey)

    if (userId) {
      await this._addTimeline(proc.clientId, new Date().toISOString(), userId, 'document_upload',
        `Documento anexado: ${fileName}`,
        `Arquivo "${fileName}" anexado na etapa "${stepData?.stepName ?? stepKey}".`)
    }

    return { id: fileId, name: fileName, url: urlData.publicUrl }
  }

  async deleteStepFile(companyId: string, processId: string, stepKey: string, fileId: string) {
    await this._assertProcess(companyId, processId)

    const { data: step } = await this.sb.from('process_steps')
      .select('observations').eq('processId', processId).eq('stepKey', stepKey).single()

    const meta: StepMetadata = this._parseMeta(step?.observations)
    const file = (meta.documents ?? []).find((d) => d.id === fileId)
    if (!file) throw new NotFoundException('Arquivo não encontrado')

    const ext = file.name.split('.').pop()
    const storagePath = `process-steps/${processId}/${stepKey}/${fileId}.${ext}`
    await this.sb.db.storage.from('documents').remove([storagePath])

    const docs = (meta.documents ?? []).filter((d) => d.id !== fileId)
    await this.sb.from('process_steps')
      .update({ observations: JSON.stringify({ ...meta, documents: docs }) })
      .eq('processId', processId).eq('stepKey', stepKey)

    return { ok: true }
  }

  private _parseMeta(raw: string | null | undefined): StepMetadata {
    if (!raw) return {}
    try { return JSON.parse(raw) } catch { return {} }
  }

  private async _assertProcess(companyId: string, processId: string) {
    const { data } = await this.sb.from('processes')
      .select('id, clientId').eq('id', processId).eq('companyId', companyId).single()
    if (!data) throw new NotFoundException('Processo não encontrado')
    return data as { id: string; clientId: string }
  }

  private async _addTimeline(clientId: string, createdAt: string, createdBy: string, type: string, title: string, description?: string) {
    await this.sb.from('client_timeline').insert({
      id: uuidv4(), clientId, type, title, description, createdBy, createdAt,
    })
  }

  private async _recalcProgress(processId: string) {
    const { data: allSteps } = await this.sb.from('process_steps')
      .select('isCompleted').eq('processId', processId)

    const total = allSteps?.length ?? 0
    const completed = allSteps?.filter((s) => s.isCompleted).length ?? 0
    const progress = total ? Math.round((completed / total) * 100) : 0

    await this.sb.from('processes').update({
      progress, updatedAt: new Date().toISOString(),
      status: progress === 100 ? 'COMPLETED' : 'IN_PROGRESS',
      ...(progress === 100 && { completedAt: new Date().toISOString() }),
    }).eq('id', processId)

    return { progress, completed, total }
  }
}
