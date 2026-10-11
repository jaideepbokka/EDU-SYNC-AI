import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import {
  evaluateBiometricMatch,
  BIOMETRIC_MATCH_THRESHOLD,
  SIMILARITY_THRESHOLD,
  BIOMETRIC_MODEL_INFO,
  validateEmbeddingVector,
} from '@/lib/biometrics'
import { evaluateLiveness, LivenessSample } from '@/lib/liveness'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'STUDENT' || !user.studentId) {
      return NextResponse.json(
        { error: 'Unauthorized: Student authentication required.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { sessionId, samples = [], liveDescriptor, latitude, longitude } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Attendance session ID is required.' },
        { status: 400 }
      )
    }

    if (!liveDescriptor || !Array.isArray(liveDescriptor) || liveDescriptor.length < 64) {
      return NextResponse.json(
        { error: 'FACE_NOT_DETECTED', message: 'No valid live facial biometric descriptor detected.' },
        { status: 400 }
      )
    }

    if (!samples || !Array.isArray(samples) || samples.length === 0) {
      return NextResponse.json(
        { error: 'FACE_NOT_DETECTED', message: 'Live camera sample frames required for presentation attack detection.' },
        { status: 400 }
      )
    }

    // 1. Fetch Student & Approved Biometric Face Template
    const student = await prisma.student.findUnique({
      where: { id: user.studentId },
      include: {
        user: true,
        faceTemplates: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: 'STUDENT_NOT_FOUND', message: 'Student record not found.' }, { status: 404 })
    }

    const approvedTemplate = student.faceTemplates[0]
    const templateVectorString = approvedTemplate?.embeddingVector || student.faceDescriptor
    const isTemplateFound = Boolean(templateVectorString)

    if (!isTemplateFound) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[BIOMETRIC DIAGNOSTIC]', {
          authenticatedStudentId: student.id,
          studentName: student.user.name,
          templateFound: false,
          rejectionReason: 'Biometric Face ID profile not enrolled in database.',
        })
      }

      await prisma.verificationAttempt.create({
        data: {
          studentId: student.id,
          sessionId,
          status: 'BLOCKED',
          failureReason: 'Student biometric profile not enrolled with faculty.',
        },
      })

      return NextResponse.json(
        {
          error: 'TEMPLATE_NOT_FOUND',
          message: `Biometric Face ID profile not enrolled for ${student.user.name}. Please contact your faculty instructor for supervised enrollment first.`,
        },
        { status: 403 }
      )
    }

    // 2. Parse & Validate Stored Biometric Template
    let templateVector: number[] = []
    try {
      templateVector = JSON.parse(templateVectorString!)
    } catch (e) {
      return NextResponse.json({ error: 'Corrupted biometric template format.' }, { status: 500 })
    }

    const liveValidation = validateEmbeddingVector(liveDescriptor)
    const templateValidation = validateEmbeddingVector(templateVector)

    if (!templateValidation.isValid) {
      return NextResponse.json(
        {
          error: 'TEMPLATE_CORRUPTED',
          message: `Stored biometric template for ${student.user.name} is malformed or incomplete. Please request faculty re-enrollment.`,
        },
        { status: 403 }
      )
    }

    // 3. Presentation Attack Detection (Liveness Verification)
    const livenessResult = evaluateLiveness(samples as LivenessSample[], liveDescriptor)

    if (!livenessResult.isLive) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[BIOMETRIC DIAGNOSTIC]', {
          authenticatedStudentId: student.id,
          templateStudentId: approvedTemplate?.studentId || student.id,
          templateFound: true,
          modelName: BIOMETRIC_MODEL_INFO.name,
          modelVersion: BIOMETRIC_MODEL_INFO.version,
          enrollmentEmbeddingDim: templateValidation.length,
          liveEmbeddingDim: liveValidation.length,
          enrollmentFinite: templateValidation.isFinite,
          liveFinite: liveValidation.isFinite,
          livenessPassed: false,
          livenessScore: livenessResult.livenessScore,
          rejectionReason: livenessResult.rejectionReason || 'Presentation attack detected.',
        })
      }

      await prisma.verificationAttempt.create({
        data: {
          studentId: student.id,
          sessionId,
          status: 'LIVENESS_FAILED',
          livenessScore: livenessResult.livenessScore,
          livenessPassed: false,
          failureReason: livenessResult.rejectionReason || 'Presentation attack detected.',
        },
      })

      return NextResponse.json(
        {
          error: 'LIVENESS_FAILED',
          message:
            livenessResult.rejectionReason ||
            'Unable to verify a live person. Presentation attack / photo reproduction detected. Please position your live face naturally.',
          livenessScore: livenessResult.livenessScore,
        },
        { status: 403 }
      )
    }

    // 4. Identity Matching (Zero-Proxy Security)
    const match = evaluateBiometricMatch(liveDescriptor, templateVector, BIOMETRIC_MATCH_THRESHOLD)

    // SAFE DIAGNOSTIC LOGGING (Development Mode — Strictly Zero Biometric or Auth Leakage)
    if (process.env.NODE_ENV !== 'production') {
      console.log('[BIOMETRIC DIAGNOSTIC]', {
        authenticatedStudentId: student.id,
        templateStudentId: approvedTemplate?.studentId || student.id,
        templateFound: true,
        modelName: BIOMETRIC_MODEL_INFO.name,
        modelVersion: BIOMETRIC_MODEL_INFO.version,
        enrollmentEmbeddingDim: templateValidation.length,
        liveEmbeddingDim: liveValidation.length,
        enrollmentFinite: templateValidation.isFinite,
        liveFinite: liveValidation.isFinite,
        similarityMetric: BIOMETRIC_MODEL_INFO.similarityMetric,
        calculatedDistance: match.distance,
        calculatedSimilarity: match.similarity,
        configuredDistanceThreshold: BIOMETRIC_MATCH_THRESHOLD,
        configuredSimilarityThreshold: SIMILARITY_THRESHOLD,
        finalComparisonResult: match.isMatch ? 'MATCH' : 'MISMATCH',
        rejectionReason: match.isMatch
          ? null
          : `Distance ${match.distance} exceeded calibrated threshold ${BIOMETRIC_MATCH_THRESHOLD}`,
      })
    }

    if (!match.isMatch) {
      await prisma.verificationAttempt.create({
        data: {
          studentId: student.id,
          sessionId,
          status: 'IDENTITY_MISMATCH',
          livenessScore: livenessResult.livenessScore,
          livenessPassed: true,
          similarityScore: match.similarity,
          distance: match.distance,
          isMatch: false,
          failureReason: `Face does not match registered identity (Distance: ${match.distance} > ${BIOMETRIC_MATCH_THRESHOLD})`,
        },
      })

      return NextResponse.json(
        {
          error: 'IDENTITY_MISMATCH',
          message: `Face mismatch: The person in front of the camera does NOT match ${student.user.name}'s approved biometric profile.`,
          distance: match.distance,
          similarityScore: match.similarity,
        },
        { status: 403 }
      )
    }

    // 5. Success: Identity and Liveness 100% Verified
    const attempt = await prisma.verificationAttempt.create({
      data: {
        studentId: student.id,
        sessionId,
        status: 'SUCCESS',
        livenessScore: livenessResult.livenessScore,
        livenessPassed: true,
        similarityScore: match.similarity,
        distance: match.distance,
        isMatch: true,
      },
    })

    // 6. Issue Cryptographically Secure, Single-Use, Short-Lived Verification Token (90s TTL)
    const tokenString = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 90 * 1000)

    const verificationToken = await prisma.verificationToken.create({
      data: {
        token: tokenString,
        studentId: student.id,
        sessionId,
        attemptId: attempt.id,
        expiresAt,
      },
    })

    return NextResponse.json({
      success: true,
      status: 'IDENTITY_VERIFIED',
      verificationToken: verificationToken.token,
      expiresAt: verificationToken.expiresAt,
      verifiedStudent: {
        id: student.id,
        name: student.user.name,
        rollNo: student.rollNo,
        registerNo: student.registerNo,
      },
      similarityScore: match.similarity,
      confidence: match.confidence,
      distance: match.distance,
      message: 'Identity and liveness verified successfully. Attendance check-in authorized.',
    })
  } catch (err: any) {
    console.error('Attendance verification error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
