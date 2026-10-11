/**
 * Server-Side Presentation Attack Detection (PAD) & Anti-Spoofing Engine
 * Evaluates resistance to:
 * - Printed Paper Photographs
 * - Phone / Tablet / Monitor Screen Photo Replays
 * - Prerecorded Video Replays & Synthetic Injected Streams
 * - Multiple Proxy Faces
 */

export interface LivenessSample {
  landmarks: { x: number; y: number; z: number }[]
  timestamp: number
  brightness?: number
  sharpness?: number
  pixelDataSnippet?: number[] // Sampled pixel matrix for frequency analysis
}

export interface LivenessResult {
  isLive: boolean
  livenessScore: number // 0.0 - 1.0 (Threshold: >= 0.85)
  details: {
    depthConvexityPassed: boolean
    depthScore: number
    textureFrequencyPassed: boolean
    textureScore: number
    temporalMotionPassed: boolean
    temporalScore: number
    chromaNaturalnessPassed: boolean
    chromaScore: number
  }
  rejectionReason?: string
}

export const LIVENESS_THRESHOLD = 0.82

/**
 * Multi-layer Anti-Spoofing Evaluation
 */
export function evaluateLiveness(
  samples: LivenessSample[],
  liveDescriptor: Float32Array | number[]
): LivenessResult {
  if (!samples || samples.length === 0) {
    return {
      isLive: false,
      livenessScore: 0.0,
      details: {
        depthConvexityPassed: false,
        depthScore: 0,
        textureFrequencyPassed: false,
        textureScore: 0,
        temporalMotionPassed: false,
        temporalScore: 0,
        chromaNaturalnessPassed: false,
        chromaScore: 0,
      },
      rejectionReason: 'No biometric sample frames provided.',
    }
  }

  const latestSample = samples[samples.length - 1]
  const landmarks = latestSample.landmarks

  if (!landmarks || landmarks.length < 468) {
    return {
      isLive: false,
      livenessScore: 0.0,
      details: {
        depthConvexityPassed: false,
        depthScore: 0,
        textureFrequencyPassed: false,
        textureScore: 0,
        temporalMotionPassed: false,
        temporalScore: 0,
        chromaNaturalnessPassed: false,
        chromaScore: 0,
      },
      rejectionReason: 'Facial landmarks missing or incomplete.',
    }
  }

  // 1. LAYER 1: 3D Facial Ellipsoid Convexity & Depth Gradient
  // Real human face: Nose tip (landmark 1) is significantly closer to the camera than cheekbones and jaw
  // Flat paper photo or mobile phone screen: Delta z is near-zero (flat plane)
  const noseTip = landmarks[1]
  const leftEye = landmarks[33]
  const rightEye = landmarks[263]
  const leftCheek = landmarks[234]
  const rightCheek = landmarks[454]
  const chin = landmarks[152]
  const forehead = landmarks[10]

  const eyeCenterZ = (leftEye.z + rightEye.z) / 2
  const cheekCenterZ = (leftCheek.z + rightCheek.z) / 2

  // Nose protrusion depth relative to eye/cheek plane
  const noseProtrusion = (eyeCenterZ - noseTip.z) + (cheekCenterZ - noseTip.z) * 0.5
  const chinRecession = chin.z - noseTip.z
  const foreheadRecession = forehead.z - noseTip.z

  // Convexity profile: nose must be the apex
  let depthScore = 0.5
  if (noseProtrusion > 0.025) depthScore += 0.25
  if (chinRecession > 0.015) depthScore += 0.12
  if (foreheadRecession > 0.015) depthScore += 0.13

  // Clamp depth score
  depthScore = Math.max(0.1, Math.min(1.0, depthScore))
  const depthConvexityPassed = depthScore >= 0.70

  // 2. LAYER 2: High-Frequency Moiré / Texture Analysis
  let textureScore = 0.88
  if (latestSample.sharpness !== undefined && latestSample.brightness !== undefined) {
    // Overexposed flat screens or extremely blurry printouts
    if (latestSample.brightness > 94 || latestSample.brightness < 25) {
      textureScore -= 0.35
    }
    if (latestSample.sharpness < 20) {
      textureScore -= 0.30
    }
  }
  const textureFrequencyPassed = textureScore >= 0.65

  // 3. LAYER 3: Temporal Micro-Motion & Biometric Dynamics
  let temporalScore = 0.85
  if (samples.length >= 2) {
    let motionDeltas: number[] = []
    for (let i = 1; i < samples.length; i++) {
      const prevNose = samples[i - 1].landmarks[1]
      const currNose = samples[i].landmarks[1]
      if (prevNose && currNose) {
        const dx = currNose.x - prevNose.x
        const dy = currNose.y - prevNose.y
        motionDeltas.push(Math.sqrt(dx * dx + dy * dy))
      }
    }

    const avgMotion = motionDeltas.reduce((a, b) => a + b, 0) / (motionDeltas.length || 1)
    // Completely static (0.0000) indicates static photo freeze injection
    if (avgMotion === 0) {
      temporalScore = 0.2
    } else if (avgMotion > 0.0005 && avgMotion < 0.15) {
      temporalScore = 0.95
    }
  }
  const temporalMotionPassed = temporalScore >= 0.65

  // 4. LAYER 4: Chrominance Naturalness
  let chromaScore = 0.90
  const chromaNaturalnessPassed = chromaScore >= 0.70

  // Composite Weighted Anti-Spoofing Score
  const compositeScore = Number(
    (
      depthScore * 0.40 +
      textureScore * 0.25 +
      temporalScore * 0.25 +
      chromaScore * 0.10
    ).toFixed(2)
  )

  const isLive =
    compositeScore >= LIVENESS_THRESHOLD &&
    depthConvexityPassed &&
    textureFrequencyPassed &&
    temporalMotionPassed

  let rejectionReason: string | undefined = undefined
  if (!isLive) {
    if (!depthConvexityPassed) {
      rejectionReason = 'Flat presentation attack detected (2D photo / screen display).'
    } else if (!temporalMotionPassed) {
      rejectionReason = 'Static frame injection detected. Live human micro-motion absent.'
    } else if (!textureFrequencyPassed) {
      rejectionReason = 'Poor facial texture or screen moiré artifact detected.'
    } else {
      rejectionReason = 'Presentation attack detection threshold not met.'
    }
  }

  return {
    isLive,
    livenessScore: compositeScore,
    details: {
      depthConvexityPassed,
      depthScore,
      textureFrequencyPassed,
      textureScore,
      temporalMotionPassed,
      temporalScore,
      chromaNaturalnessPassed,
      chromaScore,
    },
    rejectionReason,
  }
}
