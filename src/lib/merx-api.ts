import { z } from 'zod'

const MERX_API_URL = process.env.MERX_API_URL || 'https://api.merx.tech'
const MERX_API_KEY = process.env.MERX_API_KEY || ''
const MERX_COOP_ID = process.env.MERX_COOP_ID || ''

export const PropertyEsgReportSchema = z.object({
  car_imovel: z.string(),
  municipio: z.string(),
  uf: z.string(),
  area_imovel: z.number(),
  qtd_apontamentos_assentamentos: z.number(),
  qtd_apontamentos_embargos_ibama: z.number(),
  qtd_apontamentos_embargos_sema: z.number(),
  qtd_apontamentos_embargos_sema_pa: z.number(),
  qtd_apontamentos_embargos_icmbio: z.number(),
  qtd_apontamentos_prodes: z.number(),
  qtd_apontamentos_prodes_caatinga: z.number(),
  qtd_apontamentos_prodes_cerrado: z.number(),
  qtd_apontamentos_prodes_mata_atlantica: z.number(),
  qtd_apontamentos_prodes_pampa: z.number(),
  qtd_apontamentos_prodes_pantanal: z.number(),
  qtd_apontamentos_terras_indigenas: z.number(),
  qtd_apontamentos_territorios_quilombolas: z.number(),
  qtd_apontamentos_unidades_conservacao: z.number(),
  qtd_moratoria_soja: z.number(),
  total_apontamentos: z.number(),
  esg_status: z.string(),
  car_status: z.string(),
  car_status_updated_at: z.number(),
})

export type PropertyEsgReport = z.infer<typeof PropertyEsgReportSchema>

export const ProducerEsgReportSchema = z.object({
  cpf_cnpj: z.string(),
  esg_status: z.string(),
  qtd_apontamentos_sema_mt: z.number(),
  qtd_apontamentos_ibama_tabular: z.number(),
  qtd_apontamentos_lista_suja: z.number(),
  qtd_apontamentos_moratoria_soja: z.number(),
  qtd_apontamentos_icmbio_produtor: z.number(),
  qtd_apontamentos_sema_pa: z.number(),
  qtd_apontamentos: z.number().optional(),
})

export type ProducerEsgReport = z.infer<typeof ProducerEsgReportSchema>

const EudrIssueInfoSchema = z.object({
  key: z.string(),
  value: z.string(),
})

const EudrLayerSchema = z.object({
  layer_name: z.string(),
  eudr_status: z.string().optional(),
  total_issues: z.number(),
  total_area: z.number().optional(),
  issues_information: z.array(EudrIssueInfoSchema).optional(),
})

export const EudrReportDetailedSchema = z.object({
  eu_status_summary: z.string(),
  forest_loss_data: z.object({
    total_area: z.number(),
  }).optional(),
  eu: z.object({
    property_data: z.object({
      car: z.string(),
      car_status: z.string(),
      car_status_updated_at: z.number(),
    }),
    property_data_eu: z.object({
      car: z.string(),
      eu_status: z.string(),
      total_issues: z.number(),
    }),
    layer_data: z.array(EudrLayerSchema),
    prodes_layer_data: z.array(EudrLayerSchema),
  }),
})

export type EudrReportDetailed = z.infer<typeof EudrReportDetailedSchema>

const EudrLayerResumedSchema = z.object({
  layer_name: z.string(),
  total_issues: z.number(),
})

export const EudrReportResumedSchema = z.object({
  eu_status_summary: z.string(),
  eu: z.object({
    property_data: z.object({
      car: z.string(),
      car_status: z.string(),
      car_status_updated_at: z.number(),
    }),
    property_data_eu: z.object({
      car: z.string(),
      eu_status: z.string(),
      total_issues: z.number(),
    }),
    layer_data: z.array(EudrLayerResumedSchema),
    prodes_layer_data: z.array(EudrLayerResumedSchema),
  }),
})

export type EudrReportResumed = z.infer<typeof EudrReportResumedSchema>

export const ProductivityReportSchema = z.object({
  car: z.string(),
  year_area: z.string(),
  year_productivity: z.string(),
  harvest: z.string(),
  product: z.string(),
  county_productivity: z.number(),
  planted_area: z.number().nullable(),
  declared_area: z.number().nullable(),
  estimated_total_annual_production: z.number().nullable(),
  geo_json: z.string().nullable().optional(),
})

export type ProductivityReportData = z.infer<typeof ProductivityReportSchema>

export const CarByLatLongSchema = z.object({
  cod_imovel: z.string(),
  status_car: z.string().optional(),
  declared_area_car: z.number().optional(),
  area: z.number().optional(),
  uf: z.string().optional(),
  city: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  geom: z.string().optional(),
})

export type CarByLatLong = z.infer<typeof CarByLatLongSchema>

// --- Retry/backoff logic ---

const MAX_RETRIES = 3
const INITIAL_DELAY_MS = 1000

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function merxFetch<T>(path: string, schema: z.ZodSchema<T>): Promise<T> {
  const url = `${MERX_API_URL}${path}`

  const headers: Record<string, string> = {
    Authorization: MERX_API_KEY,
    Accept: 'application/json',
  }
  if (MERX_COOP_ID) {
    headers['x-coop-id'] = MERX_COOP_ID
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers,
        next: { revalidate: 86400 },
      })

      if (response.status === 429 || response.status >= 500) {
        lastError = new MerxApiError(
          `Merx API error: ${response.status} ${response.statusText}`,
          response.status
        )
        if (attempt < MAX_RETRIES - 1) {
          await sleep(INITIAL_DELAY_MS * Math.pow(2, attempt))
          continue
        }
      }

      if (!response.ok) {
        throw new MerxApiError(
          `Merx API error: ${response.status} ${response.statusText}`,
          response.status
        )
      }

      const data = await response.json()
      return schema.parse(data)
    } catch (err) {
      if (err instanceof MerxApiError && err.statusCode < 500 && err.statusCode !== 429) {
        throw err
      }
      lastError = err as Error
      if (attempt < MAX_RETRIES - 1) {
        await sleep(INITIAL_DELAY_MS * Math.pow(2, attempt))
      }
    }
  }

  throw lastError ?? new Error('Merx API: max retries exceeded')
}

export class MerxApiError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message)
    this.name = 'MerxApiError'
  }
}

export class MerxApiClient {
  async getPropertyEsgReport(car: string): Promise<PropertyEsgReport> {
    return merxFetch(
      `/api/v1/integration/esg/cars/${encodeURIComponent(car)}:resume`,
      PropertyEsgReportSchema
    )
  }

  async getProducerEsgReport(cpfCnpj: string): Promise<ProducerEsgReport> {
    const cleaned = cpfCnpj.replace(/\D/g, '')
    return merxFetch(
      `/api/v1/integration/esg/social-identities/${cleaned}:resume`,
      ProducerEsgReportSchema
    )
  }

  async getEudrReportDetailed(car: string): Promise<EudrReportDetailed> {
    return merxFetch(
      `/api/v1/integration/eudr/cars/${encodeURIComponent(car)}`,
      EudrReportDetailedSchema
    )
  }

  async getEudrReportResumed(car: string): Promise<EudrReportResumed> {
    return merxFetch(
      `/api/v1/integration/eudr/cars/${encodeURIComponent(car)}:resumed`,
      EudrReportResumedSchema
    )
  }

  async getProductivity(
    car: string,
    culture: 'SOY' | 'CORN',
    options?: {
      year?: string
      harvest?: string
      includeGeoJson?: boolean
    }
  ): Promise<ProductivityReportData[]> {
    const params = new URLSearchParams({
      culture,
      source: 'MERX',
    })
    if (options?.year) params.set('year', options.year)
    if (options?.harvest) params.set('harvest', options.harvest)
    if (options?.includeGeoJson) params.set('includeGeoJson', 'true')

    return merxFetch(
      `/api/v1/integration/productivity/${encodeURIComponent(car)}?${params.toString()}`,
      z.array(ProductivityReportSchema)
    )
  }

  async getCarsByLatLong(lat: number, lng: number): Promise<CarByLatLong[]> {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
    })
    if (MERX_COOP_ID) {
      params.set('cooperative-id', MERX_COOP_ID)
    }

    const url = `${MERX_API_URL}/api/v1/integration/car/getCarsByLatLong?${params.toString()}`

    const headers: Record<string, string> = {
      Authorization: MERX_API_KEY,
      Accept: 'application/json',
    }
    if (MERX_COOP_ID) {
      headers['x-coop-id'] = MERX_COOP_ID
    }

    const response = await fetch(url, { headers })

    if (!response.ok) {
      throw new MerxApiError(
        `Merx CAR search error: ${response.status} ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json()
    return z.array(CarByLatLongSchema).parse(data)
  }
}

export const merxApi = new MerxApiClient()
