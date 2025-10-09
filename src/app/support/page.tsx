'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface LegalCenter {
  id: string
  name: string
  category: 'labor' | 'legal' | 'tenant' | 'consumer'
  phone: string
  address: string
  website?: string
  description: string
  latitude?: number
  longitude?: number
}

const LEGAL_CENTERS: LegalCenter[] = [
  {
    id: '1',
    name: '고용노동부 상담센터',
    category: 'labor',
    phone: '1350',
    address: '전국',
    website: 'https://www.moel.go.kr',
    description:
      '근로기준, 임금체불, 부당해고, 4대보험 등 노동 관련 모든 상담 가능. 무료 전화 상담 제공.',
    latitude: 37.5665,
    longitude: 126.9780,
  },
  {
    id: '2',
    name: '대한법률구조공단 서울중앙지부',
    category: 'legal',
    phone: '132',
    address: '서울 서초구 법원로3길 23',
    website: 'https://www.klac.or.kr',
    description:
      '경제적으로 어려운 국민을 위한 무료 법률 상담 및 소송 지원. 민사, 가사, 형사, 행정 사건 지원.',
    latitude: 37.4959,
    longitude: 127.0125,
  },
  {
    id: '3',
    name: '한국공인노무사회',
    category: 'labor',
    phone: '02-6959-5300',
    address: '서울특별시 강남구 테헤란로 302',
    website: 'https://www.kocla.or.kr',
    description:
      '노무 관련 전문 상담 및 노무사 연결 서비스. 근로계약, 4대보험, 산재 처리 등 전문 상담 가능.',
    latitude: 37.5048,
    longitude: 127.0458,
  },
  {
    id: '4',
    name: '서울시 청년공간 무중력지대 G밸리',
    category: 'legal',
    phone: '02-2133-7973',
    address: '서울 금천구 가산디지털1로 168',
    website: 'https://youthzone.kr',
    description: '청년을 위한 무료 법률 상담, 노무 상담, 창업 컨설팅 제공.',
    latitude: 37.4812,
    longitude: 126.8822,
  },
  {
    id: '5',
    name: '전국세입자협회',
    category: 'tenant',
    phone: '1661-8071',
    address: '서울 마포구 월드컵북로 396',
    website: 'https://tenants.or.kr',
    description: '전세, 월세 임대차 계약 관련 상담 및 분쟁 조정 지원.',
    latitude: 37.5665,
    longitude: 126.9017,
  },
  {
    id: '6',
    name: '한국소비자원',
    category: 'consumer',
    phone: '1372',
    address: '충북 음성군 맹동면 용두로 54',
    website: 'https://www.kca.go.kr',
    description: '소비자 피해 구제, 계약 분쟁, 환불 관련 상담 및 중재 서비스 제공.',
    latitude: 36.9446,
    longitude: 127.5783,
  },
  {
    id: '7',
    name: '서울시 노동권익센터',
    category: 'labor',
    phone: '1644-0130',
    address: '서울특별시 중구 세종대로 110',
    website: 'https://labor.seoul.go.kr',
    description: '서울시 거주 또는 근무자 대상 노동 상담, 체불 임금 해결 지원.',
    latitude: 37.5662,
    longitude: 126.9779,
  },
  {
    id: '8',
    name: '대한변호사협회 법률구조재단',
    category: 'legal',
    phone: '02-3476-6515',
    address: '서울특별시 서초구 서초대로 1605',
    website: 'https://klaf.or.kr',
    description: '무료 법률 상담 및 소송 지원. 민사, 형사, 가사 사건 등 다양한 분야 지원.',
    latitude: 37.4928,
    longitude: 127.0124,
  },
]

export default function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [mapLoaded, setMapLoaded] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router, supabase])

  useEffect(() => {
    // Load Kakao Map SDK
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`
    script.async = true
    script.onload = () => {
      window.kakao.maps.load(() => {
        setMapLoaded(true)
      })
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (!mapLoaded) return

    const container = document.getElementById('map')
    if (!container) return

    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780), // Seoul City Hall
      level: 8,
    }

    const map = new window.kakao.maps.Map(container, options)

    // Add markers for filtered centers
    filteredCenters.forEach((center) => {
      if (center.latitude && center.longitude) {
        const markerPosition = new window.kakao.maps.LatLng(
          center.latitude,
          center.longitude
        )

        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
          map: map,
        })

        // Add info window
        const iwContent = `
          <div style="padding:10px;min-width:200px;">
            <strong>${center.name}</strong><br/>
            <span style="font-size:12px;">${center.address}</span><br/>
            <span style="font-size:12px;">📞 ${center.phone}</span>
          </div>
        `

        const infowindow = new window.kakao.maps.InfoWindow({
          content: iwContent,
        })

        window.kakao.maps.event.addListener(marker, 'click', () => {
          infowindow.open(map, marker)
        })
      }
    })
  }, [mapLoaded, selectedCategory])

  const categories = [
    { id: 'all', label: '전체', icon: '🏛️' },
    { id: 'labor', label: '노동/근로', icon: '💼' },
    { id: 'tenant', label: '임대차', icon: '🏠' },
    { id: 'legal', label: '법률상담', icon: '⚖️' },
    { id: 'consumer', label: '소비자', icon: '🛒' },
  ]

  const filteredCenters =
    selectedCategory === 'all'
      ? LEGAL_CENTERS
      : LEGAL_CENTERS.filter((center) => center.category === selectedCategory)

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🗺️ 법률 지원 기관 안내</h1>
          <p className="text-gray-600">
            무료로 법률 상담을 받을 수 있는 기관을 안내해드립니다
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon} {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Kakao Map */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📍 지도에서 찾기</h3>
          <div
            id="map"
            className="w-full h-96 rounded-lg"
            style={{ minHeight: '400px' }}
          />
          {!mapLoaded && (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
              <p className="text-gray-500">지도를 불러오는 중...</p>
            </div>
          )}
        </div>

        {/* Legal Centers List */}
        <div className="space-y-4">
          {filteredCenters.map((center) => (
            <div key={center.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{center.name}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {center.category === 'labor' && '노동/근로'}
                      {center.category === 'tenant' && '임대차'}
                      {center.category === 'legal' && '법률상담'}
                      {center.category === 'consumer' && '소비자'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{center.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">📞 전화:</span>
                    <a
                      href={`tel:${center.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {center.phone}
                    </a>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-semibold">📍 주소:</span>
                    <span>{center.address}</span>
                  </div>
                </div>
                {center.website && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="font-semibold">🌐 웹사이트:</span>
                      <a
                        href={center.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        바로가기
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredCenters.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500">해당 카테고리에 등록된 기관이 없습니다.</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>💡 Tip:</strong> 대부분의 기관에서 무료 전화 상담이 가능합니다.
                상담 전에 관련 서류(계약서, 급여명세서 등)를 미리 준비하시면 더욱 정확한
                상담을 받으실 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* Expert Connection */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🤝 전문가 연결</h3>
          <p className="text-gray-600 mb-6">
            더 심화된 상담이 필요하신가요? 전문 변호사 및 노무사와 연결해드립니다.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="https://www.lawtimes.co.kr/Legal-Info/Lawyer-Search"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <div className="text-2xl mb-2">⚖️</div>
              <h4 className="font-semibold text-gray-900 mb-1">변호사 찾기</h4>
              <p className="text-sm text-gray-600">
                지역별, 전문분야별 변호사 검색 및 연결
              </p>
            </a>
            <a
              href="https://www.kocla.or.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <div className="text-2xl mb-2">💼</div>
              <h4 className="font-semibold text-gray-900 mb-1">노무사 찾기</h4>
              <p className="text-sm text-gray-600">
                근로, 4대보험, 산재 전문 노무사 검색 및 연결
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
