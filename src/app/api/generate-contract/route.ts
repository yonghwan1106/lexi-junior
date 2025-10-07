import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface ContractRequest {
  contractType: 'employment' | 'lease' | 'freelance'
  partyA: string
  partyB: string
  startDate: string
  endDate: string
  position?: string
  salary?: string
  workHours?: string
  workDays?: string
  propertyAddress?: string
  deposit?: string
  monthlyRent?: string
  maintenanceFee?: string
  projectDescription?: string
  projectAmount?: string
  deliverables?: string
  paymentTerms?: string
}

const EMPLOYMENT_PROMPT = (data: ContractRequest) => `
당신은 한국 노동법 전문가이자 계약서 작성 전문가입니다.
아래 정보를 바탕으로 근로기준법에 부합하는 표준 근로계약서를 작성해주세요.

계약 정보:
- 사업자명(회사): ${data.partyA}
- 근로자명: ${data.partyB}
- 직무/직책: ${data.position}
- 계약 기간: ${data.startDate} ~ ${data.endDate}
- 급여: ${data.salary}
- 근무시간: ${data.workHours}
- 근무일: ${data.workDays}

작성 원칙:
1. 근로기준법 제17조(근로조건의 명시)를 준수
2. 필수 기재사항 모두 포함 (임금, 소정근로시간, 휴일, 연차유급휴가 등)
3. 4대보험 가입 의무 명시
4. 해고 시 30일 전 예고 또는 예고수당 지급 명시
5. 법정 최저임금 이상 보장
6. 근로자에게 불리한 조항이 없도록 작성
7. 명확하고 이해하기 쉬운 한글로 작성
8. 표준 양식에 따라 체계적으로 작성

계약서 제목은 "근로계약서"로 시작하고, 서문, 각 조항, 서명란까지 완전한 형식으로 작성해주세요.
`

const LEASE_PROMPT = (data: ContractRequest) => `
당신은 한국 주택임대차보호법 전문가이자 계약서 작성 전문가입니다.
아래 정보를 바탕으로 주택임대차보호법에 부합하는 표준 임대차계약서를 작성해주세요.

계약 정보:
- 임대인(집주인): ${data.partyA}
- 임차인(세입자): ${data.partyB}
- 부동산 주소: ${data.propertyAddress}
- 보증금: ${data.deposit}
- 월세: ${data.monthlyRent}
- 관리비: ${data.maintenanceFee || '별도 협의'}
- 계약 기간: ${data.startDate} ~ ${data.endDate}

작성 원칙:
1. 주택임대차보호법 준수
2. 보증금 반환 조건 명확히 명시
3. 임대차 기간 및 갱신 조건 명시
4. 수선의무 (대수선은 임대인, 소수선은 임차인) 명시
5. 확정일자 취득 안내
6. 임차인 권리(우선변제권, 대항력 등) 보호
7. 계약금, 중도금, 잔금 지급 일정 명시
8. 임대차 목적물의 유지 및 관리 의무 명시
9. 명확하고 이해하기 쉬운 한글로 작성

계약서 제목은 "부동산 임대차계약서"로 시작하고, 서문, 각 조항, 특약사항, 서명란까지 완전한 형식으로 작성해주세요.
`

const FREELANCE_PROMPT = (data: ContractRequest) => `
당신은 한국 민법 및 프리랜서 계약 전문가입니다.
아래 정보를 바탕으로 프리랜서를 보호하는 공정한 용역계약서를 작성해주세요.

계약 정보:
- 발주자(클라이언트): ${data.partyA}
- 수주자(프리랜서): ${data.partyB}
- 프로젝트 설명: ${data.projectDescription}
- 용역 대금: ${data.projectAmount}
- 납품물: ${data.deliverables}
- 대금 지급 조건: ${data.paymentTerms}
- 프로젝트 기간: ${data.startDate} ~ ${data.endDate}

작성 원칙:
1. 민법 제664조(도급) 준수
2. 용역 범위를 명확하고 구체적으로 명시
3. 대금 지급 조건 및 방법 상세히 명시
4. 지식재산권(저작권, 상표권 등) 귀속 명확히 규정
5. 수정 및 추가 작업 범위와 비용 명시
6. 프로젝트 변경 및 취소 시 조건 명시
7. 계약 해지 조건 명시
8. 비밀유지 의무 포함
9. 양 당사자에게 공정하고 균형 잡힌 조항 작성
10. 3.3% 소득세 원천징수 관련 사항 명시
11. 명확하고 이해하기 쉬운 한글로 작성

계약서 제목은 "용역(프리랜서)계약서"로 시작하고, 서문, 각 조항, 특약사항, 서명란까지 완전한 형식으로 작성해주세요.
`

export async function POST(request: Request) {
  try {
    const data: ContractRequest = await request.json()

    let systemPrompt = ''
    if (data.contractType === 'employment') {
      systemPrompt = EMPLOYMENT_PROMPT(data)
    } else if (data.contractType === 'lease') {
      systemPrompt = LEASE_PROMPT(data)
    } else if (data.contractType === 'freelance') {
      systemPrompt = FREELANCE_PROMPT(data)
    }

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.3, // Lower temperature for more consistent, formal contract generation
      messages: [
        {
          role: 'user',
          content: systemPrompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    return NextResponse.json({
      contract: content.text,
    })
  } catch (error: any) {
    console.error('Contract generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate contract' },
      { status: 500 }
    )
  }
}
