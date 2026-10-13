'use client'

import React, { useState } from 'react'
import {
  CreditCard,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Printer,
  ShieldCheck,
  Building,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Info,
  Calendar,
  DollarSign,
  QrCode,
  X,
} from 'lucide-react'

interface StudentFeesClientProps {
  student: any
  fee: any
}

export function StudentFeesClient({ student, fee }: StudentFeesClientProps) {
  const [currentFee, setCurrentFee] = useState(fee)
  const [paying, setPaying] = useState(false)
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [payAmountInput, setPayAmountInput] = useState(currentFee?.dueAmount || 0)
  const [payMode, setPayMode] = useState('UPI')
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const totalFee = Number(currentFee?.totalFee || 55000)
  const paidAmount = Number(currentFee?.paidAmount || 55000)
  const dueAmount = Number(currentFee?.dueAmount || 0)
  const tuitionFee = Number(currentFee?.tuitionFee || 55000)
  const specialLabFee = Number(currentFee?.specialLabFee || 0)
  const libraryFee = Number(currentFee?.libraryFee || 0)
  const examFee = Number(currentFee?.examFee || 0)

  const isFullyPaid = dueAmount <= 0

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPaying(true)
    setSuccessMsg('')

    try {
      const res = await fetch('/api/student/fees/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: payAmountInput,
          paymentMode: payMode === 'UPI' ? 'ONLINE_UPI' : 'NET_BANKING',
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Payment failed')

      setCurrentFee(data.fee)
      setPayModalOpen(false)
      setSuccessMsg(data.message)
      setReceiptModalOpen(true)
    } catch (err: any) {
      alert(err.message || 'Payment error')
    } finally {
      setPaying(false)
    }
  }

  const printReceipt = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#292C32] via-[#1E2024] to-[#292C32] border border-[#3E424B] p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2.5 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>EduSync AI • Academic Fee Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-emerald-400" />
            <span>Academic Fees & Financial Clearance</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            View prescribed tuition fees, institutional breakdown, verified transaction receipts, and digital clearance records for Semester {student.currentSemester} (AY {currentFee?.academicYear || '2025-2026'}).
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setReceiptModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          {!isFullyPaid && (
            <button
              onClick={() => {
                setPayAmountInput(dueAmount)
                setPayModalOpen(true)
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay Outstanding ₹{dueAmount.toLocaleString('en-IN')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mandatory Minimum Fee Policy Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start sm:items-center gap-3 text-amber-900 shadow-xs">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex-1 text-xs">
          <span className="font-bold">Mandatory University Minimum Fee Standard: </span>
          The minimum institutional tuition fee baseline for every enrolled engineering student is strictly set at{' '}
          <strong className="font-black text-amber-950 underline decoration-amber-500">
            ₹55,000.00 per academic cycle
          </strong>
          . All additional compute lab access, library subscriptions, and examination fees are calculated above this baseline.
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Top Financial KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Prescribed Fee */}
        <div className="p-5 rounded-2xl bg-white border border-[#E9EAF0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#85878F] font-semibold">
            <span>Total Prescribed Fee</span>
            <span className="p-1.5 rounded-lg bg-[#F2F3F5] text-[#292C32]">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#292C32]">
              ₹{totalFee.toLocaleString('en-IN')}
            </span>
            <p className="text-[11px] text-[#85878F] mt-0.5">
              Minimum Standard: <strong className="text-emerald-600">₹55,000.00</strong>
            </p>
          </div>
        </div>

        {/* Paid Amount */}
        <div className="p-5 rounded-2xl bg-white border border-[#E9EAF0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#85878F] font-semibold">
            <span>Amount Paid</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-600">
              ₹{paidAmount.toLocaleString('en-IN')}
            </span>
            <p className="text-[11px] text-[#85878F] mt-0.5">
              Verified by BVC Accounts Dept
            </p>
          </div>
        </div>

        {/* Balance Due */}
        <div className="p-5 rounded-2xl bg-white border border-[#E9EAF0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#85878F] font-semibold">
            <span>Balance Due</span>
            <span className={`p-1.5 rounded-lg ${isFullyPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-black ${isFullyPaid ? 'text-emerald-600' : 'text-rose-600'}`}>
              ₹{dueAmount.toLocaleString('en-IN')}
            </span>
            <p className="text-[11px] text-[#85878F] mt-0.5">
              {isFullyPaid ? 'Zero Balance Clearance' : 'Due by 30th April 2026'}
            </p>
          </div>
        </div>

        {/* Clearance Status */}
        <div className="p-5 rounded-2xl bg-white border border-[#E9EAF0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#85878F] font-semibold">
            <span>Account Status</span>
            <span className="p-1.5 rounded-lg bg-[#D9D1F5]/40 text-[#625BEB]">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isFullyPaid
                  ? 'bg-emerald-100 text-emerald-800'
                  : currentFee?.status === 'PARTIAL'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isFullyPaid ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
              {isFullyPaid ? 'Clearance Issued' : currentFee?.status || 'PARTIAL'}
            </span>
            <p className="text-[11px] text-[#85878F] mt-1.5 font-mono">
              Ref: {currentFee?.paymentReference || 'BVC-FEE-2026-0101'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Fee Itemized Structure + Student Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Fee Breakdown Table */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E9EAF0] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#292C32] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#8B6DE9]" />
                <span>Semester Fee Structure & Head Breakdown</span>
              </h2>
              <p className="text-xs text-[#85878F] mt-0.5">
                Official institutional schedule for CSE Department (Semester {student.currentSemester})
              </p>
            </div>
            <span className="text-xs font-bold text-[#625BEB] bg-[#D9D1F5]/50 px-2.5 py-1 rounded-lg border border-[#A99AE8]/40">
              AY 2025-26
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E9EAF0] text-[#85878F] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-2">Head Description</th>
                  <th className="py-2.5 px-2">Category</th>
                  <th className="py-2.5 px-2 text-right">Prescribed Amount</th>
                  <th className="py-2.5 px-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EAF0]">
                <tr>
                  <td className="py-3 px-2">
                    <p className="font-bold text-[#292C32]">Institutional Tuition Fee</p>
                    <p className="text-[10px] text-[#85878F]">Mandatory baseline tuition prescribed by Council</p>
                  </td>
                  <td className="py-3 px-2 text-[#85878F]">Core Academic (Mandatory)</td>
                  <td className="py-3 px-2 font-mono font-bold text-right text-[#292C32]">
                    ₹{tuitionFee.toLocaleString('en-IN')}.00
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      Minimum ₹55,000
                    </span>
                  </td>
                </tr>

                {specialLabFee > 0 && (
                  <tr>
                    <td className="py-3 px-2">
                      <p className="font-bold text-[#292C32]">High-Performance Compute & AI Lab Fee</p>
                      <p className="text-[10px] text-[#85878F]">GPU servers, cloud quota & robotics equipment</p>
                    </td>
                    <td className="py-3 px-2 text-[#85878F]">Laboratory Facilities</td>
                    <td className="py-3 px-2 font-mono font-bold text-right text-[#292C32]">
                      ₹{specialLabFee.toLocaleString('en-IN')}.00
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                        Included
                      </span>
                    </td>
                  </tr>
                )}

                {libraryFee > 0 && (
                  <tr>
                    <td className="py-3 px-2">
                      <p className="font-bold text-[#292C32]">Central Digital Library & IEEE Access</p>
                      <p className="text-[10px] text-[#85878F]">Global research journals and digital book bank</p>
                    </td>
                    <td className="py-3 px-2 text-[#85878F]">Resource Subscriptions</td>
                    <td className="py-3 px-2 font-mono font-bold text-right text-[#292C32]">
                      ₹{libraryFee.toLocaleString('en-IN')}.00
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                        Included
                      </span>
                    </td>
                  </tr>
                )}

                {examFee > 0 && (
                  <tr>
                    <td className="py-3 px-2">
                      <p className="font-bold text-[#292C32]">University Examination & Evaluation Fee</p>
                      <p className="text-[10px] text-[#85878F]">Mid-term & End-term external evaluation charge</p>
                    </td>
                    <td className="py-3 px-2 text-[#85878F]">Evaluation Fee</td>
                    <td className="py-3 px-2 font-mono font-bold text-right text-[#292C32]">
                      ₹{examFee.toLocaleString('en-IN')}.00
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                        Included
                      </span>
                    </td>
                  </tr>
                )}

                <tr className="bg-[#FAF9FF] font-bold">
                  <td className="py-3.5 px-2 text-[#292C32]">
                    Total Academic Fee Assessment
                  </td>
                  <td className="py-3.5 px-2 text-[#85878F]">Annual Aggregate</td>
                  <td className="py-3.5 px-2 font-mono text-right text-sm text-[#8B6DE9]">
                    ₹{totalFee.toLocaleString('en-IN')}.00
                  </td>
                  <td className="py-3.5 px-2 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                      Approved
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-[#85878F] gap-2">
            <span>Payment Mode: <strong>{currentFee?.paymentMode || 'Online Student Gateway'}</strong></span>
            <span>Last Payment Date: <strong>{currentFee?.lastPaymentDate ? new Date(currentFee.lastPaymentDate).toLocaleDateString() : 'Pending'}</strong></span>
          </div>
        </div>

        {/* Right Column: Student Details & Clearance Card */}
        <div className="rounded-3xl bg-white border border-[#E9EAF0] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-[#E9EAF0] pb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8B6DE9] to-[#625BEB] text-white flex items-center justify-center font-black">
              {student.user.name?.charAt(0) || 'S'}
            </div>
            <div>
              <h3 className="text-sm font-black text-[#292C32]">{student.user.name}</h3>
              <p className="text-[11px] text-[#85878F]">Roll: {student.rollNo} • {student.registerNo}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#F2F3F5]">
              <span className="text-[#85878F]">Branch / Department:</span>
              <span className="font-bold text-[#292C32]">{student.department.name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F2F3F5]">
              <span className="text-[#85878F]">Batch & Section:</span>
              <span className="font-bold text-[#292C32]">{student.batch} (Sec {student.section})</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F2F3F5]">
              <span className="text-[#85878F]">Guardian Name:</span>
              <span className="font-bold text-[#292C32]">{student.guardianName || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F2F3F5]">
              <span className="text-[#85878F]">Guardian Phone:</span>
              <span className="font-bold text-[#292C32]">{student.guardianPhone || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#F2F3F5]">
              <span className="text-[#85878F]">Hall Ticket Eligibility:</span>
              <span className={`font-bold ${isFullyPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isFullyPaid ? '✓ Eligible for Exam Pass' : '⚠ Clearance Required'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#F2F3F5] text-[11px] text-[#85878F] flex items-center gap-2">
            <QrCode className="w-4 h-4 text-[#625BEB] shrink-0" />
            <span>Digital verification QR embedded in official fee receipt.</span>
          </div>

          <button
            onClick={() => setReceiptModalOpen(true)}
            className="w-full py-2.5 rounded-xl bg-[#292C32] hover:bg-[#1E2024] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>View & Download Official Receipt</span>
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E9EAF0] space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E9EAF0] pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-[#292C32]">Online Fee Remittance</h3>
              </div>
              <button
                onClick={() => setPayModalOpen(false)}
                className="p-1 rounded-lg text-[#85878F] hover:bg-[#F2F3F5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#292C32] mb-1">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  max={dueAmount}
                  value={payAmountInput}
                  onChange={(e) => setPayAmountInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl border border-[#E9EAF0] bg-[#F2F3F5] focus:bg-white focus:border-emerald-500 transition-all"
                  required
                />
                <p className="text-[11px] text-[#85878F] mt-1">
                  Total outstanding balance: ₹{dueAmount.toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#292C32] mb-1.5">
                  Select Payment Gateway
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayMode('UPI')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      payMode === 'UPI'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-[#E9EAF0] text-[#85878F] hover:bg-[#F2F3F5]'
                    }`}
                  >
                    <span>Instant UPI / QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMode('NET_BANKING')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      payMode === 'NET_BANKING'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-[#E9EAF0] text-[#85878F] hover:bg-[#F2F3F5]'
                    }`}
                  >
                    <span>Net Banking / Card</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 text-[11px] text-[#85878F]">
                🔒 Secured via EduSync AI 256-Bit SSL Institutional Payment Gateway.
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E9EAF0] text-xs font-bold text-[#85878F] hover:bg-[#F2F3F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paying}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {paying ? 'Authorizing Payment...' : `Confirm Pay ₹${payAmountInput}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Fee Receipt Modal */}
      {receiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-[#E9EAF0] space-y-6 animate-in zoom-in-95 duration-150 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E9EAF0] pb-4 print:hidden">
              <div className="flex items-center gap-2 text-xs font-bold text-[#625BEB]">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Official Institutional Receipt</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={printReceipt}
                  className="px-3.5 py-1.5 rounded-xl bg-[#292C32] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#1E2024] cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setReceiptModalOpen(false)}
                  className="p-1.5 rounded-xl text-[#85878F] hover:bg-[#F2F3F5] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Body */}
            <div className="border-2 border-[#292C32] rounded-2xl p-6 sm:p-8 space-y-6 bg-white text-[#292C32]">
              {/* Institution Title */}
              <div className="text-center border-b-2 border-[#292C32] pb-4">
                <h2 className="text-xl font-black uppercase tracking-tight text-[#292C32]">
                  Bonam Venkata Chalamaya Engineering College
                </h2>
                <p className="text-[11px] font-semibold text-[#85878F]">
                  Affiliated to JNTUK • Approved by AICTE • Accredited by NBA & NAAC A+
                </p>
                <p className="text-[10px] text-[#85878F]">Allavaram, East Godavari District, Andhra Pradesh</p>
                <div className="mt-2 inline-block px-4 py-1 rounded-full bg-[#292C32] text-white text-xs font-black uppercase tracking-wider">
                  Academic Fee Receipt • AY {currentFee?.academicYear || '2025-26'}
                </div>
              </div>

              {/* Receipt Reference Bar */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[#85878F]">Receipt Number:</p>
                  <p className="font-mono font-bold text-[#292C32]">{currentFee?.paymentReference || 'BVC-FEE-2026-0101'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#85878F]">Date of Issue:</p>
                  <p className="font-bold text-[#292C32]">{new Date().toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              {/* Student Metadata Table */}
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E9EAF0] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[#85878F] block text-[10px]">Student Name</span>
                  <strong className="text-[#292C32]">{student.user.name}</strong>
                </div>
                <div>
                  <span className="text-[#85878F] block text-[10px]">Roll Number</span>
                  <strong className="text-[#292C32]">{student.rollNo}</strong>
                </div>
                <div>
                  <span className="text-[#85878F] block text-[10px]">Registration No</span>
                  <strong className="text-[#292C32]">{student.registerNo}</strong>
                </div>
                <div>
                  <span className="text-[#85878F] block text-[10px]">Department</span>
                  <strong className="text-[#292C32]">{student.department.name}</strong>
                </div>
                <div>
                  <span className="text-[#85878F] block text-[10px]">Semester / Section</span>
                  <strong className="text-[#292C32]">Semester {student.currentSemester} (Sec {student.section})</strong>
                </div>
                <div>
                  <span className="text-[#85878F] block text-[10px]">Batch</span>
                  <strong className="text-[#292C32]">{student.batch}</strong>
                </div>
              </div>

              {/* Fee Items Table */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#292C32] text-[#85878F] font-bold">
                    <th className="py-2 text-left">Fee Head Particulars</th>
                    <th className="py-2 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2">Base Tuition Fee (Mandatory Minimum Standard)</td>
                    <td className="py-2 font-mono text-right">₹{tuitionFee.toLocaleString('en-IN')}.00</td>
                  </tr>
                  {specialLabFee > 0 && (
                    <tr>
                      <td className="py-2">Special Lab & Compute Infrastructure</td>
                      <td className="py-2 font-mono text-right">₹{specialLabFee.toLocaleString('en-IN')}.00</td>
                    </tr>
                  )}
                  {libraryFee > 0 && (
                    <tr>
                      <td className="py-2">Central Library & Digital IEEE Subscriptions</td>
                      <td className="py-2 font-mono text-right">₹{libraryFee.toLocaleString('en-IN')}.00</td>
                    </tr>
                  )}
                  {examFee > 0 && (
                    <tr>
                      <td className="py-2">University Assessment & Examination Charges</td>
                      <td className="py-2 font-mono text-right">₹{examFee.toLocaleString('en-IN')}.00</td>
                    </tr>
                  )}
                  <tr className="font-bold border-t-2 border-[#292C32]">
                    <td className="py-2 text-[#292C32]">Total Prescribed Fee</td>
                    <td className="py-2 font-mono text-right text-sm">₹{totalFee.toLocaleString('en-IN')}.00</td>
                  </tr>
                  <tr className="font-bold text-emerald-700">
                    <td className="py-2">Total Amount Remitted & Cleared</td>
                    <td className="py-2 font-mono text-right text-sm">₹{paidAmount.toLocaleString('en-IN')}.00</td>
                  </tr>
                  <tr className="font-bold text-rose-700">
                    <td className="py-2">Outstanding Dues</td>
                    <td className="py-2 font-mono text-right">₹{dueAmount.toLocaleString('en-IN')}.00</td>
                  </tr>
                </tbody>
              </table>

              {/* Seal & Authorization */}
              <div className="pt-6 border-t border-[#E9EAF0] flex items-end justify-between text-xs">
                <div className="space-y-1">
                  <div className="w-16 h-16 border border-emerald-500/40 rounded-full flex items-center justify-center text-[9px] font-black uppercase text-emerald-700 text-center leading-tight">
                    BVC<br />ACCOUNTS<br />PAID
                  </div>
                  <span className="text-[10px] text-[#85878F] block">Digitally Signed & Validated</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#292C32]">Finance & Accounts Officer</p>
                  <p className="text-[10px] text-[#85878F]">BVC Engineering College</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
