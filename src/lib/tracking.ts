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

// The model knows 80 everyday objects (COCO). Packaged food isn't one of them, so a chip bag or
// juice box comes back with a random label like "kite" or "toothbrush". The box is only a hint,
// so take any object you'd hold, and skip people, animals, vehicles and furniture.
const NOT_PRODUCTS = new Set([
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
  'traffic light', 'fire hydrant', 'parking meter', 'bench', 'cat', 'dog', 'horse', 'sheep', 'cow',
  'elephant', 'bear', 'zebra', 'giraffe', 'chair', 'couch', 'bed', 'dining table', 'potted plant',
  'tv', 'laptop', 'keyboard', 'refrigerator', 'oven', 'sink',
])
// Real food labels win over a lucky guess.
const FOOD = new Set([
  'bottle', 'wine glass', 'cup', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
  'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake',
])
// Something filling nearly the whole frame is the background, not a product.
const MAX_AREA = 0.85

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
        scoreThreshold: 0.3,
        maxResults: 5,
      })
      let lastTime = 0
      return {
        detect(video, now) {
          // MediaPipe needs timestamps that always go up.
          lastTime = Math.max(now, lastTime + 1)
          const frame = video.videoWidth * video.videoHeight
          let best: { box: Box; rank: number } | null = null
          for (const d of detector.detectForVideo(video, lastTime).detections) {
            const top = d.categories[0]
            const b = d.boundingBox
            if (!top || !b || NOT_PRODUCTS.has(top.categoryName) || b.width * b.height > frame * MAX_AREA) continue
            const rank = top.score + (FOOD.has(top.categoryName) ? 0.2 : 0)
            if (!best || rank > best.rank) best = { box: { x: b.originX, y: b.originY, width: b.width, height: b.height }, rank }
          }
          return best?.box ?? null
        },
      }
    } catch {
      return null
    }
  })()
  return productPromise
}
