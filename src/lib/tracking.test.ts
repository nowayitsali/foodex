import { describe, expect, it } from 'vitest'
import { videoBoxToScreen } from './tracking'

describe('videoBoxToScreen', () => {
  it('scales and crops a wide video onto a tall phone screen', () => {
    // 1920x1080 on 375x812: scale 812/1080, 1443.6px wide, 534.3px cut off each side.
    const box = videoBoxToScreen({ x: 960, y: 540, width: 100, height: 50 }, { width: 1920, height: 1080 }, { width: 375, height: 812 }, false)
    const scale = 812 / 1080
    expect(box.x).toBeCloseTo(960 * scale - (1920 * scale - 375) / 2)
    expect(box.y).toBeCloseTo(540 * scale)
    expect(box.width).toBeCloseTo(100 * scale)
    expect(box.height).toBeCloseTo(50 * scale)
  })

  it('crops top and bottom when the screen is wider than the video', () => {
    const box = videoBoxToScreen({ x: 0, y: 0, width: 640, height: 480 }, { width: 640, height: 480 }, { width: 1280, height: 720 }, false)
    expect(box).toEqual({ x: 0, y: -120, width: 1280, height: 960 })
  })

  it('flips x for the mirrored front camera', () => {
    const plain = videoBoxToScreen({ x: 10, y: 20, width: 30, height: 40 }, { width: 100, height: 100 }, { width: 200, height: 200 }, false)
    const mirrored = videoBoxToScreen({ x: 10, y: 20, width: 30, height: 40 }, { width: 100, height: 100 }, { width: 200, height: 200 }, true)
    expect(plain).toEqual({ x: 20, y: 40, width: 60, height: 80 })
    expect(mirrored).toEqual({ x: 200 - 20 - 60, y: 40, width: 60, height: 80 })
  })
})
