'use client'

import { useState } from 'react'
import { MessageSquare, Send, Search, CheckCheck, Clock, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'

const contacts = [
  { id: '1', name: 'João Mendes', phone: '(11) 98765-4321', status: 'CR', lastMsg: 'Olá, quando sai meu CR?', lastAt: '14:32', unread: 2, online: true },
  { id: '2', name: 'Ana Costa', phone: '(41) 97654-3210', status: 'CRAF', lastMsg: 'Já enviei o comprovante', lastAt: '13:15', unread: 0, online: false },
  { id: '3', name: 'Carlos Lima', phone: '(31) 96543-2109', status: 'CR', lastMsg: 'Ok, obrigado!', lastAt: '11:50', unread: 0, online: false },
  { id: '4', name: 'Marina Silva', phone: '(21) 95432-1098', status: 'GT', lastMsg: 'Preciso da guia urgente', lastAt: '09:20', unread: 1, online: true },
  { id: '5', name: 'Pedro Alves', phone: '(61) 94321-0987', status: 'CR', lastMsg: 'Documento enviado!', lastAt: 'Ontem', unread: 0, online: false },
]

const mockMessages: Record<string, { id: string; from: 'me' | 'them'; text: string; time: string; read: boolean }[]> = {
  '1': [
    { id: 'm1', from: 'them', text: 'Olá, tudo bem? Queria saber sobre o andamento do meu CR', time: '14:28', read: true },
    { id: 'm2', from: 'me', text: 'Olá João! Seu processo está em 72% de conclusão. Faltam alguns documentos ainda.', time: '14:30', read: true },
    { id: 'm3', from: 'them', text: 'Quais documentos faltam?', time: '14:31', read: true },
    { id: 'm4', from: 'them', text: 'Olá, quando sai meu CR?', time: '14:32', read: false },
  ],
  '4': [
    { id: 'm10', from: 'them', text: 'Preciso da guia urgente, viagem é amanhã', time: '09:20', read: false },
  ],
}

const quickReplies = [
  'Olá! Vou verificar o status do seu processo e retorno em breve. 😊',
  'Seu processo está em análise. Assim que houver novidades, entro em contato!',
  'Falta apenas o documento X para finalizar. Pode enviar por aqui?',
  'Processo deferido! Seu CR já está disponível. Parabéns! 🎉',
]

export default function WhatsAppPage() {
  const [activeContact, setActiveContact] = useState(contacts[0])
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(mockMessages)

  const currentMsgs = messages[activeContact.id] ?? []

  function sendMessage() {
    if (!message.trim()) return
    const newMsg = { id: Date.now().toString(), from: 'me' as const, text: message, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), read: true }
    setMessages((prev) => ({ ...prev, [activeContact.id]: [...(prev[activeContact.id] ?? []), newMsg] }))
    setMessage('')
  }

  const filteredContacts = contacts.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="animate-fade-in">
      <div className="page-header mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">WhatsApp</h1>
          <p className="text-muted-foreground text-sm mt-1">Central de mensagens com clientes</p>
        </div>
        <Button size="sm" className="gap-2 bg-[#00C853] hover:bg-[#00C853]/90 text-white">
          <MessageSquare className="w-4 h-4" /> Nova conversa
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Contact list */}
          <div className="w-80 flex-shrink-0 border-r border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar conversa..."
                  className="w-full pl-10 pr-3 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setActiveContact(contact)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors text-left ${activeContact.id === contact.id ? 'bg-[#3E92CC]/10' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#0B2545] to-[#3E92CC] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {getInitials(contact.name)}
                    </div>
                    {contact.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00C853] rounded-full border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{contact.name}</span>
                      <span className="text-xs text-muted-foreground">{contact.lastAt}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-muted-foreground truncate max-w-[140px]">{contact.lastMsg}</span>
                      {contact.unread > 0 && (
                        <span className="w-5 h-5 bg-[#00C853] text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0B2545] to-[#3E92CC] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {getInitials(activeContact.name)}
                  </div>
                  {activeContact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00C853] rounded-full border-2 border-card" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{activeContact.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {activeContact.phone}
                    {activeContact.online && <span className="text-[#00C853] ml-1">· Online</span>}
                  </div>
                </div>
              </div>
              <span className="text-xs bg-[#3E92CC]/10 text-[#3E92CC] px-2 py-1 rounded-lg font-medium">
                {activeContact.status}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-muted/20">
              {currentMsgs.length === 0 && (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Nenhuma mensagem. Inicie a conversa!
                </div>
              )}
              {currentMsgs.map((msg) => (
                <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${msg.from === 'me' ? 'bg-[#0B2545] text-white rounded-br-sm' : 'bg-card border border-border text-foreground rounded-bl-sm'}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${msg.from === 'me' ? 'text-white/50' : 'text-muted-foreground'}`}>
                      <span className="text-[10px]">{msg.time}</span>
                      {msg.from === 'me' && (
                        <CheckCheck className={`w-3 h-3 ${msg.read ? 'text-[#3E92CC]' : ''}`} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick replies */}
            <div className="px-4 pt-3 flex gap-2 overflow-x-auto pb-1 border-t border-border bg-card">
              {quickReplies.map((qr, i) => (
                <button
                  key={i}
                  onClick={() => setMessage(qr)}
                  className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-muted/80 transition-colors flex-shrink-0"
                >
                  {qr.slice(0, 35)}…
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card flex gap-3">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Digite uma mensagem..."
                className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
              <Button onClick={sendMessage} disabled={!message.trim()} className="bg-[#00C853] hover:bg-[#00C853]/90 gap-2 px-5">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
