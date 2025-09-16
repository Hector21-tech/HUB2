interface SharePDFOptions {
  html?: string
  url?: string
  fileName?: string
  title?: string
  playerData?: any
  aiImprovedNotes?: string | null
}

export async function generateAndSharePDF({
  html,
  url,
  fileName = 'document.pdf',
  title = 'PDF Document',
  playerData,
  aiImprovedNotes
}: SharePDFOptions): Promise<void> {
  const ac = new AbortController()
  const timeout = setTimeout(() => ac.abort(), 25000)

  try {
    const response = await fetch('/api/generate-player-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html, url, fileName, playerData, aiImprovedNotes }),
      cache: 'no-store',
      signal: ac.signal,
    })

    if (!response.ok) {
      throw new Error(`PDF generation failed: ${response.status}`)
    }

    const blob = await response.blob()
    const safeFileName = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`
    const file = new File([blob], safeFileName, { type: 'application/pdf' })

    // Try native share on mobile
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title,
        files: [file]
      })
      return
    }

    // Fallback: download
    const href = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), {
      href,
      download: safeFileName,
      style: 'display: none'
    })
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(href)

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('PDF generation timed out. Please try again.')
    }
    console.error('PDF share error:', error)
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

// Utility functions for mobile detection
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         !!(navigator.maxTouchPoints && navigator.maxTouchPoints > 1)
}

export function isShareSupported(): boolean {
  return typeof navigator !== 'undefined' &&
         'share' in navigator &&
         'canShare' in navigator
}