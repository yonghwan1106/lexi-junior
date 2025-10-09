-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create legal_documents table for RAG
CREATE TABLE IF NOT EXISTS legal_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  document_type TEXT, -- 'law', 'regulation', 'guideline', 'case', etc.
  category TEXT, -- 'labor', 'lease', 'freelance', 'consumer', etc.
  embedding vector(1536), -- OpenAI ada-002 or Claude embeddings
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS legal_documents_embedding_idx
ON legal_documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS legal_documents_category_idx
ON legal_documents(category);

-- Create index for document type filtering
CREATE INDEX IF NOT EXISTS legal_documents_type_idx
ON legal_documents(document_type);

-- Create function for similarity search
CREATE OR REPLACE FUNCTION match_legal_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_category text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  source_url text,
  document_type text,
  category text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    legal_documents.id,
    legal_documents.title,
    legal_documents.content,
    legal_documents.source_url,
    legal_documents.document_type,
    legal_documents.category,
    1 - (legal_documents.embedding <=> query_embedding) as similarity
  FROM legal_documents
  WHERE
    (filter_category IS NULL OR legal_documents.category = filter_category)
    AND 1 - (legal_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY legal_documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create sample legal documents (Korean labor law basics)
INSERT INTO legal_documents (title, content, source_url, document_type, category) VALUES
(
  '근로기준법 제17조 - 근로계약서 명시사항',
  '근로계약을 체결할 때에는 다음 사항을 명시하여야 합니다:
1. 임금의 구성항목·계산방법·지급방법
2. 소정근로시간
3. 휴일·휴가에 관한 사항
4. 취업의 장소와 종사하여야 할 업무에 관한 사항
5. 근로일 및 근로일별 근로시간
사용자는 이를 서면으로 작성하여 근로자에게 교부하여야 합니다.',
  'https://www.law.go.kr/법령/근로기준법',
  'law',
  'labor'
),
(
  '주택임대차보호법 제3조 - 대항력',
  '임대차는 그 등기가 없는 경우에도 임차인이 주택의 인도와 주민등록을 마친 때에는 그 다음 날부터 제3자에 대하여 효력이 생긴다.
임차인이 대항력을 갖추면, 집주인이 바뀌어도 임대차 계약은 유효하게 유지됩니다.',
  'https://www.law.go.kr/법령/주택임대차보호법',
  'law',
  'tenant'
),
(
  '근로기준법 제56조 - 연장·야간·휴일근로 가산수당',
  '사용자는 연장근로(법정근로시간을 초과한 근로)에 대하여는 통상임금의 50% 이상을 가산하여 지급하여야 합니다.
야간근로(오후 10시~오전 6시)와 휴일근로에 대해서도 통상임금의 50% 이상을 가산하여 지급해야 합니다.
연장근로가 야간이나 휴일에 이루어진 경우에는 각각의 가산수당이 중복으로 적용됩니다.',
  'https://www.law.go.kr/법령/근로기준법',
  'law',
  'labor'
),
(
  '최저임금법 - 2025년 최저임금',
  '2025년 최저임금은 시간당 10,030원입니다.
주 40시간(월 209시간) 기준 월 환산액은 약 2,096,270원입니다.
최저임금은 모든 사업장에 적용되며, 위반 시 3년 이하의 징역 또는 2천만원 이하의 벌금에 처해집니다.',
  'https://www.minimumwage.go.kr',
  'regulation',
  'labor'
),
(
  '주택임대차보호법 제7조 - 임차인의 계약갱신요구권',
  '임차인은 임대차기간이 끝나기 6개월 전부터 1개월 전까지 계약갱신을 요구할 수 있습니다.
임대인은 정당한 사유 없이 이를 거절할 수 없습니다.
다만, 전체 임대차 기간이 10년을 초과하거나, 임대인이 2년 이상 자신 또는 직계존비속이 실제 거주할 목적인 경우 등은 거절 가능합니다.',
  'https://www.law.go.kr/법령/주택임대차보호법',
  'law',
  'tenant'
),
(
  '프리랜서 계약 - 3.3% 원천징수',
  '프리랜서(인적용역)에게 대가를 지급할 때는 소득세 3.3%(소득세 3% + 지방소득세 0.3%)를 원천징수해야 합니다.
원천징수는 의뢰인(용역을 의뢰한 사업자)의 의무입니다.
예: 계약금액이 100만원이면, 프리랜서는 실제로 967,000원을 받게 되고, 33,000원은 의뢰인이 국세청에 납부합니다.',
  'https://www.nts.go.kr',
  'guideline',
  'freelance'
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_legal_documents_updated_at
BEFORE UPDATE ON legal_documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE legal_documents IS 'Stores legal documents for RAG (Retrieval Augmented Generation) in the chatbot';
COMMENT ON COLUMN legal_documents.embedding IS 'Vector embedding for semantic search (1536 dimensions for OpenAI ada-002)';
COMMENT ON FUNCTION match_legal_documents IS 'Performs similarity search on legal documents using cosine distance';
