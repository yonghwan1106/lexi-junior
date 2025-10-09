import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { searchDocuments, formatDocumentsForPrompt } from '@/lib/legal-knowledge-base'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `당신은 '렉시챗'이라는 이름의 한국 생활법률 전문 AI 어시스턴트입니다.

역할:
- 사회초년생, 대학생, 긱 워커를 위한 친근하고 이해하기 쉬운 법률 상담
- 근로계약, 임대차계약, 프리랜서 용역계약 등 생활 속 법률 문제 해결
- 어려운 법률 용어를 쉬운 말로 풀어서 설명

응답 원칙:
1. 존댓말을 사용하되, 친근하고 따뜻한 톤 유지
2. 법률 용어는 반드시 쉬운 말로 바꿔서 설명
3. 구체적인 사례나 예시를 들어 설명
4. 가능한 경우 관련 법률 조항이나 근거 제시
5. 답변이 불확실한 경우 전문가 상담 권장
6. 각 답변 마지막에 관련 법적 근거나 참고자료 출처 명시

주요 상담 분야:
- 근로기준법 (최저임금, 근로시간, 해고, 4대보험)
- 주택임대차보호법 (보증금, 월세, 계약, 수선의무)
- 프리랜서 계약 (대금지급, 저작권, 계약해지)
- 기타 생활법률 (소비자보호, 채권/채무)

응답 형식:
1. 질문 이해 및 공감
2. 핵심 답변 (쉬운 용어로)
3. 구체적 조언 또는 주의사항
4. 법적 근거 (있는 경우)
5. 추가 도움이 필요한 경우 안내`

export async function POST(request: Request) {
  try {
    const { sessionId, message } = await request.json()

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: 'sessionId and message are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get chat history
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(10)

    // Build conversation history for Claude
    const conversationHistory = messages
      ? messages.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))
      : []

    // Search for relevant legal documents (RAG)
    const relevantDocs = searchDocuments(message, undefined, 3)
    const contextWithRAG = formatDocumentsForPrompt(relevantDocs)

    // Add current message with RAG context
    conversationHistory.push({
      role: 'user',
      content: message + contextWithRAG,
    })

    // Call Claude API
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: conversationHistory,
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // Parse response to extract sources if provided
    const responseText = content.text
    const sources: { title: string; url: string }[] = []

    // Add RAG documents as sources
    relevantDocs.forEach((doc) => {
      sources.push({
        title: doc.title,
        url: doc.sourceUrl,
      })
    })

    // Simple pattern matching for citations in response
    // Format: [제목](URL)
    const citationRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g
    let match: RegExpExecArray | null
    while ((match = citationRegex.exec(responseText)) !== null) {
      // Only add if not already in sources
      if (!sources.find((s) => s.url === match![2])) {
        sources.push({
          title: match[1],
          url: match[2],
        })
      }
    }

    // Remove markdown links from response
    const cleanedResponse = responseText.replace(citationRegex, '$1')

    return NextResponse.json({
      content: cleanedResponse,
      sources: sources.length > 0 ? sources : undefined,
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Chat failed' },
      { status: 500 }
    )
  }
}
