// Draws boxes on the live camera view: where a barcode or a product sits on screen.

export type Box = { x: number; y: number; width: number; height: number }

/**
 * Turns a box in video pixels into a box in screen pixels on the <video>.
 * The video fills its element with object-fit: cover, so it is scaled up and cropped
 * evenly on both sides. The front camera is mirrored, so x is flipped.
 */
export function videoBoxToScreen(
  box: Box,
  video: { width: number; height: number },
  element: { width: number; height: number },
  mirrored: boolean,
): Box {
  const scale = Math.max(element.width / video.width, element.height / video.height)
  const offsetX = (element.width - video.width * scale) / 2
  const offsetY = (element.height - video.height * scale) / 2
  const width = box.width * scale
  const height = box.height * scale
  const x = box.x * scale + offsetX
  return {
    x: mirrored ? element.width - x - width : x,
    y: box.y * scale + offsetY,
    width,
    height,
  }
}

/** Grows a box by `pad` on every side. */
export function padBox(box: Box, pad: number): Box {
  return { x: box.x - pad, y: box.y - pad, width: box.width + pad * 2, height: box.height + pad * 2 }
}

// COCO objects that are food, or hold food or drink. "person" and the rest are left out.
const FOOD_OBJECTS = [
  'bottle', 'wine glass', 'cup', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
  'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake',
]

const VISION_VERSION = '1.1.1'
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VERSION}/wasm`
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/int8/1/efficientdet_lite0.tflite'

/** Finds the most likely food-ish object in a video frame, in video pixels. */
export type ProductDetector = { detect: (video: HTMLVideoElement, now: number) => Box | null }

let productPromise: Promise<ProductDetector | null> | null = null

/** Loads Google's MediaPipe object detector on first use. Null if it can't load. */
export function getProductDetector(): Promise<ProductDetector | null> {
  productPromise ??= (async () => {
    try {
      const { FilesetResolver, ObjectDetector } = await import('@mediapipe/tasks-vision')
      const files = await FilesetResolver.forVisionTasks(WASM_URL)
      // CPU, not GPU: the GPU path quietly finds nothing on some browsers. The model is small (~50ms a look).
      const detector = await ObjectDetector.createFromOptions(files, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
        runningMode: 'VIDEO',
        scoreThreshold: 0.35,
        maxResults: 3,
        categoryAllowlist: FOOD_OBJECTS,
      })
      let lastTime = 0
      return {
        detect(video, now) {
          // MediaPipe needs timestamps that always go up.
          lastTime = Math.max(now, lastTime + 1)
          const best = detector
            .detectForVideo(video, lastTime)
            .detections.filter((d) => d.boundingBox)
            .sort((a, b) => (b.categories[0]?.score ?? 0) - (a.categories[0]?.score ?? 0))[0]
          const b = best?.boundingBox
          return b ? { x: b.originX, y: b.originY, width: b.width, height: b.height } : null
        },
      }
    } catch {
      return null
    }
  })()
  return productPromise
}
