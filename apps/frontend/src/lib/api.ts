const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api/v1'

type RequestOptions = {
  method?: string
  body?: unknown
  token?: string
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  const token = opts.token || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null)
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })

  if (res.status === 401) {
    const refreshed = await tryRefresh()
    if (refreshed) return request<T>(path, { ...opts, token: refreshed })
    if (typeof window !== 'undefined') {
      localStorage.clear()
      document.cookie = 'accessToken=; path=/; max-age=0'
      window.location.href = '/login'
    }
    throw new Error('Sessão expirada')
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro desconhecido' }))
    throw new Error(error.message || `Erro ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

function toQS(params?: Record<string, string | number | undefined | null>): string {
  if (!params) return ''
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  return entries.length ? '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString() : ''
}

async function tryRefresh(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return null
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return null
    const data = await res.json()
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    document.cookie = `accessToken=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`
    return data.accessToken
  } catch {
    return null
  }
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type LoginResponse = {
  accessToken: string
  refreshToken: string
  user: { id: string; name: string; email: string; role: string; companyId: string; companyName: string }
}

export type Client = {
  id: string; name: string; cpf: string; phone?: string; whatsapp?: string
  email?: string; city?: string; state?: string; status: string
  createdAt: string; updatedAt: string; responsible?: { name: string }
}

export type StepMeta = {
  govPassword?: string
  schedulingDate?: string; schedulingTime?: string; schedulingLocation?: string
  certifications?: string[]
  addressOwner?: 'client' | 'third_party'
  addressDeclarationDoc?: { id: string; name: string; url: string } | null
  observations?: string
  documents?: { id: string; name: string; url: string; size: number; type: string; uploadedAt: string }[]
}

export type Process = {
  id: string; clientId: string; type: 'CR' | 'CRAF' | 'GT'; status: string
  progress: number; createdAt: string; client?: { name: string }
  steps?: { stepKey: string; stepName: string; isCompleted: boolean; order: number; metadata?: StepMeta }[]
}

export type Transaction = {
  id: string; type: 'INCOME' | 'EXPENSE'; category: string; description: string
  amount: number; status: string; paidAt?: string; dueDate?: string
  createdAt: string; client?: { name: string }
}

export type DashboardStats = {
  totalClients: number; activeProcesses: number; completedProcesses: number; openNotifications: number
}

export type FinancialDashboard = {
  totalIncome: number; totalExpenses: number; profit: number; margin: number
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', { method: 'POST', body: { email, password } }),

  register: (data: { name: string; email: string; password: string; companyName: string; slug: string }) =>
    request<LoginResponse>('/auth/register', { method: 'POST', body: data }),

  logout: () => {
    const token = localStorage.getItem('refreshToken')
    if (token) request('/auth/logout', { method: 'POST', body: { refreshToken: token } }).catch(() => {})
    localStorage.clear()
    document.cookie = 'accessToken=; path=/; max-age=0'
  },
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboard = {
  stats: () => request<DashboardStats>('/companies/dashboard'),
  financialSummary: () => request<FinancialDashboard>('/financial/dashboard'),
  monthlyHistory: () => request<{ month: string; receita: number; despesas: number; lucro: number }[]>('/financial/monthly-history'),
}

// ─── Clientes ─────────────────────────────────────────────────────────────────

export const clients = {
  list: (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    return request<{ data: Client[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/clients${toQS(params)}`)
  },
  get: (id: string) => request<Client & { documents: unknown[]; processes: Process[]; timeline: unknown[]; transactions: Transaction[] }>(`/clients/${id}`),
  create: (data: Partial<Client>) => request<Client>('/clients', { method: 'POST', body: data }),
  update: (id: string, data: Partial<Client>) => request<Client>(`/clients/${id}`, { method: 'PATCH', body: data }),
  archive: (id: string) => request<void>(`/clients/${id}`, { method: 'DELETE' }),
  pendencies: () => request<Record<string, string[]>>('/clients/pendencies'),
  radar: () => request<unknown[]>('/clients/radar'),
  timeline: (id: string) => request<unknown[]>(`/clients/${id}/timeline`),
}

// ─── Processos ────────────────────────────────────────────────────────────────

export const processes = {
  list: (params?: { clientId?: string; type?: string; status?: string }) => {
    return request<Process[]>(`/processes${toQS(params)}`)
  },
  create: (data: { clientId: string; type: 'CR' | 'CRAF' | 'GT' }) =>
    request<Process>('/processes', { method: 'POST', body: data }),
  completeStep: (processId: string, stepKey: string) =>
    request<{ progress: number; completed: number; total: number }>(`/processes/${processId}/steps/${stepKey}`, { method: 'PATCH' }),
  uncompleteStep: (processId: string, stepKey: string) =>
    request<{ progress: number; completed: number; total: number }>(`/processes/${processId}/steps/${stepKey}/complete`, { method: 'DELETE' }),
  updateStepMetadata: (processId: string, stepKey: string, metadata: StepMeta) =>
    request<{ ok: boolean }>(`/processes/${processId}/steps/${stepKey}/metadata`, { method: 'PATCH', body: metadata }),
}

// ─── Financeiro ───────────────────────────────────────────────────────────────

export const financial = {
  dashboard: () => request<FinancialDashboard>('/financial/dashboard'),
  monthlyHistory: () => request<{ month: string; receita: number; despesas: number; lucro: number }[]>('/financial/monthly-history'),
  list: (params?: { type?: string; search?: string; clientId?: string; status?: string; dateFrom?: string; dateTo?: string; category?: string }) => {
    return request<Transaction[]>(`/financial${toQS(params)}`)
  },
  create: (data: Partial<Transaction> & { clientId?: string }) => request<Transaction>('/financial', { method: 'POST', body: data }),
  update: (id: string, data: Partial<Transaction>) => request<Transaction>(`/financial/${id}`, { method: 'PATCH', body: data }),
  remove: (id: string) => request<void>(`/financial/${id}`, { method: 'DELETE' }),
}

// ─── Assinaturas Digitais ────────────────────────────────────────────────────

export type Signature = {
  id: string
  clientId: string
  document: string
  status: 'PENDING' | 'SIGNED' | 'EXPIRED'
  sentAt: string
  signedAt: string | null
  createdAt: string
  client?: { id: string; name: string; phone?: string }
}

export const signatures = {
  list: (params?: { status?: string; search?: string; clientId?: string }) =>
    request<Signature[]>(`/signatures${toQS(params)}`),
  create: (data: { clientId: string; document: string }) =>
    request<Signature>('/signatures', { method: 'POST', body: data }),
  update: (id: string, data: { status?: string; signedAt?: string | null }) =>
    request<Signature>(`/signatures/${id}`, { method: 'PATCH', body: data }),
  remove: (id: string) => request<void>(`/signatures/${id}`, { method: 'DELETE' }),
}

// ─── Assinaturas / Planos ────────────────────────────────────────────────────

export type Plan = {
  id: string; name: string; description?: string; price: number
  maxUsers: number; maxClients: number; features: string[]
  isActive: boolean
}

export type Subscription = {
  id: string; status: 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED' | 'PENDING'
  currentPeriodStart?: string; currentPeriodEnd?: string; cancelledAt?: string
  daysLeft?: number; plan: Plan | null
}

export const subscriptions = {
  plans: () => request<Plan[]>('/subscriptions/plans'),
  status: () => request<Subscription>('/subscriptions/status'),
  checkout: (planId: string) =>
    request<{ checkoutUrl: string; sandboxUrl: string; preferenceId: string }>(
      '/subscriptions/checkout', { method: 'POST', body: { planId } }),
  cancel: () => request<{ cancelled: boolean }>('/subscriptions/cancel', { method: 'DELETE' }),
}

// ─── Notificações ─────────────────────────────────────────────────────────────

export const notifications = {
  list: () => request<unknown[]>('/notifications'),
  markRead: (id: string) => request<void>(`/notifications/${id}/read`, { method: 'PATCH' }),
}
