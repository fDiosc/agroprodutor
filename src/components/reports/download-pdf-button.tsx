'use client'

import { useState } from 'react'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'

interface DownloadPdfButtonProps {
  propertyId: string
  propertyName: string
}

export function DownloadPdfButton({
  propertyId,
  propertyName,
}: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/properties/${propertyId}/pdf`)
      if (!res.ok) throw new Error('Failed to generate PDF')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-esg-${propertyName.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF download error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg border border-neutral-border px-4 py-2.5 text-sm font-medium text-neutral-text-primary transition-colors hover:bg-gray-50 disabled:opacity-60"
    >
      <ArrowDownTrayIcon className="h-5 w-5" />
      {loading ? 'Gerando PDF...' : 'Exportar PDF'}
    </button>
  )
}
