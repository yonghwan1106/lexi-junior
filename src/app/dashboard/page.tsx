import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: contracts } = await supabase
    .from('contracts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
            렉시주니어
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Subscription Info */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {subscription?.plan_type === 'free' && '무료 플랜'}
                {subscription?.plan_type === 'plus' && 'Plus 플랜'}
                {subscription?.plan_type === 'pro' && 'Pro 플랜'}
              </h2>
              <p className="text-blue-100">
                {subscription?.plan_type === 'free' &&
                  '매월 2회 무료 문서 검토 가능'}
                {subscription?.plan_type === 'plus' && '무제한 문서 검토'}
                {subscription?.plan_type === 'pro' &&
                  '무제한 문서 검토 + 팀 기능'}
              </p>
            </div>
            {subscription?.plan_type === 'free' && (
              <Link
                href="/pricing"
                className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
              >
                업그레이드
              </Link>
            )}
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              계약서 검토
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              계약서 사진을 찍거나 PDF 파일을 업로드하세요
            </p>
            <Link
              href="/upload"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              계약서 업로드
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              AI 법률 상담
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              법률 관련 궁금한 점을 AI에게 물어보세요
            </p>
            <Link
              href="/chat"
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              렉시챗 시작하기
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              표준 계약서 생성
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              필요한 정보를 입력하여 안전한 계약서를 만드세요
            </p>
            <Link
              href="/generate"
              className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
            >
              계약서 생성하기
            </Link>
          </div>
        </div>

        {/* Support Info */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">🗺️ 법률 지원 기관 안내</h2>
              <p className="text-purple-100">
                무료 법률 상담이 필요하신가요? 전국의 법률 지원 기관을 안내해드립니다
              </p>
            </div>
            <Link
              href="/support"
              className="px-6 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition"
            >
              기관 찾기
            </Link>
          </div>
        </div>

        {/* Recent Contracts */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">최근 검토 내역</h3>
          {contracts && contracts.length > 0 ? (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <Link
                  key={contract.id}
                  href={`/contracts/${contract.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {contract.title || '제목 없음'}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {contract.contract_type === 'employment' && '근로계약서'}
                        {contract.contract_type === 'lease' && '임대차계약서'}
                        {contract.contract_type === 'freelance' && '용역계약서'}
                        {contract.contract_type === 'other' && '기타 계약서'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          contract.risk_level === 'safe'
                            ? 'bg-green-100 text-green-800'
                            : contract.risk_level === 'caution'
                            ? 'bg-yellow-100 text-yellow-800'
                            : contract.risk_level === 'danger'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {contract.risk_level === 'safe' && '안전'}
                        {contract.risk_level === 'caution' && '주의'}
                        {contract.risk_level === 'danger' && '위험'}
                        {!contract.risk_level && '분석중'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(contract.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>아직 검토한 계약서가 없습니다</p>
              <p className="text-sm mt-2">첫 계약서를 업로드해보세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
