import 'dotenv/config'
import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Seeding database...')

  const passwordHash = await bcrypt.hash('teste123', 12)

  const jaqueline = await prisma.user.upsert({
    where: { email: 'jaqueline@teste.com' },
    update: {},
    create: {
      name: 'Jaqueline Silva',
      email: 'jaqueline@teste.com',
      cpfCnpj: '86881220081',
      phone: '66999990000',
      passwordHash,
    },
  })

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'jaqueline-workspace' },
    update: {},
    create: {
      name: 'Workspace de Jaqueline',
      slug: 'jaqueline-workspace',
      type: 'FREE',
    },
  })

  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: jaqueline.id,
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: jaqueline.id,
      role: 'OWNER',
    },
  })

  await prisma.reportConfig.upsert({
    where: { userId: jaqueline.id },
    update: {},
    create: {
      userId: jaqueline.id,
    },
  })

  console.log('Seed complete!')
  console.log(`User: jaqueline@teste.com / teste123`)
  console.log(`Workspace: ${workspace.slug}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
