import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/auth-context'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Controle Bélico — Gestão Inteligente para Despachantes e Clubes de Tiro',
    template: '%s | Controle Bélico',
  },
  description:
    'O ERP completo para despachantes de armas, assessorias CAC e clubes de tiro. Controle clientes, documentos, processos CR, CRAF e GT em um único sistema.',
  keywords: ['despachante de armas', 'CAC', 'clube de tiro', 'CR', 'CRAF', 'GT', 'gestão bélica'],
  authors: [{ name: 'Controle Bélico' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Controle Bélico',
    description: 'Gestão Inteligente para Despachantes e Clubes de Tiro',
    siteName: 'Controle Bélico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
