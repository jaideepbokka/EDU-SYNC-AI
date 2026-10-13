'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/StatusBadge'
import { DataTable, Column } from '@/components/DataTable'
import {
  GraduationCap,
  Award,
  CheckCircle2,
  FileSpreadsheet,
  Eye,
  Trash2,
  Sparkles,
  Filter,
  AlertTriangle,
  BookOpen,
} from 'lucide-react'

interface ResultsClientProps {
  semesterResults: any[]
}

export function ResultsClient({ semesterResults: initialResults }: ResultsClientProps) {
  const router = useRouter()
  const [results, setResults] = useState<any[]>(initialResults)
  const [selectedResult, setSelectedResult] = useState<any | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filters
  const [semFilter, setSemFilter] = useState<string>('ALL')
  const [sectionFilter, setSectionFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    setResults(initialResults)
  }, [initialResults])

  const handleDeleteResult = async (id: string, semester: number, studentName: string, rollNo: string) => {
    // Optimistically remove from state immediately for 0ms visual feedback
    const previousResults = [...results]
    setResults((prev) => prev.filter((r) => r.id !== id))
    if (selectedResult?.id === id) {
      setSelectedResult(null)
    }

    try {
      const res = await fetch(`/api/results?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) {
        // Rollback on failure
        setResults(previousResults)
        throw new Error(data.error || 'Failed to delete semester result')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete semester result')
    }
  }

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      if (semFilter !== 'ALL' && String(r.semester) !== semFilter) return false
      if (sectionFilter !== 'ALL' && r.student?.section !== sectionFilter) return false
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false
      return true
    })
  }, [results, semFilter, sectionFilter, statusFilter])

  // Summary Metrics
  const stats = useMemo(() => {
    const total = filteredResults.length
    if (total === 0) return { total: 0, avgSgpa: '0.00', passed: 0, backlogs: 0 }
    const sumSgpa = filteredResults.reduce((acc, r) => acc + (r.sgpa || 0), 0)
    const passed = filteredResults.filter((r) => r.status === 'PASSED').length
    const backlogs = total - passed
    return {
      total,
      avgSgpa: (sumSgpa / total).toFixed(2),
      passed,
      backlogs,
    }
  }, [filteredResults])

  const columns: Column<any>[] = [
    {
      header: 'Student',
      accessorKey: 'student',
      cell: (row) => (
        <div>
          <p className="font-bold text-[#1E293B] text-xs">
            {row.student?.user?.name || 'Student'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-[#64748B] font-mono">{row.student?.rollNo || 'N/A'}</span>
            {row.student?.section && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-teal-50 text-teal-700 border border-teal-200">
                Sec {row.student.section}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Semester',
      accessorKey: 'semester',
      sortable: true,
      cell: (row) => (
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-[#1E293B]">
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
        <span className="font-mono font-bold text-[#1E293B]">
          {Number(row.cgpa).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Credits Earned',
      cell: (row) => (
        <span className="font-medium text-[#64748B] text-xs font-mono">
          {row.earnedCredits} / {row.totalCredits}
        </span>
      ),
    },
    {
      header: 'Standing',
      accessorKey: 'status',
      sortable: true,
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

        {/* Quick Summary Chips */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-center">
            <span className="text-[10px] uppercase font-bold text-purple-200 block">Avg SGPA</span>
            <span className="text-lg font-black text-white font-mono">{stats.avgSgpa}</span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-center">
            <span className="text-[10px] uppercase font-bold text-purple-200 block">Passed</span>
            <span className="text-lg font-black text-emerald-300">{stats.passed}</span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-center">
            <span className="text-[10px] uppercase font-bold text-purple-200 block">Backlogs</span>
            <span className="text-lg font-black text-rose-300">{stats.backlogs}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E9EAF0] shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Semester Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {[
              { id: 'ALL', label: 'All Semesters' },
              { id: '1', label: 'Sem 1' },
              { id: '2', label: 'Sem 2' },
              { id: '3', label: 'Sem 3' },
              { id: '4', label: 'Sem 4' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSemFilter(s.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  semFilter === s.id
                    ? 'bg-white text-[#625BEB] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Section Filter */}
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Sections (A, B, C)</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>

          {/* Standing Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Standings</option>
            <option value="PASSED">Passed Only</option>
            <option value="BACKLOG">Backlog Cases Only</option>
          </select>
        </div>

        <div className="text-xs font-bold text-slate-500">
          Showing {filteredResults.length} Result Sheets
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs">
        <DataTable
          data={filteredResults}
          columns={columns}
          searchKey="student"
          searchPlaceholder="Search student name or roll number (e.g. 24221A0501)..."
          pageSize={10}
        />
      </div>

      {/* Subject Breakdown Drawer / Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#E9EAF0] p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E9EAF0] pb-4">
              <div>
                <h3 className="text-base font-black text-[#1E293B]">
                  {selectedResult.student?.user?.name || 'Student'} - Semester {selectedResult.semester} Grade Sheet
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Roll No: <span className="font-mono font-bold text-[#1E293B]">{selectedResult.student?.rollNo || 'N/A'}</span> • Section {selectedResult.student?.section || 'A'} • SGPA:{' '}
                  <span className="text-[#625BEB] font-mono font-black text-sm">
                    {Number(selectedResult.sgpa).toFixed(2)}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 uppercase font-black text-slate-600 text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-3">Subject Code & Name</th>
                    <th className="px-3.5 py-3 text-center">Credits</th>
                    <th className="px-3.5 py-3 text-center">Internal (30)</th>
                    <th className="px-3.5 py-3 text-center">External (70)</th>
                    <th className="px-3.5 py-3 text-center">Total (100)</th>
                    <th className="px-3.5 py-3 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-medium">
                  {selectedResult.subjectResults && selectedResult.subjectResults.length > 0 ? (
                    selectedResult.subjectResults.map((sub: any) => (
                      <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3.5 py-2.5 font-bold text-[#1E293B]">
                          <span className="font-mono text-[#0D9488] block text-[11px]">{sub.subjectCode}</span>
                          <span>{sub.subjectName}</span>
                        </td>
                        <td className="px-3.5 py-2.5 text-center text-slate-600">{sub.credits}</td>
                        <td className="px-3.5 py-2.5 text-center text-slate-600 font-mono">{sub.internalMarks}</td>
                        <td className="px-3.5 py-2.5 text-center text-slate-600 font-mono">{sub.externalMarks}</td>
                        <td className="px-3.5 py-2.5 text-center font-bold text-[#1E293B] font-mono">{sub.totalMarks}</td>
                        <td className="px-3.5 py-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-md font-black font-mono text-[11px] ${
                              sub.grade === 'F'
                                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                : 'bg-[#D9D1F5]/60 text-[#625BEB] border border-[#A99AE8]/40'
                            }`}
                          >
                            {sub.grade}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                        No individual subject marks logged for this result sheet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-bold">
                Status:{' '}
                <strong className={selectedResult.status === 'PASSED' ? 'text-emerald-600' : 'text-rose-600'}>
                  {selectedResult.status}
                </strong>
              </span>
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
