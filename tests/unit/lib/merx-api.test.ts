import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MerxApiClient, MerxApiError } from '@/lib/merx-api'

const mockEsgResponse = {
  car_imovel: 'MT-5107925-7515B28AEE9240ACAB464D8DF624D470',
  municipio: 'Sorriso',
  uf: 'MT',
  area_imovel: 259.48,
  qtd_apontamentos_assentamentos: 0,
  qtd_apontamentos_embargos_ibama: 0,
  qtd_apontamentos_embargos_sema: 0,
  qtd_apontamentos_embargos_sema_pa: 0,
  qtd_apontamentos_embargos_icmbio: 0,
  qtd_apontamentos_prodes: 0,
  qtd_apontamentos_prodes_caatinga: 0,
  qtd_apontamentos_prodes_cerrado: 0,
  qtd_apontamentos_prodes_mata_atlantica: 0,
  qtd_apontamentos_prodes_pampa: 0,
  qtd_apontamentos_prodes_pantanal: 0,
  qtd_apontamentos_terras_indigenas: 0,
  qtd_apontamentos_territorios_quilombolas: 0,
  qtd_apontamentos_unidades_conservacao: 0,
  qtd_moratoria_soja: 0,
  total_apontamentos: 0,
  esg_status: 'CONFORME',
  car_status: 'AT',
  car_status_updated_at: 1714532400.0,
}

const mockProducerResponse = {
  cpf_cnpj: '868.812.200-81',
  esg_status: 'CONFORME',
  qtd_apontamentos_sema_mt: 0,
  qtd_apontamentos_ibama_tabular: 0,
  qtd_apontamentos_lista_suja: 0,
  qtd_apontamentos_moratoria_soja: 0,
  qtd_apontamentos_icmbio_produtor: 0,
  qtd_apontamentos_sema_pa: 0,
}

const mockEudrDetailedResponse = {
  eu_status_summary: 'NAO_CONFORME',
  forest_loss_data: { total_area: 0.319 },
  eu: {
    property_data: {
      car: 'MG-3135209-56FC399E093348DDBFECABA544B54904',
      car_status: 'AT',
      car_status_updated_at: 1740009600.0,
    },
    property_data_eu: {
      car: 'MG-3135209-56FC399E093348DDBFECABA544B54904',
      eu_status: 'NAO_CONFORME',
      total_issues: 2,
    },
    layer_data: [
      { layer_name: 'IBAMA - EMBARGOS', eudr_status: 'CONFORME', total_issues: 0, total_area: 0.0, issues_information: [] },
      { layer_name: 'FUNAI - TERRAS INDIGENAS', eudr_status: 'CONFORME', total_issues: 0, total_area: 0.0, issues_information: [] },
    ],
    prodes_layer_data: [
      { layer_name: 'INPE - PRODES - AMAZÔNIA', eudr_status: 'CONFORME', total_issues: 0, total_area: 0.0, issues_information: [] },
    ],
  },
}

const mockProductivityResponse = [
  {
    car: 'MT-5107909-XXXXXXXXXXXXXXXXXXXXXXXX',
    year_area: '2023',
    year_productivity: '2023',
    harvest: '2022/2023',
    product: 'SOY',
    county_productivity: 55.5,
    planted_area: 150.75,
    declared_area: 200.0,
    estimated_total_annual_production: 8366.625,
    geo_json: null,
  },
]

describe('MerxApiClient', () => {
  let client: MerxApiClient

  beforeEach(() => {
    client = new MerxApiClient()
    vi.restoreAllMocks()
  })

  describe('getPropertyEsgReport', () => {
    it('should fetch and parse ESG report for a valid CAR', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockEsgResponse,
      } as Response)

      const report = await client.getPropertyEsgReport('MT-5107925-7515B28AEE9240ACAB464D8DF624D470')
      expect(report.esg_status).toBe('CONFORME')
      expect(report.municipio).toBe('Sorriso')
      expect(report.total_apontamentos).toBe(0)
    })

    it('should throw MerxApiError on non-200 response', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response)

      await expect(
        client.getPropertyEsgReport('INVALID-CAR')
      ).rejects.toThrow(MerxApiError)
    })
  })

  describe('getProducerEsgReport', () => {
    it('should fetch producer ESG report by CPF', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducerResponse,
      } as Response)

      const report = await client.getProducerEsgReport('868.812.200-81')
      expect(report.esg_status).toBe('CONFORME')
      expect(report.qtd_apontamentos_ibama_tabular).toBe(0)
    })

    it('should clean CPF formatting before sending', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducerResponse,
      } as Response)

      await client.getProducerEsgReport('868.812.200-81')
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('86881220081'),
        expect.any(Object)
      )
    })
  })

  describe('getEudrReportDetailed', () => {
    it('should fetch and parse EUDR detailed report', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockEudrDetailedResponse,
      } as Response)

      const report = await client.getEudrReportDetailed('MG-3135209-56FC399E093348DDBFECABA544B54904')
      expect(report.eu_status_summary).toBe('NAO_CONFORME')
      expect(report.eu.property_data_eu.total_issues).toBe(2)
    })
  })

  describe('getProductivity', () => {
    it('should fetch productivity data for SOY', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductivityResponse,
      } as Response)

      const reports = await client.getProductivity('MT-5107909-XXX', 'SOY')
      expect(reports).toHaveLength(1)
      expect(reports[0].product).toBe('SOY')
      expect(reports[0].county_productivity).toBe(55.5)
    })

    it('should include GeoJSON param when requested', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductivityResponse,
      } as Response)

      await client.getProductivity('MT-123', 'CORN', { includeGeoJson: true })
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('includeGeoJson=true'),
        expect.any(Object)
      )
    })
  })
})
