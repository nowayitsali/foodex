// Small inline icons, so the app needs no icon library.

type P = { size?: number }

const line = (size = 22) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

export const SearchIcon = ({ size }: P) => (
  <svg {...line(size)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
)
export const MenuIcon = ({ size }: P) => (
  <svg {...line(size)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
)
export const FlipIcon = ({ size }: P) => (
  <svg {...line(size)}>
    <path d="M4 9a8 8 0 0 1 14.5-3.5L20 7" /><path d="M20 3v4h-4" />
    <path d="M20 15a8 8 0 0 1-14.5 3.5L4 17" /><path d="M4 21v-4h4" />
  </svg>
)
export const CloseIcon = ({ size }: P) => (
  <svg {...line(size)}><path d="M6 6l12 12M18 6 6 18" /></svg>
)
export const BackIcon = ({ size }: P) => (
  <svg {...line(size)}><path d="M15 5l-7 7 7 7" /></svg>
)
export const ChevronIcon = ({ size }: P) => (
  <svg {...line(size)}><path d="m9 5 7 7-7 7" /></svg>
)
export const CheckIcon = ({ size }: P) => (
  <svg {...line(size)}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
)
export const AlertIcon = ({ size }: P) => (
  <svg {...line(size)}><path d="M12 3 2 20h20L12 3z" /><path d="M12 10v4M12 17.5v.01" /></svg>
)
export const InfoIcon = ({ size }: P) => (
  <svg {...line(size)}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5v.01" /></svg>
)
export const CameraIcon = ({ size }: P) => (
  <svg {...line(size)}>
    <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13.5" r="3.5" />
  </svg>
)
export const PinIcon = ({ size }: P) => (
  <svg {...line(size)}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
)
export const StoreIcon = ({ size }: P) => (
  <svg {...line(size)}>
    <path d="M4 9.5 5.5 4h13L20 9.5" /><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" />
    <path d="M5 12v8h14v-8" /><path d="M10 20v-4h4v4" />
  </svg>
)
export const UserIcon = ({ size }: P) => (
  <svg {...line(size)}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
)
export const SettingsIcon = ({ size }: P) => (
  <svg {...line(size)}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" />
  </svg>
)
export const LinkIcon = ({ size = 14 }: P) => (
  <svg {...line(size)}><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
)
export const LeafIcon = ({ size }: P) => (
  <svg {...line(size)}>
    <path d="M5 19c0-8 5-14 15-15-.5 10-6.5 15-14 15" /><path d="M5 19c3-4 6-6.5 9-8" />
  </svg>
)

export const GoogleLogo = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
  </svg>
)

export const AppleLogo = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M16.4 1.4c0 1.1-.5 2.3-1.2 3.1-.7.9-2 1.6-3 1.6h-.3v-.4c0-1.1.6-2.3 1.2-3 .8-.9 2.1-1.6 3.2-1.7l.1.4zm4.5 15.7c0 .1-.5 1.6-1.5 3.1-.9 1.3-1.9 2.7-3.4 2.7s-1.9-.9-3.6-.9c-1.7 0-2.3.9-3.7.9s-2.3-1.3-3.4-2.8C4 18.3 3 15.5 3 12.9c0-4.3 2.8-6.6 5.6-6.6 1.4 0 2.7 1 3.6 1 .9 0 2.2-1 3.9-1 .6 0 2.9.1 4.4 2.2-.1.1-2.4 1.4-2.4 4.2 0 3.3 2.9 4.4 2.9 4.4z" />
  </svg>
)
