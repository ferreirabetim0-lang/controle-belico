import Link from 'next/link'
import { Shield } from 'lucide-react'

export function LandingFooter() {
  return (
    <footer className="bg-[#0B2545] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-[#134074] to-[#3E92CC] rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">Controle Bélico</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              Gestão Inteligente para Despachantes e Clubes de Tiro.
            </p>
            <p className="text-white/30 text-xs">
              © 2024 Controle Bélico. Todos os direitos reservados.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Produto</h4>
            <ul className="space-y-2.5 text-white/50 text-sm">
              {['Funcionalidades', 'Central de Pendências', 'Radar de Renovação', 'Planos', 'Roadmap'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Empresa</h4>
            <ul className="space-y-2.5 text-white/50 text-sm">
              {['Sobre Nós', 'Blog', 'Cases de Sucesso', 'Parceiros', 'Contato'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5 text-white/50 text-sm">
              {['Termos de Uso', 'Política de Privacidade', 'LGPD', 'Cookies'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/40 text-xs">
          <span>Desenvolvido com tecnologia de ponta para o mercado bélico brasileiro.</span>
          <span>CNPJ: 00.000.000/0001-00</span>
        </div>
      </div>
    </footer>
  )
}
