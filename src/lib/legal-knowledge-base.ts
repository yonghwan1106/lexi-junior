/**
 * Legal Knowledge Base for RAG (Retrieval Augmented Generation)
 * Contains curated legal information for common scenarios
 */

export interface LegalDocument {
  id: string
  title: string
  content: string
  sourceUrl: string
  documentType: 'law' | 'regulation' | 'guideline' | 'case'
  category: 'labor' | 'tenant' | 'freelance' | 'consumer' | 'general'
  keywords: string[]
}

export const LEGAL_KNOWLEDGE_BASE: LegalDocument[] = [
  {
    id: '1',
    title: '근로기준법 제17조 - 근로계약서 명시사항',
    content: `근로계약을 체결할 때에는 다음 사항을 명시하여야 합니다:
1. 임금의 구성항목·계산방법·지급방법
2. 소정근로시간
3. 휴일·휴가에 관한 사항
4. 취업의 장소와 종사하여야 할 업무에 관한 사항
5. 근로일 및 근로일별 근로시간

사용자는 이를 서면으로 작성하여 근로자에게 교부하여야 합니다. 위반 시 500만원 이하의 벌금에 처해집니다.`,
    sourceUrl: 'https://www.law.go.kr/법령/근로기준법',
    documentType: 'law',
    category: 'labor',
    keywords: ['근로계약서', '명시사항', '임금', '근로시간', '휴일', '휴가', '계약서'],
  },
  {
    id: '2',
    title: '근로기준법 제56조 - 연장·야간·휴일근로 가산수당',
    content: `사용자는 연장근로(법정근로시간을 초과한 근로)에 대하여는 통상임금의 50% 이상을 가산하여 지급하여야 합니다.

야간근로(오후 10시~오전 6시)와 휴일근로에 대해서도 통상임금의 50% 이상을 가산하여 지급해야 합니다.

연장근로가 야간이나 휴일에 이루어진 경우에는 각각의 가산수당이 중복으로 적용됩니다.
예: 휴일 야간 연장근로 = 통상임금 + 휴일수당(50%) + 야간수당(50%) + 연장수당(50%) = 250%`,
    sourceUrl: 'https://www.law.go.kr/법령/근로기준법',
    documentType: 'law',
    category: 'labor',
    keywords: ['야근', '연장근로', '야간근로', '휴일근로', '수당', '가산수당', '포괄임금'],
  },
  {
    id: '3',
    title: '최저임금법 - 2025년 최저임금',
    content: `2025년 최저임금은 시간당 10,030원입니다.
주 40시간(월 209시간) 기준 월 환산액은 약 2,096,270원입니다.

최저임금은 모든 사업장에 적용되며, 수습기간 중이라도 3개월까지만 10% 감액이 가능합니다.
위반 시 3년 이하의 징역 또는 2천만원 이하의 벌금에 처해집니다.

최저임금에 포함되는 항목:
- 기본급
- 매월 1회 이상 정기적으로 지급하는 고정수당
- 매월 1회 이상 정기적으로 지급하는 상여금

최저임금에 미포함되는 항목:
- 연장/야간/휴일근로 수당
- 식대, 교통비 등 복리후생비`,
    sourceUrl: 'https://www.minimumwage.go.kr',
    documentType: 'regulation',
    category: 'labor',
    keywords: ['최저임금', '시급', '월급', '임금', '급여', '수습', '수습기간'],
  },
  {
    id: '4',
    title: '주택임대차보호법 제3조 - 대항력',
    content: `임대차는 그 등기가 없는 경우에도 임차인이 주택의 인도와 주민등록을 마친 때에는 그 다음 날부터 제3자에 대하여 효력이 생깁니다.

대항력을 갖추는 요건:
1. 주택의 인도 (열쇠를 받고 실제 입주)
2. 주민등록전입 (전입신고)

대항력의 효과:
- 집주인이 바뀌어도 임대차 계약은 유효하게 유지됩니다
- 경매나 공매 시에도 보호받을 수 있습니다
- 단, 확정일자를 받아야 우선변제권(경매 시 보증금을 먼저 받을 권리)도 함께 얻습니다`,
    sourceUrl: 'https://www.law.go.kr/법령/주택임대차보호법',
    documentType: 'law',
    category: 'tenant',
    keywords: ['대항력', '전입신고', '주민등록', '임대차', '전세', '월세', '보증금'],
  },
  {
    id: '5',
    title: '주택임대차보호법 제7조 - 계약갱신요구권',
    content: `임차인은 임대차기간이 끝나기 6개월 전부터 1개월 전까지 계약갱신을 요구할 수 있습니다.

계약갱신요구권의 요건:
- 최초 계약일로부터 2년 이상 거주한 경우
- 임대차 기간 종료 6개월~1개월 전 사이에 요구
- 임차인에게 차임 연체 등 귀책사유가 없을 것

임대인의 거절 가능 사유:
1. 전체 임대차 기간이 10년을 초과한 경우
2. 임대인이 2년 이상 자신 또는 직계존비속이 실제 거주할 목적인 경우
3. 건물 전체를 철거하거나 재건축하는 경우
4. 임차인이 3기의 차임액에 해당하는 금액에 이르도록 차임을 연체한 경우

갱신 시 임대료 인상은 5% 이내로 제한됩니다.`,
    sourceUrl: 'https://www.law.go.kr/법령/주택임대차보호법',
    documentType: 'law',
    category: 'tenant',
    keywords: ['계약갱신', '갱신요구권', '재계약', '임대차', '전세', '월세', '임대료', '인상'],
  },
  {
    id: '6',
    title: '주택임대차보호법 제7조의2 - 전월세상한제',
    content: `임대인은 임대료를 증액하는 경우 직전 임대료의 5%를 초과할 수 없습니다.

전월세 상한제 적용:
- 계약 갱신 시 임대료 인상률을 5% 이내로 제한
- 전세금 또는 월세 모두 해당
- 위반 시 임대인에게 과태료 부과 가능

예시:
- 이전 전세금 2억원 → 최대 2억 1천만원까지만 인상 가능
- 이전 월세 50만원 → 최대 52만 5천원까지만 인상 가능`,
    sourceUrl: 'https://www.law.go.kr/법령/주택임대차보호법',
    documentType: 'law',
    category: 'tenant',
    keywords: ['전월세', '상한제', '임대료', '인상', '5%', '제한'],
  },
  {
    id: '7',
    title: '주택임대차보호법 제7조의3 - 수선의무',
    content: `임대인은 임차인이 주택을 사용·수익하는 데 필요한 상태를 유지해야 하며, 이를 위한 수선의무를 부담합니다.

임대인의 수선의무:
- 건물의 구조적 문제 (벽면 균열, 누수 등)
- 난방 설비, 보일러 고장
- 상하수도 설비 고장
- 전기 설비 문제

임차인의 소규모 수선 책임:
- 도배, 장판 등 내부 인테리어
- 일상적인 청소 및 관리
- 경미한 파손

계약서에 "모든 수리비를 세입자가 부담한다"는 조항이 있어도, 임대인의 기본 수선의무를 면제할 수는 없습니다.`,
    sourceUrl: 'https://www.law.go.kr/법령/주택임대차보호법',
    documentType: 'law',
    category: 'tenant',
    keywords: ['수선의무', '수리', '보수', '누수', '고장', '보일러', '세입자', '임대인'],
  },
  {
    id: '8',
    title: '프리랜서 계약 - 3.3% 원천징수',
    content: `프리랜서(인적용역)에게 대가를 지급할 때는 소득세 3.3%(소득세 3% + 지방소득세 0.3%)를 원천징수해야 합니다.

원천징수의 주체와 책임:
- 원천징수는 의뢰인(용역을 의뢰한 사업자)의 의무입니다
- 프리랜서가 아닌 의뢰인이 세금을 납부해야 합니다
- 의뢰인이 원천징수를 하지 않으면 가산세를 부담합니다

계산 예시:
- 계약금액 100만원
- 프리랜서 실수령액: 967,000원 (100만원 - 33,000원)
- 원천징수세액: 33,000원 (의뢰인이 국세청에 납부)

프리랜서는 연말정산이 아닌 종합소득세 신고를 통해 세금을 정산합니다.`,
    sourceUrl: 'https://www.nts.go.kr',
    documentType: 'guideline',
    category: 'freelance',
    keywords: ['프리랜서', '3.3%', '원천징수', '세금', '소득세', '용역', '계약'],
  },
  {
    id: '9',
    title: '프리랜서 계약서 필수 사항',
    content: `프리랜서 용역계약서에는 다음 사항을 명확히 기재해야 합니다:

1. 용역의 내용 (업무 범위)
2. 대가 (금액 및 지급 방식)
3. 계약기간 및 납품일
4. 지적재산권 귀속 (저작권, 상표권 등)
5. 비밀유지의무
6. 계약해지 조건
7. 손해배상 범위

특히 중요한 사항:
- 저작권: 계약서에 별도 명시가 없으면 프리랜서에게 귀속됩니다
- 수정 범위: 수정 횟수나 범위를 명시하지 않으면 무제한 수정을 요구받을 수 있습니다
- 지급 조건: "검수 완료 후 30일 이내 지급" 등 구체적으로 명시해야 합니다`,
    sourceUrl: 'https://www.moel.go.kr',
    documentType: 'guideline',
    category: 'freelance',
    keywords: ['프리랜서', '계약서', '용역계약', '저작권', '수정', '대금', '지급'],
  },
  {
    id: '10',
    title: '4대보험 가입 의무',
    content: `사용자는 1명 이상의 근로자를 고용하면 4대보험에 가입해야 합니다.

4대보험 종류:
1. 국민연금 (만 18세~60세 미만)
2. 건강보험 (전 연령)
3. 고용보험 (실업급여 등)
4. 산재보험 (업무상 재해 보상)

가입 제외:
- 1개월 미만 단기 근로자
- 월 60시간 미만 초단시간 근로자 (고용보험, 산재보험만 가입)

보험료 부담:
- 국민연금: 사용자 4.5%, 근로자 4.5%
- 건강보험: 사용자 3.545%, 근로자 3.545%
- 고용보험: 사용자 1.05%~1.65%, 근로자 0.9%
- 산재보험: 사용자 100% 부담 (업종별 차등)

아르바이트, 계약직도 모두 4대보험 가입 대상입니다.`,
    sourceUrl: 'https://www.4insure.or.kr',
    documentType: 'regulation',
    category: 'labor',
    keywords: ['4대보험', '국민연금', '건강보험', '고용보험', '산재보험', '아르바이트', '가입'],
  },
]

/**
 * Search for relevant documents based on keywords
 */
export function searchDocuments(
  query: string,
  category?: string,
  limit: number = 3
): LegalDocument[] {
  const queryLower = query.toLowerCase()
  const queryKeywords = queryLower.split(/\s+/)

  let documents = LEGAL_KNOWLEDGE_BASE

  // Filter by category if specified
  if (category) {
    documents = documents.filter((doc) => doc.category === category)
  }

  // Score documents based on keyword matches
  const scored = documents.map((doc) => {
    let score = 0

    // Check title match
    if (doc.title.toLowerCase().includes(queryLower)) {
      score += 10
    }

    // Check content match
    if (doc.content.toLowerCase().includes(queryLower)) {
      score += 5
    }

    // Check keyword matches
    queryKeywords.forEach((qk) => {
      doc.keywords.forEach((dk) => {
        if (dk.includes(qk) || qk.includes(dk)) {
          score += 3
        }
      })
    })

    return { doc, score }
  })

  // Filter documents with score > 0 and sort by score
  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.doc)
}

/**
 * Format documents for inclusion in the prompt
 */
export function formatDocumentsForPrompt(documents: LegalDocument[]): string {
  if (documents.length === 0) {
    return ''
  }

  return `

다음은 관련 법률 정보입니다. 이를 참고하여 답변해주세요:

${documents
  .map(
    (doc, idx) => `
[참고자료 ${idx + 1}]
제목: ${doc.title}
출처: ${doc.sourceUrl}
내용: ${doc.content}
`
  )
  .join('\n')}

답변 시 위 참고자료를 활용하되, 반드시 출처를 명시해주세요.
각 참고자료는 [${documents.map((doc) => doc.title)}](${documents.map((doc) => doc.sourceUrl)}) 형식으로 인용할 수 있습니다.`
}
