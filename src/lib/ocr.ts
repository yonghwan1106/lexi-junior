import { createWorker } from 'tesseract.js'
import { pdf as pdfParse } from 'pdf-parse'

export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  const worker = await createWorker('kor+eng')

  try {
    const { data: { text } } = await worker.recognize(buffer)
    return text
  } finally {
    await worker.terminate()
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
