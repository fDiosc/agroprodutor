import { beforeAll, afterAll } from 'vitest'

beforeAll(() => {
  process.env.MERX_API_URL = 'https://homolog.api.merx.tech'
  process.env.MERX_API_KEY = 'test-api-key'
  process.env.GEOSERVER_URL = 'https://geoserver.merx.tech/geoserver/wfs'
})

afterAll(() => {
})
