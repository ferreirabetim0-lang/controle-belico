'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-[#0B2545] to-[#3E92CC] rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-[#0B2545] dark:text-white">Controle</span>
              <span className="text-lg font-bold text-[#3E92CC]"> Bélico</span>
            </div>
          </Link>

          {/* Nav Desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { label: 'Funcionalidades', href: '#features' },
              { label: 'Central de Pendências', href: '#pendencies' },
              { label: 'Planos', href: '#plans' },
              { label: 'FAQ', href: '#faq' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#0B2545] dark:hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-[#0B2545]">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#0B2545] hover:bg-[#13315C] text-white rounded-xl px-5 shadow-md">
                Teste Grátis 7 Dias
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 px-4 py-6 space-y-4"
        >
          {['Funcionalidades', 'Central de Pendências', 'Planos', 'FAQ'].map((item) => (
            <a
              key={item}
              href="#"
              className="block text-sm font-medium text-gray-600 hover:text-[#0B2545] py-1"
              onClick={() => setMobileOpen(false)}
            >
              {item}
            </a>
          ))}
          <div className="pt-4 flex flex-col gap-2">
            <Link href="/login">
              <Button variant="outline" className="w-full">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button className="w-full bg-[#0B2545] text-white">Teste Grátis 7 Dias</Button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
