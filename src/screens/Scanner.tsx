import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { RestrictionProfile } from '../domain/types'
import { AnimatePresence, motion } from 'motion/react'
import { Camera, CameraOff, Plus, RotateCcw, ScanLine, Search, SwitchCamera } from 'lucide-react'
import { HintPopover } from '../components/HintPopover'
import { HomeButton } from '../components/HomeButton'
import { restrictionNames } from '../components/ui'
import { SearchPopup } from '../components/SearchPopup'
import { AnimatedGroup, ShineButton, TextLoop } from '../components/premium'
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

const TIPS = ['Point at a package label, then tap to Scan.', 'Snap a restaurant menu.', 'Or the plate in front of you.']

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
    <main className={`scanner sx${live ? ' sx-live' : ''}`}>
      <video
        ref={videoRef}
        className={`scanner-video${facing === 'user' ? ' mirrored' : ''}`}
        playsInline
        muted
        autoPlay
      />
      <div className="sx-vignette" aria-hidden />
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
        <span className="sx-checking-label">{names.length ? 'Checking for' : 'No restrictions yet'}</span>
        {names.length ? (
          <AnimatedGroup className="sx-chips" delay={0.15} stagger={0.05}>
            {names.map((n) => <span key={n} className="sx-chip">{n}</span>)}
          </AnimatedGroup>
        ) : (
          <button type="button" className="sx-chip sx-chip-add" onClick={onEditRestrictions}>
            <Plus size={13} /> Add your restrictions
          </button>
        )}
      </div>

      {cam.status === 'error' ? (
        <CameraProblem state={cam} onRetry={() => setAttempt((n) => n + 1)} onSearch={() => setSearchOpen(true)} />
      ) : (
        <motion.div
          className="viewfinder sx-finder"
          aria-hidden
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        >
          <motion.div
            key={shots}
            className="sx-corners"
            initial={shots ? { scale: 0.92 } : false}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          >
            <span /><span /><span /><span />
          </motion.div>
          {live && <div className="sx-scanline" />}
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
