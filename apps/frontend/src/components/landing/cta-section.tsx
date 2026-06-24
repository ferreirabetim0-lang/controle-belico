'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0B2545] via-[#13315C] to-[#134074]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Shield className="w-8 h-8 text-[#3E92CC]" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
            Pronto para profissionalizar sua operação?
          </h2>

          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Junte-se a centenas de despachantes que já eliminaram as planilhas, os documentos
            perdidos e os prazos esquecidos. Comece grátis hoje.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-[#3E92CC] hover:bg-[#2d7ab5] text-white rounded-xl px-10 py-4 text-base font-semibold shadow-lg shadow-[#3E92CC]/30"
              >
                Começar Teste Grátis — 7 Dias
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 rounded-xl px-10 py-4 text-base font-semibold"
            >
              Falar com Especialista
            </Button>
          </div>

          <p className="text-white/40 text-sm mt-6">
            Sem cartão de crédito • Setup em 15 minutos • Suporte em português
          </p>
        </motion.div>
      </div>
    </section>
  )
}
