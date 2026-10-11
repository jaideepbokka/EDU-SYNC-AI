'use client'

import React, { useState } from 'react'
import { StatusBadge } from '@/components/StatusBadge'
import { DataTable, Column } from '@/components/DataTable'
import { Modal } from '@/components/Modal'
import { History, Award, CheckCircle2, Eye, User, Sparkles } from 'lucide-react'

interface TestHistoryClientProps {
  attempts: any[]
}

export function TestHistoryClient({ attempts }: TestHistoryClientProps) {
  const [selectedAttempt, setSelectedAttempt] = useState<any | null>(null)

  const columns: Column<any>[] = [
    {
      header: 'Student Information',
      accessorKey: 'student',
      cell: (row) => (
        <div>
          <p className="font-bold text-[#292C32] text-xs">
            {row.student.user.name}
          </p>
          <p className="text-[10px] text-[#85878F] font-mono">{row.student.rollNo}</p>
        </div>
      ),
    },
    {
      header: 'Assessment & Subject',
      cell: (row) => (
        <div>
          <p className="font-bold text-[#292C32] text-xs">
            {row.assessment.title}
          </p>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#D9D1F5]/60 text-[#625BEB] border border-[#A99AE8]/40 font-mono font-bold">
            {row.assessment.subject?.code}
          </span>
        </div>
      ),
    },
    {
      header: 'Marks Scored',
      accessorKey: 'score',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#292C32]">
          {row.score} / {row.totalMarks}
        </span>
      ),
    },
    {
      header: 'Percentage',
      accessorKey: 'percentage',
      sortable: true,
      cell: (row) => (
        <span
          className={`font-bold text-xs ${
            row.percentage >= 75
              ? 'text-[#35C979]'
              : row.percentage >= 50
              ? 'text-[#8B6DE9]'
              : 'text-rose-600'
          }`}
        >
          {row.percentage}%
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Submission Date',
      cell: (row) => (
        <span className="text-[11px] text-[#85878F]">
          {row.submitTime ? new Date(row.submitTime).toLocaleDateString() : 'In Progress'}
        </span>
      ),
    },
    {
      header: 'Answers',
      cell: (row) => (
        <button
          onClick={() => setSelectedAttempt(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E9EAF0] bg-[#F2F3F5] hover:bg-[#E9EAF0] text-xs font-semibold text-[#292C32] cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Review</span>
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#8B6DE9] via-[#7A5CE5] to-[#625BEB] border border-[#A99AE8]/40 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 border border-white/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Submission Ledger • Exam Audits</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-white" />
            <span>Historical Assessment Submissions & Audit Log</span>
          </h1>
          <p className="text-xs text-white/90 mt-1 max-w-2xl">
            Complete chronological record of student examination attempts, automated scoring, and faculty grading audits.
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs">
        <DataTable
          data={attempts}
          columns={columns}
          searchKey="student"
          searchPlaceholder="Filter student name..."
        />
      </div>

      {/* Attempt Review Modal */}
      {selectedAttempt && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAttempt(null)}
          title={`Attempt Review: ${selectedAttempt.student.user.name} (${selectedAttempt.assessment.title})`}
          maxWidth="xl"
        >
          <div className="space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
            <div className="p-3 rounded-xl bg-[#F2F3F5] border border-[#E9EAF0] flex justify-between items-center text-xs">
              <span className="font-semibold text-[#292C32]">Final Evaluated Score:</span>
              <span className="font-mono font-black text-[#625BEB] text-sm">
                {selectedAttempt.score} / {selectedAttempt.totalMarks} ({selectedAttempt.percentage}%)
              </span>
            </div>

            {selectedAttempt.answers.map((ans: any, idx: number) => (
              <div
                key={ans.id}
                className="p-4 rounded-2xl border border-[#E9EAF0] bg-white space-y-2 text-xs"
              >
                <div className="flex justify-between items-center font-bold text-[#292C32]">
                  <span>Question {idx + 1} ({ans.question.marks} Marks)</span>
                  <span className="font-mono text-[#625BEB]">{ans.marksAwarded} Pts Awarded</span>
                </div>
                <p className="text-[#292C32] font-medium">
                  {ans.question.questionText}
                </p>
                {ans.studentAnswerText && (
                  <div className="p-2.5 rounded-xl bg-[#D9D1F5]/20 border border-[#A99AE8]/40 text-[#292C32]">
                    <strong className="text-[#625BEB] block text-[10px] uppercase font-bold">
                      Student Answer:
                    </strong>
                    <p className="mt-0.5">{ans.studentAnswerText}</p>
                  </div>
                )}
                {ans.facultyFeedback && (
                  <p className="text-[11px] text-[#625BEB] italic">
                    Feedback: &ldquo;{ans.facultyFeedback}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}

