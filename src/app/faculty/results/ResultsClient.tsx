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
          <p className="font-bold text-[#FCFBF7] text-xs">
            {row.student?.user?.name || 'Student'}
          </p>
          <p className="text-[10px] text-[#A8ACAF] font-mono">{row.student?.rollNo || 'N/A'}</p>
        </div>
      ),
    },
    {
      header: 'Semester',
      accessorKey: 'semester',
      sortable: true,
      cell: (row) => (
        <span className="px-2.5 py-1 rounded-lg bg-[#151718] border border-[#383C3F] text-xs font-semibold text-[#D8D4CA]">
          Sem {row.semester}
        </span>
      ),
    },
    {
      header: 'SGPA',
      accessorKey: 'sgpa',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-black text-[#E5CB90] text-sm">
          {Number(row.sgpa).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Cumulative CGPA',
      accessorKey: 'cgpa',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-[#FCFBF7]">
          {Number(row.cgpa).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Credits Earned',
      cell: (row) => (
        <span className="font-medium text-[#A8ACAF] text-xs">
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
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-[#383C3F] bg-[#151718] hover:bg-[#2E3235] text-xs font-semibold text-[#D8D4CA] hover:text-[#FCFBF7] transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#E5CB90]" />
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
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#383C3F]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5CB90]/20 text-[#FFF3C8] text-xs font-semibold mb-2 border border-[#E5CB90]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#E5CB90]" />
            <span>Academic Performance Registry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#FCFBF7] flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-[#E5CB90]" />
            <span>Official Semester Results & Marks Registry</span>
          </h1>
          <p className="text-xs text-[#A8ACAF] mt-1">
            Official university grade sheets, SGPA/CGPA computing, and internal/external mark distributions.
          </p>
        </div>
      </div>

      <DataTable
        data={results}
        columns={columns}
        searchKey="student"
        searchPlaceholder="Search student name..."
      />

      {/* Subject Breakdown Drawer / Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151718]/80 backdrop-blur-xs">
          <div className="bg-[#222527] rounded-3xl border border-[#383C3F] p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#383C3F] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#FCFBF7]">
                  {selectedResult.student?.user?.name || 'Student'} - Semester {selectedResult.semester}
                </h3>
                <p className="text-xs text-[#A8ACAF] mt-0.5">
                  Roll No: {selectedResult.student?.rollNo || 'N/A'} • SGPA:{' '}
                  <span className="text-[#E5CB90] font-mono font-bold">
                    {Number(selectedResult.sgpa).toFixed(2)}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="px-3 py-1.5 rounded-xl bg-[#151718] border border-[#383C3F] hover:bg-[#2E3235] text-xs font-semibold text-[#D8D4CA] hover:text-[#FCFBF7] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#151718] uppercase font-semibold text-[#A8ACAF] text-[10px] border-b border-[#383C3F]">
                  <tr>
                    <th className="px-3 py-2.5">Subject</th>
                    <th className="px-3 py-2.5">Credits</th>
                    <th className="px-3 py-2.5">Internal (50)</th>
                    <th className="px-3 py-2.5">External (50)</th>
                    <th className="px-3 py-2.5">Total (100)</th>
                    <th className="px-3 py-2.5">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#383C3F]">
                  {selectedResult.subjectResults && selectedResult.subjectResults.length > 0 ? (
                    selectedResult.subjectResults.map((sub: any) => (
                      <tr key={sub.id} className="hover:bg-[#151718]/40 transition-colors">
                        <td className="px-3 py-2.5 font-semibold text-[#FCFBF7]">
                          {sub.subjectCode} - {sub.subjectName}
                        </td>
                        <td className="px-3 py-2.5 text-[#D8D4CA]">{sub.credits}</td>
                        <td className="px-3 py-2.5 text-[#D8D4CA]">{sub.internalMarks}</td>
                        <td className="px-3 py-2.5 text-[#D8D4CA]">{sub.externalMarks}</td>
                        <td className="px-3 py-2.5 font-bold text-[#FCFBF7]">{sub.totalMarks}</td>
                        <td className="px-3 py-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-[#E5CB90]/20 text-[#FFF3C8] border border-[#E5CB90]/30 font-bold">
                            {sub.grade}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-[#A8ACAF]">
                        No individual subject marks logged for this result sheet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#383C3F]">
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
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
