'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

export default function LoginPage() {
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
    } catch (err: any) {
      setError(err.message || 'E-mail ou senha incorretos')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#0B2545] via-[#13315C] to-[#134074] flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">Controle</span>
            <span className="text-xl font-bold text-[#3E92CC]"> Bélico</span>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Gestão Inteligente para<br />
            <span className="text-[#3E92CC]">Despachantes</span> e<br />
            Clubes de Tiro
          </h1>
          <p className="text-white/60 text-lg">
            Controle clientes, processos, documentos e financeiro em um único sistema.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Clientes', value: '500+' },
            { label: 'Processos', value: '12k+' },
            { label: 'Satisfação', value: '98%' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-white/50 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-[#0B2545] to-[#3E92CC] rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#0B2545]">Controle <span className="text-[#3E92CC]">Bélico</span></span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo de volta</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Entre na sua conta para acessar o sistema
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-[#D50000]/10 border border-[#D50000]/30 rounded-xl text-sm text-[#D50000]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">E-mail</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground">Senha</label>
                <Link href="/forgot-password" className="text-xs text-[#3E92CC] hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0B2545] hover:bg-[#13315C] text-white py-3 rounded-xl font-semibold"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Entrar <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Não tem conta?{' '}
            <Link href="/register" className="text-[#3E92CC] font-medium hover:underline">
              Teste grátis por 7 dias
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
