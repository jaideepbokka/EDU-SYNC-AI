'use client'

import React, { useState } from 'react'
import { StatusBadge } from '@/components/StatusBadge'
import { DataTable, Column } from '@/components/DataTable'
import { Modal } from '@/components/Modal'
import { History, Award, CheckCircle2, Eye, User } from 'lucide-react'

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
          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
            {row.student.user.name}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">{row.student.rollNo}</p>
        </div>
      ),
    },
    {
      header: 'Assessment & Subject',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
            {row.assessment.title}
          </p>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-mono font-bold">
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
        <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
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
              ? 'text-emerald-600'
              : row.percentage >= 50
              ? 'text-amber-600'
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
        <span className="text-[11px] text-slate-500">
          {row.submitTime ? new Date(row.submitTime).toLocaleDateString() : 'In Progress'}
        </span>
      ),
    },
    {
      header: 'Answers',
      cell: (row) => (
        <button
          onClick={() => setSelectedAttempt(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Review</span>
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <History className="w-6 h-6 text-indigo-600" />
          <span>Historical Assessment Submissions & Audit Log</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Complete chronological record of student examination attempts, automated scoring, and faculty grading audits.
        </p>
      </div>

      <DataTable
        data={attempts}
        columns={columns}
        searchKey="student"
        searchPlaceholder="Filter student name..."
      />

      {/* Attempt Review Modal */}
      {selectedAttempt && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAttempt(null)}
          title={`Attempt Review: ${selectedAttempt.student.user.name} (${selectedAttempt.assessment.title})`}
          maxWidth="xl"
        >
          <div className="space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="font-semibold">Final Evaluated Score:</span>
              <span className="font-mono font-black text-indigo-600 text-sm">
                {selectedAttempt.score} / {selectedAttempt.totalMarks} ({selectedAttempt.percentage}%)
              </span>
            </div>

            {selectedAttempt.answers.map((ans: any, idx: number) => (
              <div
                key={ans.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex justify-between items-center font-bold">
                  <span>Question {idx + 1} ({ans.question.marks} Marks)</span>
                  <span className="font-mono text-indigo-600">{ans.marksAwarded} Pts Awarded</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {ans.question.questionText}
                </p>
                {ans.studentAnswerText && (
                  <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 text-slate-800 dark:text-slate-200">
                    <strong className="text-indigo-600 block text-[10px] uppercase font-bold">
                      Student Answer:
                    </strong>
                    <p className="mt-0.5">{ans.studentAnswerText}</p>
                  </div>
                )}
                {ans.facultyFeedback && (
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 italic">
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
