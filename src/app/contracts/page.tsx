'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Contract {
  id: string
  title: string
  contract_type: string
  risk_level: string | null
  created_at: string
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedRisk, setSelectedRisk] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadContracts()
  }, [])

  useEffect(() => {
    filterContracts()
  }, [searchQuery, selectedType, selectedRisk, contracts])

  const loadContracts = async () => {
    try {
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setContracts(data)
        setFilteredContracts(data)
      }
    } catch (error) {
      console.error('Error loading contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterContracts = () => {
    let filtered = [...contracts]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((contract) =>
        contract.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter((contract) => contract.contract_type === selectedType)
    }

    // Risk filter
    if (selectedRisk !== 'all') {
      filtered = filtered.filter((contract) => contract.risk_level === selectedRisk)
    }

    setFilteredContracts(filtered)
  }

  const contractTypes = [
    { value: 'all', label: '전체' },
    { value: 'employment', label: '근로계약서' },
    { value: 'lease', label: '임대차계약서' },
    { value: 'freelance', label: '용역계약서' },
    { value: 'other', label: '기타' },
  ]

  const riskLevels = [
    { value: 'all', label: '전체' },
    { value: 'safe', label: '안전' },
    { value: 'caution', label: '주의' },
    { value: 'danger', label: '위험' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    )
  }

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
            대시보드
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">계약서 검토 내역</h1>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="계약서 제목으로 검색..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                계약서 종류
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {contractTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                위험도
              </label>
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {riskLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            총 {filteredContracts.length}개의 계약서
          </div>
        </div>

        {/* Contracts List */}
        {filteredContracts.length > 0 ? (
          <div className="space-y-4">
            {filteredContracts.map((contract) => (
              <Link
                key={contract.id}
                href={`/contracts/${contract.id}`}
                className="block bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {contract.title || '제목 없음'}
                    </h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {contract.contract_type === 'employment' && '근로계약서'}
                        {contract.contract_type === 'lease' && '임대차계약서'}
                        {contract.contract_type === 'freelance' && '용역계약서'}
                        {contract.contract_type === 'other' && '기타 계약서'}
                      </span>
                      <span className="text-gray-500">
                        {new Date(contract.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>

                  <div>
                    {contract.risk_level && (
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold ${
                          contract.risk_level === 'safe'
                            ? 'bg-green-100 text-green-800'
                            : contract.risk_level === 'caution'
                            ? 'bg-yellow-100 text-yellow-800'
                            : contract.risk_level === 'danger'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {contract.risk_level === 'safe' && '✓ 안전'}
                        {contract.risk_level === 'caution' && '⚠ 주의'}
                        {contract.risk_level === 'danger' && '⛔ 위험'}
                        {!contract.risk_level && '분석중'}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedType !== 'all' || selectedRisk !== 'all'
                ? '검색 결과가 없습니다.'
                : '아직 검토한 계약서가 없습니다.'}
            </p>
            {!searchQuery && selectedType === 'all' && selectedRisk === 'all' && (
              <Link
                href="/upload"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                첫 계약서 업로드하기
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
