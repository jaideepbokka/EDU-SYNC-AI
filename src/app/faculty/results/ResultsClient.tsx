'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/StatusBadge'
import { DataTable, Column } from '@/components/DataTable'
import { GraduationCap, Award, CheckCircle2, FileSpreadsheet, Eye, Trash2, Sparkles } from 'lucide-react'

interface ResultsClientProps {
  semesterResults: any[]
}

export function ResultsClient({ semesterResults: initialResults }: ResultsClientProps) {
  const router = useRouter()
  const [results, setResults] = useState<any[]>(initialResults)
  const [selectedResult, setSelectedResult] = useState<any | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setResults(initialResults)
  }, [initialResults])

  const handleDeleteResult = async (id: string, semester: number, studentName: string, rollNo: string) => {
    const isConfirmed = confirm(
      `Are you sure you want to delete Semester ${semester} Result for "${studentName}" (${rollNo})?\n\nThis will permanently delete the semester grade sheet and all associated subject marks.`
    )
    if (!isConfirmed) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/results?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete semester result')

      // Optimistically remove from state
      setResults((prev) => prev.filter((r) => r.id !== id))
      if (selectedResult?.id === id) {
        setSelectedResult(null)
      }
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Failed to delete semester result')
    } finally {
      setDeletingId(null)
    }
  }

  const columns: Column<any>[] = [
    {
      header: 'Student',
      accessorKey: 'student',
      cell: (row) => (
        <div>
          <p className="font-bold text-[#292C32] text-xs">
            {row.student?.user?.name || 'Student'}
          </p>
          <p className="text-[10px] text-[#85878F] font-mono">{row.student?.rollNo || 'N/A'}</p>
        </div>
      ),
    },
    {
      header: 'Semester',
      accessorKey: 'semester',
      sortable: true,
      cell: (row) => (
        <span className="px-2.5 py-1 rounded-lg bg-[#F2F3F5] border border-[#E9EAF0] text-xs font-semibold text-[#292C32]">
          Sem {row.semester}
        </span>
      ),
    },
    {
      header: 'SGPA',
      accessorKey: 'sgpa',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-black text-[#625BEB] text-sm">
          {Number(row.sgpa).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Cumulative CGPA',
      accessorKey: 'cgpa',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-[#292C32]">
          {Number(row.cgpa).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Credits Earned',
      cell: (row) => (
        <span className="font-medium text-[#85878F] text-xs">
          {row.earnedCredits} / {row.totalCredits}
        </span>
      ),
    },
    {
      header: 'Standing',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedResult(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#A99AE8]/40 bg-[#D9D1F5]/40 hover:bg-[#D9D1F5]/70 text-xs font-bold text-[#625BEB] transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#625BEB]" />
            <span>Subject Marks</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleDeleteResult(
                row.id,
                row.semester,
                row.student?.user?.name || 'Student',
                row.student?.rollNo || 'N/A'
              )
            }
            disabled={deletingId === row.id}
            title="Delete semester result"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{deletingId === row.id ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
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
            <span>Academic Performance Registry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-white" />
            <span>Official Semester Results & Marks Registry</span>
          </h1>
          <p className="text-xs text-white/90 mt-1 max-w-2xl">
            Official university grade sheets, SGPA/CGPA computing, and internal/external mark distributions across enrolled student cohorts.
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs">
        <DataTable
          data={results}
          columns={columns}
          searchKey="student"
          searchPlaceholder="Search student name or roll number..."
        />
      </div>

      {/* Subject Breakdown Drawer / Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292C32]/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-[#E9EAF0] p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#E9EAF0] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#292C32]">
                  {selectedResult.student?.user?.name || 'Student'} - Semester {selectedResult.semester}
                </h3>
                <p className="text-xs text-[#85878F] mt-0.5">
                  Roll No: <span className="font-mono font-semibold text-[#292C32]">{selectedResult.student?.rollNo || 'N/A'}</span> • SGPA:{' '}
                  <span className="text-[#625BEB] font-mono font-bold">
                    {Number(selectedResult.sgpa).toFixed(2)}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="px-3 py-1.5 rounded-xl bg-[#F2F3F5] hover:bg-[#E9EAF0] border border-[#E9EAF0] text-xs font-semibold text-[#292C32] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#E9EAF0]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F2F3F5] uppercase font-semibold text-[#85878F] text-[10px] border-b border-[#E9EAF0]">
                  <tr>
                    <th className="px-3 py-2.5">Subject</th>
                    <th className="px-3 py-2.5">Credits</th>
                    <th className="px-3 py-2.5">Internal (50)</th>
                    <th className="px-3 py-2.5">External (50)</th>
                    <th className="px-3 py-2.5">Total (100)</th>
                    <th className="px-3 py-2.5">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9EAF0] bg-white">
                  {selectedResult.subjectResults && selectedResult.subjectResults.length > 0 ? (
                    selectedResult.subjectResults.map((sub: any) => (
                      <tr key={sub.id} className="hover:bg-[#F2F3F5] transition-colors">
                        <td className="px-3 py-2.5 font-semibold text-[#292C32]">
                          {sub.subjectCode} - {sub.subjectName}
                        </td>
                        <td className="px-3 py-2.5 text-[#85878F]">{sub.credits}</td>
                        <td className="px-3 py-2.5 text-[#85878F]">{sub.internalMarks}</td>
                        <td className="px-3 py-2.5 text-[#85878F]">{sub.externalMarks}</td>
                        <td className="px-3 py-2.5 font-bold text-[#292C32]">{sub.totalMarks}</td>
                        <td className="px-3 py-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-[#D9D1F5]/60 text-[#625BEB] border border-[#A99AE8]/40 font-bold font-mono">
                            {sub.grade}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-[#85878F]">
                        No individual subject marks logged for this result sheet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E9EAF0]">
              <button
                type="button"
                onClick={() =>
                  handleDeleteResult(
                    selectedResult.id,
                    selectedResult.semester,
                    selectedResult.student?.user?.name || 'Student',
                    selectedResult.student?.rollNo || 'N/A'
                  )
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Result Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

