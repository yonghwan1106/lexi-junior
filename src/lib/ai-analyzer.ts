import Anthropic from '@anthropic-ai/sdk'
import type { AnalysisResult } from '@/types/database.types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const PROMPTS = {
  employment: `당신은 한국 근로기준법 전문가입니다. 다음 근로계약서를 분석하여 사회초년생에게 불리할 수 있는 조항을 찾아주세요.

중점 검토 사항:
- 최저임금 위반 여부
- 근로시간 및 휴게시간 규정
- 부당한 손해배상 조항
- 퇴직금 및 4대 보험 관련
- 해고 조건 및 절차
- 급여 지급 조건

각 조항에 대해 위험도(safe/caution/danger)를 판단하고, 쉬운 용어로 설명해주세요.`,

  lease: `당신은 한국 주택임대차보호법 전문가입니다. 다음 임대차계약서를 분석하여 임차인에게 불리할 수 있는 조항을 찾아주세요.

중점 검토 사항:
- 보증금 반환 조건
- 수선유지 의무 및 비용 부담
- 계약 해지 조건 및 위약금
- 선순위 근저당권 여부
- 관리비 및 공과금 부담
- 특약사항의 법적 유효성

각 조항에 대해 위험도(safe/caution/danger)를 판단하고, 쉬운 용어로 설명해주세요.`,

  freelance: `당신은 한국 계약법 전문가입니다. 다음 용역계약서를 분석하여 프리랜서에게 불리할 수 있는 조항을 찾아주세요.

중점 검토 사항:
- 대금 지급 조건 및 시기
- 저작권 및 지식재산권 귀속
- 계약 해지 조건
- 손해배상 및 배상책임 범위
- '가짜 프리랜서' 관련 조항
- 계약 기간 및 연장 조건

각 조항에 대해 위험도(safe/caution/danger)를 판단하고, 쉬운 용어로 설명해주세요.`,

  other: `당신은 한국 계약법 전문가입니다. 다음 계약서를 분석하여 계약 당사자에게 불리할 수 있는 조항을 찾아주세요.

중점 검토 사항:
- 일방적으로 불리한 조건
- 과도한 손해배상 조항
- 계약 해지 조건
- 법적 위반 소지

각 조항에 대해 위험도(safe/caution/danger)를 판단하고, 쉬운 용어로 설명해주세요.`,
}

export async function analyzeContract(
  text: string,
  contractType: 'employment' | 'lease' | 'freelance' | 'other'
): Promise<AnalysisResult> {
  const systemPrompt = PROMPTS[contractType]

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    temperature: 0.3,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `다음 계약서를 분석해주세요. 반드시 JSON 형식으로만 응답하세요.

계약서 내용:
${text}

응답 형식:
{
  "contractType": "계약서 종류",
  "overallRisk": "safe | caution | danger",
  "summary": "전체적인 분석 요약 (2-3문장)",
  "clauses": [
    {
      "id": "clause_1",
      "originalText": "원본 조항 내용",
      "riskLevel": "safe | caution | danger",
      "explanation": "쉬운 용어로 설명",
      "recommendation": "권장사항 (있는 경우)",
      "legalBasis": "관련 법적 근거 (있는 경우)"
    }
  ]
}`,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type')
  }

  // Extract JSON from markdown code blocks if present
  let jsonText = content.text.trim()
  const jsonMatch = jsonText.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
  if (jsonMatch) {
    jsonText = jsonMatch[1]
  }

  try {
    const result = JSON.parse(jsonText)
    return result as AnalysisResult
  } catch {
    console.error('Failed to parse Claude response:', jsonText)
    throw new Error('AI 분석 결과 파싱에 실패했습니다')
  }
}

export function calculateOverallRisk(
  clauses: AnalysisResult['clauses']
): 'safe' | 'caution' | 'danger' {
  const dangerCount = clauses.filter((c) => c.riskLevel === 'danger').length
  const cautionCount = clauses.filter((c) => c.riskLevel === 'caution').length

  if (dangerCount > 0) return 'danger'
  if (cautionCount > 0) return 'caution'
  return 'safe'
}
