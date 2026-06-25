'use client'

import { Download, FileText } from 'lucide-react'

const declaracoes = [
  {
    id: 'dsa',
    nome: 'DSA',
    descricao: 'Declaração de Segurança do Acervo',
    arquivo: '/declaracoes/DSA.docx',
  },
  {
    id: 'inquerito',
    nome: 'Declaração de Inquérito',
    descricao: 'Declaração referente a inquéritos policiais',
    arquivo: '/declaracoes/Declaracao-de-inquerito.docx',
  },
  {
    id: 'compromisso',
    nome: 'Declaração de Compromisso',
    descricao: 'Declaração de compromisso do atirador/colecionador',
    arquivo: '/declaracoes/Declaracao-de-compromisso.docx',
  },
  {
    id: 'residencia',
    nome: 'Declaração de Residência',
    descricao: 'Declaração de comprovante de residência',
    arquivo: '/declaracoes/Declaracao-de-residencia.docx',
  },
]

export default function DeclaracoesPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Declarações</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Modelos de declarações prontos para download e preenchimento
        </p>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {declaracoes.map((doc, i) => (
          <div key={doc.id}
            className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:border-[#3E92CC]/40 hover:shadow-soft transition-all">
            {/* Ícone + número */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-[#0B2545]/10 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#0B2545]" />
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#3E92CC] rounded-full flex items-center justify-center text-white text-xs font-bold">
                {i + 1}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{doc.nome}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{doc.descricao}</p>
            </div>

            {/* Download */}
            <a
              href={doc.arquivo}
              download
              className="flex items-center gap-2 bg-[#0B2545] hover:bg-[#13315C] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              Baixar
            </a>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-muted/50 rounded-2xl p-5 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Instruções</p>
        <ul className="space-y-1.5">
          {[
            'Clique em "Baixar" para salvar o arquivo no seu computador',
            'Os arquivos estão no formato .docx (Word) — editáveis para preenchimento',
            'Preencha os dados do cliente antes de imprimir ou assinar',
            'Após preenchido, utilize a ferramenta "Transformar em PDF" se necessário',
          ].map((t) => (
            <li key={t} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="text-[#00C853] mt-0.5 flex-shrink-0">✓</span> {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
