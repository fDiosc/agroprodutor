import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

/**
 * Normalizes a CAR code to the standard format: UF-IBGECODE-HASH
 * Strips dots, spaces, and non-alphanumeric chars except hyphens,
 * then ensures hyphens are in the correct positions.
 * Example: "MT.5107925.6D58F3CA..." → "MT-5107925-6D58F3CA..."
 */
export function normalizeCarCode(raw: string): string {
  const cleaned = raw.trim().replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  if (cleaned.length < 3) return cleaned
  const uf = cleaned.slice(0, 2)
  const rest = cleaned.slice(2)
  const ibgeMatch = rest.match(/^(\d{7})(.+)$/)
  if (ibgeMatch) {
    return `${uf}-${ibgeMatch[1]}-${ibgeMatch[2]}`
  }
  return `${uf}-${rest}`
}

/**
 * Strips non-digit characters from CPF/CNPJ for storage.
 */
export function normalizeCpfCnpj(raw: string): string {
  return raw.replace(/\D/g, '')
}

export function formatArea(hectares: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(hectares)
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('pt-BR')
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getPolygonCentroid(
  geoJson: GeoJSON.FeatureCollection | GeoJSON.Feature | null
): [number, number] | null {
  if (!geoJson) return null
  try {
    const features =
      geoJson.type === 'FeatureCollection' ? geoJson.features : [geoJson]
    let totalLat = 0
    let totalLng = 0
    let count = 0
    for (const feature of features) {
      const geometry = feature.geometry
      if (!geometry) continue
      const coords =
        geometry.type === 'Polygon'
          ? geometry.coordinates[0]
          : geometry.type === 'MultiPolygon'
            ? geometry.coordinates.flat()[0]
            : null
      if (!coords) continue
      for (const [lng, lat] of coords as number[][]) {
        totalLat += lat
        totalLng += lng
        count++
      }
    }
    if (count === 0) return null
    return [totalLat / count, totalLng / count]
  } catch {
    return null
  }
}
