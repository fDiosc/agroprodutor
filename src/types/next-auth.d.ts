import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    cpfCnpj?: string | null
    advancedMode?: boolean
    superAdmin?: boolean
    activeWorkspaceId?: string
  }
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      cpfCnpj?: string | null
      advancedMode: boolean
      superAdmin: boolean
      activeWorkspaceId: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    cpfCnpj?: string | null
    advancedMode: boolean
    superAdmin: boolean
    activeWorkspaceId: string
  }
}
