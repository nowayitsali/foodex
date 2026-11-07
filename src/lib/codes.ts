// Finds barcodes and QR codes in the live camera view.
// Uses the browser's own BarcodeDetector when it has one (Chrome on Android),
// otherwise the barcode-detector ponyfill (ZXing in WebAssembly), which covers Safari.

type Detector = { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string; format: string }[]> }

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code'] as const

let detectorPromise: Promise<Detector | null> | null = null

export function getDetector(): Promise<Detector | null> {
  detectorPromise ??= (async () => {
    try {
      const Native = (globalThis as { BarcodeDetector?: any }).BarcodeDetector
      if (Native) {
        const supported: string[] = await Native.getSupportedFormats()
        const formats = FORMATS.filter((f) => supported.includes(f))
        if (formats.length) return new Native({ formats }) as Detector
      }
      const { BarcodeDetector } = await import('barcode-detector/ponyfill')
      return new BarcodeDetector({ formats: [...FORMATS] }) as unknown as Detector
    } catch {
      return null
    }
  })()
  return detectorPromise
}

/**
 * The product barcode inside a scanned value, or null.
 * Handles plain EAN/UPC numbers, GS1 Digital Link QR codes (…/01/<GTIN>)
 * and Open Food Facts product links (…/product/<code>).
 */
export function productCode(raw: string): string | null {
  const text = raw.trim()
  if (/^\d{8,14}$/.test(text)) return text
  const gs1 = text.match(/\/01\/(\d{8,14})(?:\D|$)/)
  if (gs1) return gs1[1].replace(/^0+(?=\d{13})/, '')
  const off = text.match(/openfoodfacts\.org\/product\/(\d{8,14})/i)
  if (off) return off[1]
  return null
}
