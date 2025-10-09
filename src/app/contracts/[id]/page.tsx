'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { AnalysisResult } from '@/types/database.types'

interface Contract {
  id: string
  title: string
  contract_type: string
  risk_level: string | null
  original_file_path: string
  analysis_result: AnalysisResult | null
}

export default function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const loadContract = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!data) {
      router.push('/dashboard')
      return
    }

    setContract(data)
    setLoading(false)
  }

  useEffect(() => {
    loadContract()

    // Auto-refresh every 3 seconds if analysis is pending
    const interval = setInterval(() => {
      if (contract && !contract.analysis_result) {
        loadContract()
      }
    }, 3000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const retryAnalysis = async () => {
    if (!contract) return

    setRetrying(true)
    try {
      const response = await fetch('/api/analyze-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId: contract.id,
          filePath: contract.original_file_path,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert('분석 재시도 실패: ' + (error.error || '알 수 없는 오류'))
        return
      }

      // Reload contract data
      await loadContract()
    } catch (error) {
      console.error('Retry error:', error)
      alert('분석 재시도 중 오류가 발생했습니다')
    } finally {
      setRetrying(false)
    }
  }

  const downloadPDF = async () => {
    if (!contract || !analysis) return

    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      // Set Korean font (using default font for now)
      doc.setFont('helvetica')
      doc.setFontSize(20)

      // Title
      doc.text('렉시주니어 계약서 분석 결과', 20, 20)

      // Contract Info
      doc.setFontSize(12)
      doc.text(`제목: ${contract.title || '제목 없음'}`, 20, 35)
      doc.text(
        `종류: ${
          contract.contract_type === 'employment'
            ? '근로계약서'
            : contract.contract_type === 'lease'
            ? '임대차계약서'
            : contract.contract_type === 'freelance'
            ? '용역계약서'
            : '기타 계약서'
        }`,
        20,
        42
      )
      doc.text(
        `위험도: ${
          contract.risk_level === 'safe'
            ? '안전'
            : contract.risk_level === 'caution'
            ? '주의'
            : contract.risk_level === 'danger'
            ? '위험'
            : '미분석'
        }`,
        20,
        49
      )

      // Summary
      doc.setFontSize(14)
      doc.text('전체 요약', 20, 60)
      doc.setFontSize(10)
      const summaryLines = doc.splitTextToSize(analysis.summary, 170)
      doc.text(summaryLines, 20, 68)

      let yPos = 68 + summaryLines.length * 5 + 10

      // Clauses
      doc.setFontSize(14)
      doc.text('조항별 분석', 20, yPos)
      yPos += 10

      doc.setFontSize(10)
      analysis.clauses.forEach((clause, index) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }

        doc.text(`[${index + 1}] ${clause.riskLevel === 'safe' ? '안전' : clause.riskLevel === 'caution' ? '주의' : '위험'}`, 20, yPos)
        yPos += 6

        const textLines = doc.splitTextToSize(clause.originalText, 170)
        doc.text(textLines, 20, yPos)
        yPos += textLines.length * 5 + 4

        const explLines = doc.splitTextToSize(clause.explanation, 170)
        doc.text(explLines, 20, yPos)
        yPos += explLines.length * 5 + 8
      })

      // Save PDF
      doc.save(`${contract.title || '계약서분석'}_${new Date().getTime()}.pdf`)
    } catch (error) {
      console.error('PDF generation error:', error)
      alert('PDF 생성 중 오류가 발생했습니다.')
    }
  }

  const handleShare = () => {
    const link = `${window.location.origin}/contracts/${id}`
    setShareLink(link)
    setShowShareModal(true)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
    alert('링크가 클립보드에 복사되었습니다!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    )
  }

  if (!contract) {
    return null
  }

  const analysis = contract.analysis_result as AnalysisResult | null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex flex-col">
            <span className="text-2xl font-bold text-blue-600">렉시주니어</span>
            <span className="text-xs text-gray-500">2025 DMC 이노베이션 CAMP 출품작</span>
          </Link>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            대시보드로 돌아가기
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Title and Risk Badge */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {contract.title || '계약서 분석 결과'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {contract.contract_type === 'employment' && '근로계약서'}
              {contract.contract_type === 'lease' && '임대차계약서'}
              {contract.contract_type === 'freelance' && '용역계약서'}
              {contract.contract_type === 'other' && '기타 계약서'}
            </span>
            {contract.risk_level && (
              <span
                className={`px-4 py-2 rounded-full text-sm font-bold ${
                  contract.risk_level === 'safe'
                    ? 'bg-green-100 text-green-800'
                    : contract.risk_level === 'caution'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {contract.risk_level === 'safe' && '✓ 안전'}
                {contract.risk_level === 'caution' && '⚠ 주의'}
                {contract.risk_level === 'danger' && '⛔ 위험'}
              </span>
            )}
          </div>
        </div>

        {!analysis ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              AI가 계약서를 분석하고 있습니다...
            </h2>
            <p className="text-gray-600 mb-6">
              잠시만 기다려주세요. 분석이 완료되면 자동으로 새로고침됩니다.
            </p>
            <button
              onClick={retryAnalysis}
              disabled={retrying}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {retrying ? '재시도 중...' : '분석 다시 시도하기'}
            </button>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                📋 전체 요약
              </h2>
              <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Clauses */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🔍 조항별 분석
              </h2>
              {analysis.clauses.map((clause) => (
                <div
                  key={clause.id}
                  className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                    clause.riskLevel === 'safe'
                      ? 'border-green-500'
                      : clause.riskLevel === 'caution'
                      ? 'border-yellow-500'
                      : 'border-red-500'
                  }`}
                >
                  {/* Risk Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                        clause.riskLevel === 'safe'
                          ? 'bg-green-100 text-green-800'
                          : clause.riskLevel === 'caution'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {clause.riskLevel === 'safe' && '안전'}
                      {clause.riskLevel === 'caution' && '주의'}
                      {clause.riskLevel === 'danger' && '위험'}
                    </span>
                  </div>

                  {/* Original Text */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">
                      원문 조항
                    </h3>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded border border-gray-200">
                      {clause.originalText}
                    </p>
                  </div>

                  {/* Explanation */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">
                      쉬운 설명
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {clause.explanation}
                    </p>
                  </div>

                  {/* Recommendation */}
                  {clause.recommendation && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">
                        💡 권장사항
                      </h3>
                      <p className="text-gray-700 leading-relaxed bg-blue-50 p-3 rounded">
                        {clause.recommendation}
                      </p>
                    </div>
                  )}

                  {/* Legal Basis */}
                  {clause.legalBasis && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">
                        📖 법적 근거
                      </h3>
                      <p className="text-gray-600 text-sm">{clause.legalBasis}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={downloadPDF}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                📄 PDF 다운로드
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                🖨️ 인쇄하기
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                🔗 공유하기
              </button>
              <Link
                href="/upload"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                다른 계약서 검토하기
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">링크 공유</h3>
            <p className="text-sm text-gray-600 mb-4">
              아래 링크를 복사하여 다른 사람과 공유하세요
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                복사
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
