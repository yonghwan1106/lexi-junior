import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold text-gray-900">렉시주니어</h1>
          <Link
            href="/login"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            로그인
          </Link>
        </nav>

        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            어려운 계약서,
            <br />
            <span className="text-blue-600">AI가 3분 만에</span> 쉽게 설명해드려요
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            사회초년생을 위한 디지털 법률 안전망
            <br />
            근로계약서, 월세계약서 등 생활 속 법률 문서의 위험 조항을 AI가 자동으로 분석해드립니다
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            무료로 시작하기
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              간편한 업로드
            </h3>
            <p className="text-gray-600">
              스마트폰으로 계약서 사진을 찍거나 PDF 파일을 업로드하세요
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              AI 실시간 분석
            </h3>
            <p className="text-gray-600">
              독소 조항, 불리한 내용을 AI가 자동으로 찾아내고 쉽게 설명해드립니다
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">🚦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              직관적인 위험도 표시
            </h3>
            <p className="text-gray-600">
              안전, 주의, 위험 3단계 신호등으로 한눈에 파악하세요
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold mb-4">
            50만 사회초년생의 선택
          </h3>
          <p className="text-xl mb-8 opacity-90">
            첫 계약, 렉시주니어와 함께 안전하게 시작하세요
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            지금 무료로 시작하기
          </Link>
        </div>
      </div>
    </div>
  )
}
