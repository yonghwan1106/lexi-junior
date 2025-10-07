import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { extractText } from '@/lib/ocr'
import { analyzeContract } from '@/lib/ai-analyzer'

export async function POST(request: Request) {
  try {
    const { contractId, filePath } = await request.json()

    if (!contractId || !filePath) {
      return NextResponse.json(
        { error: 'contractId and filePath are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get contract info
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single()

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      )
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('contracts')
      .download(filePath)

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: 'Failed to download file' },
        { status: 500 }
      )
    }

    // Convert to Buffer
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Determine MIME type from file extension
    const fileExtension = filePath.split('.').pop()?.toLowerCase()
    let mimeType = 'application/octet-stream'

    if (fileExtension === 'pdf') {
      mimeType = 'application/pdf'
    } else if (['jpg', 'jpeg'].includes(fileExtension || '')) {
      mimeType = 'image/jpeg'
    } else if (fileExtension === 'png') {
      mimeType = 'image/png'
    }

    // Extract text using OCR
    console.log('Extracting text from file...')
    const extractedText = await extractText(buffer, mimeType)
    console.log('Text extracted:', extractedText.substring(0, 200))

    if (!extractedText || extractedText.trim().length < 50) {
      return NextResponse.json(
        { error: '텍스트를 충분히 추출할 수 없습니다. 더 선명한 이미지를 업로드해주세요.' },
        { status: 400 }
      )
    }

    // Analyze with Claude
    console.log('Analyzing contract with AI...')
    const analysisResult = await analyzeContract(
      extractedText,
      contract.contract_type || 'other'
    )
    console.log('Analysis complete')

    // Update contract with results
    const { error: updateError } = await supabase
      .from('contracts')
      .update({
        extracted_text: extractedText,
        risk_level: analysisResult.overallRisk,
        analysis_result: analysisResult,
      })
      .eq('id', contractId)

    if (updateError) {
      console.error('Failed to update contract:', updateError)
      return NextResponse.json(
        { error: 'Failed to save analysis results' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      contractId,
      riskLevel: analysisResult.overallRisk,
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}
