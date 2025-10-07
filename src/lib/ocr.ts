import { pdf as pdfParse } from 'pdf-parse'
import FormData from 'form-data'

// Naver CLOVA OCR API를 사용한 이미지 텍스트 추출
export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  const apiURL = process.env.NAVER_CLOVA_OCR_API_URL
  const secretKey = process.env.NAVER_CLOVA_OCR_SECRET_KEY

  if (!apiURL || !secretKey) {
    throw new Error('네이버 CLOVA OCR API 설정이 필요합니다')
  }

  try {
    // Naver OCR API 요청 형식
    const requestJson = {
      images: [
        {
          format: 'jpg', // jpg, png 등
          name: 'contract_image',
        },
      ],
      requestId: `contract_ocr_${Date.now()}`,
      version: 'V2',
      timestamp: Date.now(),
    }

    const formData = new FormData()
    formData.append('message', JSON.stringify(requestJson))
    formData.append('file', buffer, {
      filename: 'contract_image.jpg',
      contentType: 'image/jpeg',
    })

    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'X-OCR-SECRET': secretKey,
        ...formData.getHeaders(),
      },
      // @ts-expect-error - FormData compatibility
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Naver OCR API error:', errorText)
      throw new Error(`OCR API 호출 실패: ${response.status}`)
    }

    const result = await response.json()

    // Naver OCR 결과에서 텍스트 추출
    if (!result.images || !result.images[0] || !result.images[0].fields) {
      throw new Error('OCR 결과에서 텍스트를 찾을 수 없습니다')
    }

    // 모든 필드의 텍스트를 결합
    interface OCRField {
      inferText: string
    }
    const extractedText = result.images[0].fields
      .map((field: OCRField) => field.inferText)
      .join('\n')

    return extractedText
  } catch (error) {
    console.error('Naver OCR error:', error)
    throw new Error('이미지 텍스트 추출에 실패했습니다')
  }
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error('PDF 텍스트 추출에 실패했습니다')
  }
}

export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    return extractTextFromPDF(buffer)
  } else if (mimeType.startsWith('image/')) {
    return extractTextFromImage(buffer)
  } else {
    throw new Error('지원하지 않는 파일 형식입니다')
  }
}
