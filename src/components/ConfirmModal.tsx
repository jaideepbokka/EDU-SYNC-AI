'use client'

import React, { useState } from 'react'
import { Modal } from './Modal'
import { AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void | Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDanger?: boolean
  requireReason?: boolean
  reasonPlaceholder?: string
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  isDanger = false,
  requireReason = false,
  reasonPlaceholder = 'Please specify the academic justification for this change (Required for Audit Log)...',
}: ConfirmModalProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setError('A valid justification is required for the faculty audit log.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await onConfirm(reason)
      setReason('')
      onClose()
    } catch (err: any) {
      setError(err?.message || 'An error occurred during execution.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              isDanger
                ? 'bg-rose-100 text-rose-600'
                : 'bg-amber-100 text-amber-600'
            }`}
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
          </div>
          <p className="text-sm text-[#292C32] leading-relaxed">
            {message}
          </p>
        </div>

        {requireReason && (
          <div>
            <label className="block text-xs font-semibold text-[#292C32] mb-1">
              Audit Reason / Academic Justification *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              className="w-full text-xs rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] p-3 text-[#292C32] placeholder:text-[#85878F] focus:outline-hidden focus:ring-2 focus:ring-[#8B6DE9]"
            />
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium text-[#85878F] hover:bg-[#F2F3F5] rounded-xl transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs transition-all cursor-pointer ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-[#292C32] hover:bg-[#1E2024]'
            } disabled:opacity-50`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
