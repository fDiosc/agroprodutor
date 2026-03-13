import { handlers } from '@/lib/auth'

const originalGET = handlers.GET
const originalPOST = handlers.POST

export async function GET(req: Request, ctx: { params: Promise<Record<string, string>> }) {
  const res = await originalGET(req, ctx)
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return res
}

export async function POST(req: Request, ctx: { params: Promise<Record<string, string>> }) {
  console.log('[ROUTE] POST /api/auth/* hit')
  try {
    const res = await originalPOST(req, ctx)
    console.log('[ROUTE] POST response status:', res?.status)
    console.log('[ROUTE] POST response headers:', JSON.stringify(Object.fromEntries(res.headers.entries())))
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return res
  } catch (err) {
    console.error('[ROUTE] POST error:', err)
    throw err
  }
}
