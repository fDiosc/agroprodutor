import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GeoServerClient, GeoServerError } from '@/lib/geoserver'

const mockFeatureCollection = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-55.0, -7.0],
            [-55.0, -7.5],
            [-54.5, -7.5],
            [-54.5, -7.0],
            [-55.0, -7.0],
          ],
        ],
      },
      properties: { cod_imovel: 'MT-123' },
    },
  ],
}

describe('GeoServerClient', () => {
  let client: GeoServerClient

  beforeEach(() => {
    client = new GeoServerClient()
    vi.restoreAllMocks()
  })

  describe('getPropertyPolygon', () => {
    it('should fetch property polygon from GeoServer', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockFeatureCollection,
      } as Response)

      const result = await client.getPropertyPolygon('MT-123')
      expect(result.features).toHaveLength(1)
      expect(result.features[0].geometry.type).toBe('Polygon')
    })

    it('should throw GeoServerError on failure', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response)

      await expect(
        client.getPropertyPolygon('INVALID')
      ).rejects.toThrow(GeoServerError)
    })
  })

  describe('getCentroid', () => {
    it('should calculate centroid of a polygon', () => {
      const centroid = client.getCentroid(mockFeatureCollection)
      expect(centroid).not.toBeNull()
      // Centroid is average of vertices: (-55,-7), (-55,-7.5), (-54.5,-7.5), (-54.5,-7), (-55,-7)
      expect(centroid!.lat).toBeCloseTo(-7.2, 1)
      expect(centroid!.lng).toBeCloseTo(-54.8, 1)
    })

    it('should return null for empty feature collection', () => {
      const centroid = client.getCentroid({ type: 'FeatureCollection', features: [] })
      expect(centroid).toBeNull()
    })
  })
})
