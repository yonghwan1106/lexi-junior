'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [contractType, setContractType] = useState<string>('employment')
  const [title, setTitle] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      // 파일 크기 검증 (10MB 제한)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB를 초과할 수 없습니다')
        return
      }
      // 파일 형식 검증
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('JPG, PNG, PDF 파일만 업로드 가능합니다')
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('파일을 선택해주세요')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // 1. Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 2. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 3. Create contract record
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .insert({
          user_id: user.id,
          title: title || file.name,
          contract_type: contractType,
          original_file_path: uploadData.path,
        })
        .select()
        .single()

      if (contractError) throw contractError

      // 4. Trigger OCR and Analysis (Edge Function will be called via webhook or direct call)
      // For now, we'll trigger it via a separate API route
      const response = await fetch('/api/analyze-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId: contractData.id,
          filePath: uploadData.path,
        }),
      })

      if (!response.ok) {
        console.error('Analysis trigger failed')
      }

      // 5. Redirect to analysis page
      router.push(`/contracts/${contractData.id}`)
    } catch (error: any) {
      console.error('Upload error:', error)
      setError(error.message || '업로드 중 오류가 발생했습니다')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
            렉시주니어
          </Link>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            대시보드로 돌아가기
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            계약서 업로드
          </h1>
          <p className="text-gray-600 mb-8">
            계약서 사진이나 PDF 파일을 업로드하면 AI가 자동으로 분석해드립니다
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                계약서 파일
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-4xl mb-4">📄</div>
                  {file ? (
                    <p className="text-blue-600 font-medium">{file.name}</p>
                  ) : (
                    <>
                      <p className="text-gray-700 font-medium mb-2">
                        파일을 선택하거나 드래그하세요
                      </p>
                      <p className="text-sm text-gray-500">
                        JPG, PNG, PDF (최대 10MB)
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Contract Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                계약서 종류
              </label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="employment">근로계약서</option>
                <option value="lease">임대차계약서</option>
                <option value="freelance">용역계약서</option>
                <option value="other">기타</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 (선택사항)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 2024년 첫 직장 근로계약서"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? '분석 중...' : 'AI 분석 시작하기'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">💡 분석 과정</h3>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>AI가 계약서의 텍스트를 추출합니다</li>
              <li>계약서 종류에 맞춰 위험 조항을 분석합니다</li>
              <li>쉬운 용어로 설명과 권장사항을 제공합니다</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
