import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            memberships: {
              include: { workspace: true },
              take: 1,
            },
          },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          cpfCnpj: user.cpfCnpj,
          advancedMode: user.advancedMode,
          activeWorkspaceId: user.memberships[0]?.workspaceId || '',
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session: updateData }) {
      if (user) {
        token.id = user.id!
        token.cpfCnpj = user.cpfCnpj
        token.advancedMode = user.advancedMode ?? false
        token.activeWorkspaceId = user.activeWorkspaceId ?? ''
      }
      // Handle session update (e.g., workspace switch, advanced mode toggle)
      if (trigger === 'update' && updateData) {
        const userData = (updateData as { user?: { activeWorkspaceId?: string; advancedMode?: boolean } })
          ?.user
        if (userData) {
          if (typeof userData.activeWorkspaceId === 'string') {
            token.activeWorkspaceId = userData.activeWorkspaceId
          }
          if (typeof userData.advancedMode === 'boolean') {
            token.advancedMode = userData.advancedMode
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.cpfCnpj = token.cpfCnpj as string | null | undefined
      session.user.advancedMode = (token.advancedMode as boolean) ?? false
      session.user.activeWorkspaceId = (token.activeWorkspaceId as string) ?? ''
      return session
    },
  },
})
