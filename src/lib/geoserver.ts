const GEOSERVER_URL = process.env.GEOSERVER_URL || 'https://geoserver.merx.tech/geoserver/wfs'

export interface GeoServerFeatureCollection {
  type: 'FeatureCollection'
  features: GeoServerFeature[]
}

export interface GeoServerFeature {
  type: 'Feature'
  geometry: {
    type: string
    coordinates: number[][][] | number[][][][]
  }
  properties: Record<string, unknown>
}

export class GeoServerError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'GeoServerError'
  }
}

export class GeoServerClient {
  async getPropertyPolygon(car: string): Promise<GeoServerFeatureCollection> {
    const params = new URLSearchParams({
      service: 'WFS',
      version: '1.0.0',
      request: 'GetFeature',
      outputFormat: 'application/json',
      typeNames: 'merx:area_imovel',
      cql_filter: `cod_imovel='${car}'`,
    })

    const url = `${GEOSERVER_URL}?${params.toString()}`

    const response = await fetch(url, {
      next: { revalidate: 604800 },
    })

    if (!response.ok) {
      throw new GeoServerError(
        `GeoServer error: ${response.status} ${response.statusText}`,
        response.status
      )
    }

    return response.json()
  }

  getCentroid(featureCollection: GeoServerFeatureCollection): { lat: number; lng: number } | null {
    if (!featureCollection.features.length) return null

    const feature = featureCollection.features[0]
    const coords = feature.geometry.coordinates

    let allPoints: number[][] = []

    if (feature.geometry.type === 'Polygon') {
      allPoints = (coords as number[][][])[0]
    } else if (feature.geometry.type === 'MultiPolygon') {
      for (const polygon of coords as number[][][][]) {
        allPoints.push(...polygon[0])
      }
    }

    if (!allPoints.length) return null

    const sumLng = allPoints.reduce((acc, p) => acc + p[0], 0)
    const sumLat = allPoints.reduce((acc, p) => acc + p[1], 0)

    return {
      lng: sumLng / allPoints.length,
      lat: sumLat / allPoints.length,
    }
  }
}

export const geoServer = new GeoServerClient()
