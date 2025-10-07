'use client'

import { useEffect, useState } from 'react'
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
  params: { id: string }
}) {
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
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
      .eq('id', params.id)
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
  }, [params.id])

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
          <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
            렉시주니어
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
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                PDF로 저장
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
    </div>
  )
}
