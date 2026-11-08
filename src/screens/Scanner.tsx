import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { RestrictionProfile } from '../domain/types'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Barcode, Camera, CameraOff, Plus, QrCode, RotateCcw, ScanLine, Search, ShieldCheck, SwitchCamera } from 'lucide-react'
import { HintPopover } from '../components/HintPopover'
import { HomeButton } from '../components/HomeButton'
import { restrictionNames } from '../components/ui'
import { SearchPopup } from '../components/SearchPopup'
import { ShineButton, TextLoop } from '../components/premium'
import { getDetector, productCode, type DetectedCode } from '../lib/codes'
import { getProductDetector, padBox, videoBoxToScreen, type Box } from '../lib/tracking'
import './scanner.css'
import type { CheckRequest } from './CheckFlow'

type Facing = 'environment' | 'user'
type CameraState =
  | { status: 'starting' }
  | { status: 'live' }
  | { status: 'error'; kind: 'denied' | 'insecure' | 'notfound' | 'other'; message?: string }

// Offered in the search popup before the user types.
const POPULAR_SEARCHES = ['Nutella', 'Celsius', "Lay's Classic", 'Oreo', 'Kit Kat']

// Small photos cost fewer Gemini tokens and still read labels fine.
const CAPTURE_WIDTH = 768

// How long a box stays after its barcode or product leaves the frame.
const LOST_AFTER = 500
// How often the product finder looks. It's slower than the barcode reader.
const PRODUCT_EVERY = 400

const TIPS = ['Point at a barcode or QR code. It scans by itself.', 'Or point at a package label, then tap to Scan.', 'Snap a restaurant menu.', 'Or the plate in front of you.']

interface Props {
  /** False while something covers the Scanner, so the camera turns off. */
  active: boolean
  profile: RestrictionProfile
  onCapture: (req: CheckRequest) => void
  /** The menu button, drawn in the top bar. */
  menu: ReactNode
  onHome: () => void
  /** Opens Settings so the Diner can pick restrictions. */
  onEditRestrictions: () => void
}

export function Scanner({ active, profile, onCapture, menu, onHome, onEditRestrictions }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [facing, setFacing] = useState<Facing>('environment')
  const [cam, setCam] = useState<CameraState>({ status: 'starting' })
  const [attempt, setAttempt] = useState(0)
  const [hints, setHints] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [hintOpen, setHintOpen] = useState(false)
  const [flipTurns, setFlipTurns] = useState(0)
  const [flash, setFlash] = useState(false)
  const [shots, setShots] = useState(0)
  // A code seen in the camera: the product code we're opening, or a notice that it isn't one.
  const [found, setFound] = useState<{ code: string } | { notProduct: true } | null>(null)
  const lastCode = useRef({ code: '', seenAt: 0 })
  // Boxes drawn on the live view: the barcode being tracked, and a softer one around a product.
  const [codeBox, setCodeBox] = useState<(Box & { read: boolean }) | null>(null)
  const [productBox, setProductBox] = useState<Box | null>(null)
  // When a barcode was last on screen. The product finder waits while one is.
  const codeSeenAt = useRef(0)
  const facingRef = useRef(facing)
  facingRef.current = facing
  const reduceMotion = useReducedMotion()
  const latest = useRef({ onCapture, hints })
  latest.current = { onCapture, hints }

  useEffect(() => {
    if (!active) return
    let stream: MediaStream | null = null
    let cancelled = false
    setCam({ status: 'starting' })

    if (!navigator.mediaDevices?.getUserMedia) {
      setCam({ status: 'error', kind: window.isSecureContext ? 'notfound' : 'insecure' })
      return
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        stream = s
        const video = videoRef.current
        if (video) {
          video.srcObject = s
          video.play().catch(() => {})
        }
        setCam({ status: 'live' })
      })
      .catch((e: unknown) => {
        if (cancelled) return
        const name = e instanceof DOMException ? e.name : ''
        const kind =
          name === 'NotAllowedError' || name === 'SecurityError'
            ? 'denied'
            : name === 'NotFoundError' || name === 'OverconstrainedError'
              ? 'notfound'
              : 'other'
        setCam({ status: 'error', kind, message: e instanceof Error ? e.message : undefined })
      })

    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [active, facing, attempt])

  // Watch the live view for barcodes and QR codes, and open a product as soon as one shows up.
  // Costs no Gemini calls: the code goes straight to Open Food Facts.
  useEffect(() => {
    if (!active || cam.status !== 'live') return
    let stopped = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let noticeUntil = 0
    let lastHitAt = 0
    setFound(null)
    setCodeBox(null)
    // The code that was just checked is probably still in view. Skip it until it leaves the frame.
    lastCode.current.seenAt = Date.now()

    getDetector().then((detector) => {
      if (!detector || stopped) return
      const tick = async () => {
        if (stopped) return
        const video = videoRef.current
        if (video && video.readyState >= 2 && !document.hidden) {
          try {
            const hits = await detector.detect(video)
            const now = Date.now()
            // Box the product code if there is one, else whatever was found.
            const tracked = hits.find((h) => productCode(h.rawValue)) ?? hits[0]
            if (tracked && !stopped) {
              lastHitAt = codeSeenAt.current = now
              setCodeBox({ ...codeScreenBox(video, tracked), read: false })
            } else if (now - lastHitAt > LOST_AFTER) {
              setCodeBox(null)
            }
            for (const hit of hits) {
              const code = productCode(hit.rawValue)
              if (!code) {
                if (hit.format === 'qr_code' && now > noticeUntil) {
                  noticeUntil = now + 4000
                  setFound({ notProduct: true })
                  setTimeout(() => !stopped && setFound((f) => (f && 'notProduct' in f ? null : f)), 2200)
                }
                continue
              }
              const again = code === lastCode.current.code && now - lastCode.current.seenAt < 1500
              lastCode.current = { code, seenAt: now }
              if (again) continue
              stopped = true
              codeSeenAt.current = Infinity
              setCodeBox({ ...codeScreenBox(video, hit), read: true })
              setProductBox(null)
              setFound({ code })
              setShots((n) => n + 1)
              setTimeout(() => latest.current.onCapture({ code, hints: latest.current.hints.trim() }), 450)
              return
            }
          } catch {
            // A frame that can't be read; try the next one.
          }
        }
        // Look more often while following a code, so the box keeps up.
        timer = setTimeout(tick, Date.now() - lastHitAt < LOST_AFTER ? 100 : 250)
      }
      tick()
    })

    return () => {
      stopped = true
      clearTimeout(timer)
    }
  }, [active, cam.status])

  // While no barcode is in view, box the most likely food or drink. A visual hint only:
  // it doesn't scan anything. Skipped quietly if the model can't load.
  useEffect(() => {
    if (!active || cam.status !== 'live') return
    let stopped = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let lastHitAt = 0
    setProductBox(null)

    getProductDetector().then((detector) => {
      if (!detector || stopped) return
      const tick = () => {
        if (stopped) return
        const video = videoRef.current
        const now = Date.now()
        if (now - codeSeenAt.current < LOST_AFTER) {
          setProductBox(null)
        } else if (video && video.readyState >= 2 && video.videoWidth && !document.hidden) {
          try {
            const box = detector.detect(video, performance.now())
            if (box) {
              lastHitAt = now
              setProductBox(padBox(toScreen(video, box), 6))
            } else if (now - lastHitAt > LOST_AFTER) {
              setProductBox(null)
            }
          } catch {
            setProductBox(null)
          }
        }
        timer = setTimeout(tick, PRODUCT_EVERY)
      }
      tick()
    })

    return () => {
      stopped = true
      clearTimeout(timer)
    }
  }, [active, cam.status])

  function toScreen(video: HTMLVideoElement, box: Box) {
    return videoBoxToScreen(
      box,
      { width: video.videoWidth, height: video.videoHeight },
      { width: video.clientWidth, height: video.clientHeight },
      facingRef.current === 'user',
    )
  }

  function codeScreenBox(video: HTMLVideoElement, hit: DetectedCode) {
    const { x, y, width, height } = hit.boundingBox
    return padBox(toScreen(video, { x, y, width, height }), 8)
  }

  const boxMotion = reduceMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.7 }

  function capture() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const width = Math.min(CAPTURE_WIDTH, video.videoWidth)
    const height = Math.round((video.videoHeight * width) / video.videoWidth)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d')?.drawImage(video, 0, 0, width, height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setFlash(true)
    setShots((n) => n + 1)
    setTimeout(() => setFlash(false), 180)
    onCapture({ image: dataUrl.slice(dataUrl.indexOf(',') + 1), preview: dataUrl, hints: hints.trim() })
  }

  const names = restrictionNames(profile)
  const live = cam.status === 'live'

  return (
    <main className={`scanner sx${live ? ' sx-live' : ''}${found && 'code' in found ? ' sx-found' : ''}`}>
      <video
        ref={videoRef}
        className={`scanner-video${facing === 'user' ? ' mirrored' : ''}`}
        playsInline
        muted
        autoPlay
      />
      <div className="sx-vignette" aria-hidden />
      <div className="sx-track" aria-hidden>
        <AnimatePresence>
          {productBox && !codeBox && (
            <motion.div
              key="product"
              className="sx-track-product"
              initial={{ ...productBox, opacity: 0 }}
              animate={{ ...productBox, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 160, damping: 26 }}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {codeBox && (
            <motion.div
              key="code"
              className={`sx-track-code${codeBox.read ? ' sx-track-read' : ''}`}
              initial={{ x: codeBox.x, y: codeBox.y, width: codeBox.width, height: codeBox.height, opacity: 0, scale: reduceMotion ? 1 : 1.12 }}
              animate={{ x: codeBox.x, y: codeBox.y, width: codeBox.width, height: codeBox.height, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.2 } }}
              transition={boxMotion}
            />
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {flash && (
          <motion.div className="scanner-flash" initial={{ opacity: 0.8 }} animate={{ opacity: 0.8 }} exit={{ opacity: 0, transition: { duration: 0.35 } }} />
        )}
      </AnimatePresence>

      <div className="scanner-top">
        <HomeButton onHome={onHome} />
        <span className="sx-wordmark" aria-hidden>foodex<span>.</span></span>
        <SearchPopup
          open={searchOpen}
          onOpenChange={setSearchOpen}
          popular={POPULAR_SEARCHES}
          onSubmit={(query) => onCapture({ query, hints: hints.trim() })}
        />
        {menu}
      </div>

      <div className="sx-checking">
        <button
          type="button"
          className={`sx-pill${names.length ? '' : ' sx-pill-empty'}`}
          onClick={onEditRestrictions}
          aria-label={names.length ? `Checking for ${names.join(', ')}. Edit restrictions` : 'Add your restrictions'}
        >
          {names.length ? <ShieldCheck size={15} className="sx-pill-icon" /> : <Plus size={15} className="sx-pill-icon" />}
          <span className="sx-pill-text">{names.length ? names.join(' · ') : 'Add your restrictions'}</span>
        </button>
      </div>

      {cam.status === 'error' ? (
        <CameraProblem state={cam} onRetry={() => setAttempt((n) => n + 1)} onSearch={() => setSearchOpen(true)} />
      ) : (
        <motion.div
          className="viewfinder sx-finder"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        >
          <motion.div
            key={shots}
            className="sx-corners"
            aria-hidden
            initial={shots ? { scale: 0.92 } : false}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          >
            <span /><span /><span /><span />
          </motion.div>
          {live && <div className="sx-scanline" />}
          <AnimatePresence>
            {found && (
              <motion.p
                key={'code' in found ? found.code : 'not-product'}
                className={`sx-status sx-code${'code' in found ? '' : ' sx-code-miss'}`}
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                role="status"
              >
                {'code' in found ? <><Barcode size={15} /> Found {found.code}</> : <><QrCode size={15} /> Not a product code</>}
              </motion.p>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {cam.status === 'starting' && (
              <motion.p className="sx-status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="sx-pulse" /> Starting camera…
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <div className="scanner-bottom">
        <div className="shutter-row">
          <HintPopover open={hintOpen} onOpenChange={setHintOpen} value={hints} onChange={setHints} />
          <motion.button
            className="shutter"
            onClick={capture}
            disabled={!live}
            aria-label="Scan"
            whileTap={live ? { scale: 0.9 } : undefined}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          >
            {live && <span className="sx-shutter-glow" aria-hidden />}
            <span className="shutter-disc">
              <Camera size={26} strokeWidth={1.9} />
            </span>
          </motion.button>
          <motion.button
            className="glass-btn glass-icon"
            onClick={() => {
              setFacing(facing === 'environment' ? 'user' : 'environment')
              setFlipTurns((n) => n + 1)
            }}
            disabled={cam.status === 'error' && cam.kind !== 'other'}
            aria-label={facing === 'environment' ? 'Switch to front camera' : 'Switch to back camera'}
            whileTap={{ scale: 0.9 }}
          >
            <motion.span
              className="mp-icon"
              animate={{ rotate: flipTurns * 180 }}
              transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
            >
              <SwitchCamera size={20} />
            </motion.span>
          </motion.button>
        </div>
        <p className="scanner-tip">
          {live ? <TextLoop items={TIPS} interval={3600} /> : 'Point at a package, plate or menu, then tap to Scan.'}
        </p>
      </div>
    </main>
  )
}

function CameraProblem({ state, onRetry, onSearch }: { state: Extract<CameraState, { status: 'error' }>; onRetry: () => void; onSearch: () => void }) {
  const text = {
    denied: {
      title: 'Camera access is blocked',
      body: 'Allow camera access for this site in your browser settings, then try again. You can also Search by name instead.',
    },
    insecure: {
      title: 'The camera needs a secure page',
      body: 'Open Foodex at its https:// address (the one the dev server prints) to use the camera.',
    },
    notfound: {
      title: 'No camera found',
      body: "This device or browser doesn't offer a camera. Search by name instead.",
    },
    other: {
      title: "The camera didn't start",
      body: state.message || 'Another app may be using it. Try again, or Search by name instead.',
    },
  }[state.kind]

  return (
    <motion.div
      className="camera-problem sx-problem"
      role="alert"
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.55 }}
    >
      <div className="sx-problem-icon">
        {state.kind === 'notfound' ? <CameraOff size={24} /> : <ScanLine size={24} />}
      </div>
      <h2>{text.title}</h2>
      <p>{text.body}</p>
      <div className="camera-problem-actions">
        <ShineButton className="sx-btn sx-btn-primary" onClick={onSearch}>
          <Search size={17} /> Search instead
        </ShineButton>
        {state.kind !== 'insecure' && (
          <button type="button" className="sx-btn sx-btn-ghost" onClick={onRetry}>
            <RotateCcw size={16} /> Try again
          </button>
        )}
      </div>
    </motion.div>
  )
}
