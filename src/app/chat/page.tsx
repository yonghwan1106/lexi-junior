'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: { title: string; url: string }[]
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content:
        '안녕하세요! 렉시챗입니다. 💬\n\n계약서나 법률 관련 질문이 있으시면 편하게 물어보세요. 근로계약, 임대차, 프리랜서 계약 등 생활 속 법률 문제를 쉽게 설명해드릴게요!',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Create chat session
    const createSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: '법률 상담',
        })
        .select()
        .single()

      if (!error && data) {
        setSessionId(data.id)
      }
    }

    createSession()
  }, [])

  const handleSend = async () => {
    if (!input.trim() || loading || !sessionId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Save user message
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'user',
        content: input,
      })

      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: input,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        sources: data.sources,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Save assistant message
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: data.content,
        sources: data.sources,
      })
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '죄송합니다. 응답 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleExampleClick = (question: string) => {
    setInput(question)
  }

  const exampleQuestions = [
    '월세 계약서에 모든 수리비를 세입자가 부담한다고 하는데, 괜찮은가요?',
    '근로계약서에 야근 수당이 포함되어 있다고 하는데 이게 합법인가요?',
    '프리랜서 계약인데 3.3% 세금을 제가 내야 하나요, 회사가 내야 하나요?',
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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

      {/* Chat Container */}
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">💬 렉시챗</h1>
          <p className="text-gray-600">AI 법률 Q&A</p>
        </div>

        {/* Example Questions */}
        {messages.length === 1 && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              💡 이런 질문을 해보세요
            </p>
            <div className="space-y-2">
              {exampleQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(question)}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition text-sm text-gray-700 hover:text-blue-700"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 bg-white rounded-xl shadow-lg p-6 mb-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <p className="text-xs font-semibold mb-2">📚 참고 자료:</p>
                      {message.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline block"
                        >
                          {source.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="예: 월세 계약서에 모든 수리비를 세입자가 부담한다고 하는데, 괜찮은가요?"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '전송 중...' : '전송'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Enter로 전송, Shift+Enter로 줄바꿈
          </p>
        </div>
      </div>
    </div>
  )
}
