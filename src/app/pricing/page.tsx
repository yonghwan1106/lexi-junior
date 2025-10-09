import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PricingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const plans = [
    {
      name: '무료 플랜',
      price: '₩0',
      period: '영구 무료',
      features: [
        '매월 2회 계약서 검토',
        '기본 AI 분석',
        'AI 법률 상담 (제한적)',
        '표준 계약서 템플릿',
      ],
      buttonText: '현재 플랜',
      buttonStyle: 'bg-gray-400 cursor-not-allowed',
      planType: 'free',
    },
    {
      name: 'Plus 플랜',
      price: '₩9,900',
      period: '월',
      features: [
        '무제한 계약서 검토',
        '고급 AI 분석',
        '무제한 AI 법률 상담',
        '모든 계약서 템플릿',
        '우선 고객 지원',
      ],
      buttonText: '업그레이드',
      buttonStyle: 'bg-blue-600 hover:bg-blue-700',
      planType: 'plus',
      popular: true,
    },
    {
      name: 'Pro 플랜',
      price: '₩29,900',
      period: '월',
      features: [
        'Plus 플랜 모든 기능',
        '팀 협업 기능 (최대 5명)',
        '계약서 버전 관리',
        '커스텀 템플릿 생성',
        '전담 고객 지원',
        'API 접근 권한',
      ],
      buttonText: '업그레이드',
      buttonStyle: 'bg-indigo-600 hover:bg-indigo-700',
      planType: 'pro',
    },
  ]

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

      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            요금제 선택
          </h1>
          <p className="text-xl text-gray-600">
            더 많은 기능으로 법률 문제를 더 쉽게 해결하세요
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.planType}
              className={`bg-white rounded-xl shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-blue-500 relative' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    인기
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-600 ml-2">/ {plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-6 h-6 text-green-500 mr-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={plan.planType === 'free'}
                className={`w-full py-3 text-white font-semibold rounded-lg transition ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            자주 묻는 질문
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                언제든지 플랜을 변경할 수 있나요?
              </h3>
              <p className="text-gray-600">
                네, 언제든지 플랜을 업그레이드하거나 다운그레이드할 수 있습니다.
                변경 사항은 다음 결제 주기부터 적용됩니다.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                무료 체험 기간이 있나요?
              </h3>
              <p className="text-gray-600">
                Plus 플랜과 Pro 플랜 모두 7일 무료 체험이 제공됩니다. 체험 기간
                동안 언제든지 취소하실 수 있습니다.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                결제는 어떻게 이루어지나요?
              </h3>
              <p className="text-gray-600">
                신용카드, 체크카드, 계좌이체를 통해 결제하실 수 있습니다. 모든
                결제는 안전하게 암호화되어 처리됩니다.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                환불 정책은 어떻게 되나요?
              </h3>
              <p className="text-gray-600">
                서비스 이용 후 7일 이내에 100% 환불이 가능합니다. 단, 계약서
                검토를 5회 이상 이용한 경우 부분 환불이 적용될 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            더 궁금한 점이 있으신가요?
          </h3>
          <p className="text-gray-600 mb-6">
            고객 지원팀이 도와드리겠습니다
          </p>
          <Link
            href="/support"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            고객 지원 문의
          </Link>
        </div>
      </div>
    </div>
  )
}
