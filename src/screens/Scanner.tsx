import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { RestrictionProfile } from '../domain/types'
import { CameraIcon, FlipIcon, SearchIcon } from '../components/icons'
import { restrictionNames } from '../components/ui'
import { ExpandingSearch } from '../components/ui/expanding-search'
import type { CheckRequest } from './CheckFlow'

type Facing = 'environment' | 'user'
type CameraState =
  | { status: 'starting' }
  | { status: 'live' }
  | { status: 'error'; kind: 'denied' | 'insecure' | 'notfound' | 'other'; message?: string }

// Typed out in the empty search box to show what you can search for.
const SEARCH_SUGGESTIONS = ['Search Nutella', 'Search Celsius', "Search Lay's Classic", 'Search Oreo', 'Search Kit Kat']

// Small photos cost fewer Gemini tokens and still read labels fine.
const CAPTURE_WIDTH = 768

interface Props {
  /** False while something covers the Scanner, so the camera turns off. */
  active: boolean
  profile: RestrictionProfile
  onCapture: (req: CheckRequest) => void
  onSearch: () => void
  /** The menu button, drawn in the top bar. */
  menu: ReactNode
}

export function Scanner({ active, profile, onCapture, onSearch, menu }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [facing, setFacing] = useState<Facing>('environment')
  const [cam, setCam] = useState<CameraState>({ status: 'starting' })
  const [attempt, setAttempt] = useState(0)
  const [hints, setHints] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [flash, setFlash] = useState(false)

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
    setTimeout(() => setFlash(false), 180)
    onCapture({ image: dataUrl.slice(dataUrl.indexOf(',') + 1), preview: dataUrl, hints: hints.trim() })
  }

  const names = restrictionNames(profile)
  const live = cam.status === 'live'

  return (
    <main className="scanner">
      <video
        ref={videoRef}
        className={`scanner-video${facing === 'user' ? ' mirrored' : ''}`}
        playsInline
        muted
        autoPlay
      />
      {flash && <div className="scanner-flash" />}

      <div className="scanner-top">
        <ExpandingSearch
          open={searchOpen}
          onOpenChange={setSearchOpen}
          label="Search a food or product"
          suggestions={SEARCH_SUGGESTIONS}
          onSubmit={(query) => onCapture({ query, hints: hints.trim() })}
        />
        {!searchOpen && <span className="scanner-brand">Foodex</span>}
        {menu}
      </div>

      <div className="scanner-checking">
        {names.length ? (
          <>Checking for {names.join(' · ')}</>
        ) : (
          <>No restrictions picked yet. Add them in Settings.</>
        )}
      </div>

      {cam.status === 'error' ? (
        <CameraProblem state={cam} onRetry={() => setAttempt((n) => n + 1)} onSearch={onSearch} />
      ) : (
        <div className="viewfinder" aria-hidden>
          <span /><span /><span /><span />
          {cam.status === 'starting' && <p>Starting camera…</p>}
        </div>
      )}

      <div className="scanner-bottom">
        <input
          className="hint-input"
          type="text"
          value={hints}
          onChange={(e) => setHints(e.target.value)}
          placeholder="Add a Hint: brand or restaurant (optional)"
          enterKeyHint="done"
        />
        <div className="shutter-row">
          <span className="shutter-side" />
          <button className="shutter" onClick={capture} disabled={!live} aria-label="Scan">
            <span />
          </button>
          <button
            className="glass-btn glass-icon shutter-side"
            onClick={() => setFacing(facing === 'environment' ? 'user' : 'environment')}
            disabled={cam.status === 'error' && cam.kind !== 'other'}
            aria-label={facing === 'environment' ? 'Switch to front camera' : 'Switch to back camera'}
          >
            <FlipIcon />
          </button>
        </div>
        <p className="scanner-tip">Point at a package, plate or menu, then tap to Scan.</p>
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
    <div className="camera-problem" role="alert">
      <div className="camera-problem-icon"><CameraIcon size={28} /></div>
      <h2>{text.title}</h2>
      <p>{text.body}</p>
      <div className="camera-problem-actions">
        <button className="btn btn-primary" onClick={onSearch}>
          <SearchIcon size={18} /> Search instead
        </button>
        {state.kind !== 'insecure' && (
          <button className="btn btn-glass" onClick={onRetry}>Try again</button>
        )}
      </div>
    </div>
  )
}
