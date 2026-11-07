// Shared timing for the supplied chip interactions.
export const motionTokens = {
  ease: { standard: [.22, 1, .36, 1], enter: [.16, 1, .3, 1] },
  duration: { instant: .12, fast: .16 },
  blur: { soft: 3, subtle: 1.5 },
  stagger: { item: .035 },
  spring: {
    morph: { type: 'spring' as const, stiffness: 430, damping: 35, mass: .8 },
    smooth: { type: 'spring' as const, stiffness: 340, damping: 33, mass: .9 },
    snappy: { type: 'spring' as const, stiffness: 500, damping: 32, mass: .7 },
  },
} as const
