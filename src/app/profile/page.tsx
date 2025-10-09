'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Profile {
  id: string
  email: string
  nickname: string | null
  avatar_url: string | null
  created_at: string
}

interface Subscription {
  plan_type: 'free' | 'plus' | 'pro'
  status: 'active' | 'cancelled' | 'expired'
  expires_at: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        // Check if table doesn't exist
        if (profileError.message?.includes('relation') || profileError.message?.includes('does not exist')) {
          setMessage({
            type: 'error',
            text: '데이터베이스 설정이 필요합니다. DATABASE_SETUP.md 파일을 참조하여 데이터베이스를 설정해주세요.',
          })
          setLoading(false)
          return
        }
      }

      if (profileData) {
        setProfile(profileData)
        setNickname(profileData.nickname || '')
      } else {
        // Create profile if not exists
        const newProfile = {
          id: user.id,
          email: user.email!,
          nickname: null,
          avatar_url: null,
        }

        const { data, error } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single()

        if (!error && data) {
          setProfile(data)
        } else {
          console.error('Error creating profile:', error)
        }
      }

      // Load subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      setSubscription(subData)
    } catch (error) {
      console.error('Error loading profile:', error)
      setMessage({
        type: 'error',
        text: '프로필을 불러오는 중 오류가 발생했습니다.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({ nickname: nickname })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: '프로필이 업데이트되었습니다.' })
      await loadProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: '프로필 업데이트에 실패했습니다.' })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">마이페이지</h1>

        {/* Global error message */}
        {message && !profile && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>데이터베이스 설정 필요</strong>
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  프로필 기능을 사용하려면 Supabase 데이터베이스에 테이블을 생성해야 합니다.
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  다음 단계를 따라주세요:
                </p>
                <ol className="list-decimal list-inside text-sm text-yellow-700 mt-2 space-y-1">
                  <li>
                    Supabase 대시보드에 접속:{' '}
                    <a
                      href="https://supabase.com/dashboard/project/hzmeplltczukavqhtxvx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium"
                    >
                      여기를 클릭
                    </a>
                  </li>
                  <li>좌측 메뉴에서 &ldquo;SQL Editor&rdquo; 클릭</li>
                  <li>&ldquo;New Query&rdquo; 클릭</li>
                  <li>
                    프로젝트의 <code className="bg-yellow-100 px-1 rounded">supabase/migrations/20250609000000_initial_schema.sql</code> 파일 내용을 복사하여 붙여넣기
                  </li>
                  <li>&ldquo;Run&rdquo; 버튼을 클릭하여 실행</li>
                </ol>
                <p className="text-sm text-yellow-700 mt-2">
                  자세한 내용은 프로젝트 루트의 <code className="bg-yellow-100 px-1 rounded">DATABASE_SETUP.md</code> 파일을 참조하세요.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">프로필 정보</h2>

            {message && (
              <div
                className={`mb-4 p-3 rounded ${
                  message.type === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  닉네임
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  가입일
                </label>
                <input
                  type="text"
                  value={
                    profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString('ko-KR')
                      : '-'
                  }
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? '저장 중...' : '프로필 업데이트'}
              </button>
            </form>
          </div>

          {/* Subscription Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">구독 정보</h2>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg">
                <div className="text-2xl font-bold mb-2">
                  {subscription?.plan_type === 'free' && '무료 플랜'}
                  {subscription?.plan_type === 'plus' && 'Plus 플랜'}
                  {subscription?.plan_type === 'pro' && 'Pro 플랜'}
                  {!subscription && '무료 플랜'}
                </div>
                <div className="text-blue-100 text-sm">
                  {subscription?.plan_type === 'free' && '매월 2회 무료 문서 검토'}
                  {subscription?.plan_type === 'plus' && '무제한 문서 검토 + AI 챗봇'}
                  {subscription?.plan_type === 'pro' &&
                    '무제한 + AI 에이전트 기능'}
                  {!subscription && '매월 2회 무료 문서 검토'}
                </div>
              </div>

              {subscription?.expires_at && (
                <div className="text-sm text-gray-600">
                  <p>
                    다음 결제일:{' '}
                    {new Date(subscription.expires_at).toLocaleDateString(
                      'ko-KR'
                    )}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {(!subscription || subscription.plan_type === 'free') && (
                  <Link
                    href="/pricing"
                    className="block w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-medium"
                  >
                    업그레이드
                  </Link>
                )}

                {subscription && subscription.plan_type !== 'free' && (
                  <button
                    onClick={() => alert('구독 관리 기능은 준비 중입니다.')}
                    className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    구독 관리
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">계정 관리</h2>

          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              className="w-full md:w-auto px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
