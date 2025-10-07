'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FormData {
  contractType: 'employment' | 'lease' | 'freelance'
  // Common fields
  partyA: string // 갑 (employer, landlord, client)
  partyB: string // 을 (employee, tenant, freelancer)
  startDate: string
  endDate: string

  // Employment specific
  position?: string
  salary?: string
  workHours?: string
  workDays?: string

  // Lease specific
  propertyAddress?: string
  deposit?: string
  monthlyRent?: string
  maintenanceFee?: string

  // Freelance specific
  projectDescription?: string
  projectAmount?: string
  deliverables?: string
  paymentTerms?: string
}

export default function GenerateContractPage() {
  const [contractType, setContractType] = useState<'employment' | 'lease' | 'freelance'>('employment')
  const [formData, setFormData] = useState<FormData>({
    contractType: 'employment',
    partyA: '',
    partyB: '',
    startDate: '',
    endDate: '',
  })
  const [loading, setLoading] = useState(false)
  const [generatedContract, setGeneratedContract] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleTypeChange = (type: 'employment' | 'lease' | 'freelance') => {
    setContractType(type)
    setFormData({
      contractType: type,
      partyA: '',
      partyB: '',
      startDate: '',
      endDate: '',
    })
    setGeneratedContract(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/generate-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate contract')
      }

      const data = await response.json()
      setGeneratedContract(data.contract)
    } catch (error) {
      console.error('Generate error:', error)
      alert('계약서 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!generatedContract) return

    const blob = new Blob([generatedContract], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${contractType}_contract_${new Date().getTime()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
            렉시주니어
          </Link>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            대시보드
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 표준 계약서 생성</h1>
          <p className="text-gray-600">
            필요한 정보를 입력하면 법적으로 안전한 표준 계약서를 자동으로 생성해드립니다
          </p>
        </div>

        {!generatedContract ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Contract Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                계약서 종류
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => handleTypeChange('employment')}
                  className={`p-4 border-2 rounded-lg text-center transition ${
                    contractType === 'employment'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">💼</div>
                  <div className="font-semibold">근로계약서</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('lease')}
                  className={`p-4 border-2 rounded-lg text-center transition ${
                    contractType === 'lease'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">🏠</div>
                  <div className="font-semibold">임대차계약서</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('freelance')}
                  className={`p-4 border-2 rounded-lg text-center transition ${
                    contractType === 'freelance'
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-2">📋</div>
                  <div className="font-semibold">용역계약서</div>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Common Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {contractType === 'employment' && '사업자명 (회사명)'}
                    {contractType === 'lease' && '임대인 (집주인)'}
                    {contractType === 'freelance' && '발주자 (클라이언트)'}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.partyA}
                    onChange={(e) => setFormData({ ...formData, partyA: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: (주)테크컴퍼니"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {contractType === 'employment' && '근로자명'}
                    {contractType === 'lease' && '임차인 (세입자)'}
                    {contractType === 'freelance' && '수주자 (프리랜서)'}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.partyB}
                    onChange={(e) => setFormData({ ...formData, partyB: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 홍길동"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    시작일<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    종료일<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Employment Specific Fields */}
              {contractType === 'employment' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      직무/직책<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.position || ''}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="예: 웹 개발자"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        급여 (월급)<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.salary || ''}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="예: 3,000,000원"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        근무시간<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.workHours || ''}
                        onChange={(e) => setFormData({ ...formData, workHours: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="예: 09:00 ~ 18:00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      근무일<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.workDays || ''}
                      onChange={(e) => setFormData({ ...formData, workDays: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="예: 주 5일 (월~금)"
                    />
                  </div>
                </>
              )}

              {/* Lease Specific Fields */}
              {contractType === 'lease' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      부동산 주소<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.propertyAddress || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, propertyAddress: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="예: 서울특별시 강남구 테헤란로 123 456호"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        보증금<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.deposit || ''}
                        onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="예: 10,000,000원"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        월세<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.monthlyRent || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, monthlyRent: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="예: 500,000원"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      관리비 (선택)
                    </label>
                    <input
                      type="text"
                      value={formData.maintenanceFee || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, maintenanceFee: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="예: 100,000원 (수도/전기/가스 포함)"
                    />
                  </div>
                </>
              )}

              {/* Freelance Specific Fields */}
              {contractType === 'freelance' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      프로젝트 설명<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.projectDescription || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, projectDescription: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="예: 쇼핑몰 웹사이트 디자인 및 개발"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      용역 대금<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.projectAmount || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, projectAmount: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="예: 5,000,000원"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      납품물<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.deliverables || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, deliverables: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="예: 디자인 시안 3종, HTML/CSS 파일, 관리자 페이지"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      대금 지급 조건<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.paymentTerms || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, paymentTerms: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="예: 계약금 30% 선급, 중도금 40% (개발 완료 시), 잔금 30% (최종 납품 후 7일 이내)"
                    />
                  </div>
                </>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '생성 중...' : '계약서 생성하기'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Generated Contract Display */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">생성된 계약서</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    다운로드
                  </button>
                  <button
                    onClick={() => setGeneratedContract(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    새로 만들기
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                  {generatedContract}
                </pre>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>중요 안내:</strong> 생성된 계약서는 표준 양식을 기반으로 한
                    참고용입니다. 실제 사용 전에 반드시 전문가(변호사, 노무사 등)의 검토를
                    받으시기 바랍니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
