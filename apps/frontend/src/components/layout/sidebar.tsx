'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, FolderKanban, AlertTriangle,
  DollarSign, BarChart3, TrendingUp, Settings, Shield,
  Radar, ChevronLeft, FileSignature, LogOut, FileDown, Image as ImageIcon, ScrollText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Clientes', href: '/clients', icon: Users },
  { label: 'Processos', href: '/processes', icon: FolderKanban },
  { label: 'Pendências', href: '/pendencies', icon: AlertTriangle, badge: '12' },
  { label: 'Funil de Vendas', href: '/funnel', icon: TrendingUp },
  { label: 'Financeiro', href: '/financial', icon: DollarSign },
  { label: 'Assinaturas', href: '/signatures', icon: FileSignature },
  { label: 'Relatórios', href: '/reports', icon: BarChart3 },
  { label: 'Radar', href: '/radar', icon: Radar },
  { label: 'Diminuir PDF', href: '/pdf-compress', icon: FileDown },
  { label: 'Transformar em PDF', href: '/image-to-pdf', icon: ImageIcon },
  { label: 'Declarações', href: '/declaracoes', icon: ScrollText },
]

const bottomItems = [
  { label: 'Configurações', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0B2545] flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-[#134074] to-[#3E92CC] rounded-lg flex items-center justify-center shadow-md">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">Controle</span>
            <span className="text-sm font-bold text-[#3E92CC]"> Bélico</span>
          </div>
        </div>
      </div>

      {/* Company info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white text-xs font-bold">
            DB
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-semibold truncate">Despachante Bélico LTDA</div>
            <div className="text-white/40 text-xs">Plano Premium</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        <div className="text-white/30 text-xs font-semibold uppercase tracking-widest px-3 mb-2">
          Principal
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <item.icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-[#3E92CC]' : 'text-white/50 group-hover:text-white/80')} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-[#D50000] text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <div className="w-1 h-5 bg-[#3E92CC] rounded-full" />
              )}
            </Link>
          )
        })}

        <div className="text-white/30 text-xs font-semibold uppercase tracking-widest px-3 mb-2 mt-6">
          Sistema
        </div>
        {bottomItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#134074] to-[#3E92CC] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold truncate">Admin</div>
            <div className="text-white/40 text-xs truncate">admin@empresa.com</div>
          </div>
          <button className="text-white/40 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
