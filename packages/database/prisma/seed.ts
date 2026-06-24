import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Planos
  const starter = await prisma.plan.upsert({
    where: { type: 'STARTER' },
    update: {},
    create: {
      name: 'Starter',
      type: 'STARTER',
      price: 49.90,
      maxClients: 50,
      maxUsers: 2,
      features: ['CR', 'GT', 'Documentos básicos', 'Suporte via email'],
    },
  })

  const premium = await prisma.plan.upsert({
    where: { type: 'PREMIUM' },
    update: {},
    create: {
      name: 'Premium',
      type: 'PREMIUM',
      price: 97.00,
      maxClients: 999999,
      maxUsers: 10,
      features: [
        'CR', 'CRAF', 'GT',
        'Documentos ilimitados',
        'WhatsApp integrado',
        'Assinatura digital',
        'Radar de Renovação',
        'Relatórios avançados',
        'Suporte prioritário',
      ],
    },
  })

  console.log('✅ Planos criados:', { starter: starter.id, premium: premium.id })

  // Empresa de demonstração
  const bcrypt = await import('bcrypt')
  const hashedPassword = await bcrypt.hash('demo123456', 12)

  const demoCompany = await prisma.company.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Despachante Demo Ltda.',
      slug: 'demo',
      email: 'demo@controlbelico.com.br',
      phone: '(11) 99999-0000',
      city: 'São Paulo',
      state: 'SP',
      users: {
        create: {
          name: 'Admin Demo',
          email: 'demo@controlbelico.com.br',
          password: hashedPassword,
          role: 'ADMIN',
        },
      },
      subscription: {
        create: {
          planId: premium.id,
          status: 'TRIAL',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      },
    },
  })

  console.log('✅ Empresa demo criada:', demoCompany.slug)
  console.log('')
  console.log('─────────────────────────────────────')
  console.log('🔑 Login de demonstração:')
  console.log('   Email:  demo@controlbelico.com.br')
  console.log('   Senha:  demo123456')
  console.log('─────────────────────────────────────')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
