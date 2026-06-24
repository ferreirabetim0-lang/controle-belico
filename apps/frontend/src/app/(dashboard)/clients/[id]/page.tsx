'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Phone, Mail, MapPin, Edit, Plus, FileText,
  CheckCircle2, Clock, AlertTriangle, MessageSquare, Trash2,
  User, Calendar, Tag, Shield, DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getInitials, formatCPF, formatDate } from '@/lib/utils'
import { ProcessChecklist } from '@/components/processes/process-checklist'
import { ClientDocuments } from '@/components/clients/client-documents'
import { ClientTimeline } from '@/components/clients/client-timeline'
import { ClientFinancial } from '@/components/clients/client-financial'

// Mock data — em produção viria da API
const mockClient = {
  id: '1',
  name: 'João Carlos Mendes',
  cpf: '123.456.789-00',
  rg: 'MG-12.345.678',
  birthDate: '1985-03-15',
  phone: '(11) 99999-0001',
  whatsapp: '(11) 99999-0001',
  email: 'joao.mendes@email.com',
  city: 'São Paulo',
  state: 'SP',
  address: 'Rua das Flores, 123 — Jardim Paulista',
  profession: 'Empresário',
  status: 'CR',
  responsible: 'Admin',
  leadSource: 'Indicação',
  tags: ['CAC', 'Prioritário'],
  observations: 'Cliente indicado pelo João Silva. Possui urgência no processo.',
  createdAt: '2026-06-15',
  activeProcesses: [
    {
      id: 'p1',
      type: 'CR',
      status: 'IN_PROGRESS',
      progress: 72,
      startedAt: '2026-06-15',
      steps: [
        { key: 'payment', name: 'Pagamento Recebido', completed: true, completedAt: '2026-06-15' },
        { key: 'photo_3x4', name: 'Foto 3x4', completed: false },
        { key: 'gov_password', name: 'Senha GOV', completed: true, completedAt: '2026-06-16' },
        { key: 'initial_registration', name: 'Cadastro Inicial', completed: true, completedAt: '2026-06-17' },
        { key: 'rg_cnh', name: 'RG ou CNH', completed: true, completedAt: '2026-06-17' },
        { key: 'proof_address', name: 'Comprovante de Endereço', completed: true, completedAt: '2026-06-18' },
        { key: 'proof_income', name: 'Comprovante de Renda', completed: false },
        { key: 'psych_schedule', name: 'Agendamento Psicológico', completed: true, completedAt: '2026-06-19' },
        { key: 'shooting_schedule', name: 'Agendamento Tiro', completed: false },
        { key: 'declaration_inquiry', name: 'Declaração Inquérito', completed: true, completedAt: '2026-06-20' },
        { key: 'declaration_storage', name: 'Declaração Guarda Acervo', completed: true, completedAt: '2026-06-20' },
        { key: 'club_membership', name: 'Filiação ao Clube', completed: false },
        { key: 'certifications', name: 'Certidões Negativas', completed: false },
        { key: 'gru', name: 'GRU Paga', completed: false },
        { key: 'sent_analysis', name: 'Enviado para Análise', completed: false },
        { key: 'in_queue', name: 'Em Fila', completed: false },
        { key: 'in_analysis', name: 'Em Análise', completed: false },
        { key: 'approved', name: 'Deferido', completed: false },
      ],
    },
  ],
}

const tabs = [
  { id: 'overview', label: 'Visão Geral', icon: User },
  { id: 'processes', label: 'Processos', icon: Shield },
  { id: 'documents', label: 'Documentos', icon: FileText },
  { id: 'financial', label: 'Financeiro', icon: DollarSign },
  { id: 'timeline', label: 'Timeline', icon: Clock },
]

const statusConfig: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'secondary' }> = {
  CR: { label: 'CR', variant: 'info' },
  CRAF: { label: 'CRAF', variant: 'warning' },
  GT: { label: 'GT', variant: 'success' },
  Lead: { label: 'Lead', variant: 'secondary' },
  Documentação: { label: 'Documentação', variant: 'secondary' },
}

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  const client = mockClient

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
            <Badge variant={statusConfig[client.status]?.variant ?? 'secondary'}>
              {statusConfig[client.status]?.label ?? client.status}
            </Badge>
            {client.tags.map((tag) => (
              <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            CPF: {client.cpf} · Cadastrado em {client.createdAt} · Responsável: {client.responsible}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquare className="w-4 h-4 text-[#00C853]" /> WhatsApp
          </Button>
          <Button size="sm" className="gap-2 bg-[#0B2545] hover:bg-[#13315C]">
            <Edit className="w-4 h-4" /> Editar
          </Button>
        </div>
      </div>

      {/* Info cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Phone, label: 'Telefone', value: client.phone },
          { icon: Mail, label: 'E-mail', value: client.email },
          { icon: MapPin, label: 'Cidade', value: `${client.city} — ${client.state}` },
          { icon: Calendar, label: 'Nascimento', value: client.birthDate },
        ].map((item) => (
          <div key={item.label} className="bg-card rounded-xl p-4 border border-border flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              <item.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">{item.label}</div>
              <div className="text-sm font-medium text-foreground truncate">{item.value || '—'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar for active process */}
      {client.activeProcesses.length > 0 && (
        <div className="bg-gradient-to-r from-[#0B2545] to-[#134074] rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#3E92CC]" />
              <span className="font-semibold">Processo CR em andamento</span>
            </div>
            <span className="text-2xl font-extrabold text-[#3E92CC]">{client.activeProcesses[0].progress}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5 mb-2">
            <div
              className="bg-gradient-to-r from-[#3E92CC] to-[#00C853] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${client.activeProcesses[0].progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>
              {client.activeProcesses[0].steps.filter((s) => s.completed).length} de {client.activeProcesses[0].steps.length} etapas concluídas
            </span>
            <span>Iniciado em {client.activeProcesses[0].startedAt}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-[#3E92CC] text-[#3E92CC]'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && <ClientOverview client={client} />}
        {activeTab === 'processes' && <ProcessChecklist process={client.activeProcesses[0]} />}
        {activeTab === 'documents' && <ClientDocuments clientId={client.id} />}
        {activeTab === 'financial' && <ClientFinancial clientId={client.id} />}
        {activeTab === 'timeline' && <ClientTimeline clientId={client.id} />}
      </div>
    </div>
  )
}

function ClientOverview({ client }: { client: typeof mockClient }) {
  const pendingSteps = client.activeProcesses[0]?.steps.filter((s) => !s.completed) ?? []

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Pending steps alert */}
        {pendingSteps.length > 0 && (
          <div className="bg-[#D50000]/5 border border-[#D50000]/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-[#D50000]" />
              <h3 className="font-bold text-[#D50000]">
                {pendingSteps.length} pendência{pendingSteps.length > 1 ? 's' : ''} no processo
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {pendingSteps.map((step) => (
                <div key={step.key} className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-4 h-4 rounded border-2 border-[#D50000]/40 flex-shrink-0" />
                  {step.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personal data */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="font-bold text-foreground mb-5">Dados Pessoais</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Nome completo', value: client.name },
              { label: 'CPF', value: client.cpf },
              { label: 'RG', value: client.rg },
              { label: 'Data de nascimento', value: client.birthDate },
              { label: 'Profissão', value: client.profession },
              { label: 'Origem do lead', value: client.leadSource },
              { label: 'Endereço', value: client.address },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                <div className="text-sm font-medium text-foreground">{item.value || '—'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Observations */}
        {client.observations && (
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="font-bold text-foreground mb-3">Observações</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{client.observations}</p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Quick actions */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h3 className="font-bold text-foreground mb-4 text-sm">Ações Rápidas</h3>
          <div className="space-y-2">
            <Button className="w-full justify-start gap-2 bg-[#0B2545] hover:bg-[#13315C] text-sm">
              <Plus className="w-4 h-4" /> Novo Processo
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 text-sm">
              <FileText className="w-4 h-4" /> Upload Documento
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 text-sm text-[#00C853] border-[#00C853]/30 hover:bg-[#00C853]/5">
              <MessageSquare className="w-4 h-4" /> Enviar WhatsApp
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 text-sm text-[#D50000] border-[#D50000]/30 hover:bg-[#D50000]/5">
              <Trash2 className="w-4 h-4" /> Arquivar Cliente
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h3 className="font-bold text-foreground mb-4 text-sm">Resumo</h3>
          <div className="space-y-3">
            {[
              { label: 'Processos ativos', value: '1' },
              { label: 'Documentos enviados', value: '6' },
              { label: 'Total pago', value: 'R$ 850,00' },
              { label: 'Dias como cliente', value: '37' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-sm font-bold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
