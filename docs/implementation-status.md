# 렉시주니어 구현 상태 체크리스트

## PRD 1.0 기능

### Epic 1: 사용자 인증 및 관리
- [x] User Story 1.1: 소셜 로그인(카카오, 구글) 및 이메일/비밀번호 인증
  - ✅ 구글 로그인 구현됨
  - ⚠️ 카카오 로그인 비활성화됨 (OAuth 설정 필요)
  - ✅ 이메일/비밀번호 인증 구현됨
- [x] User Story 1.2: 마이페이지 프로필 및 구독 상태 관리
  - ✅ 프로필 페이지 구현됨 (profile/page.tsx)
  - ✅ 구독 정보 표시 구현됨
  - ✅ 프로필 정보 수정 기능 구현됨

### Epic 2: 계약서 업로드 및 텍스트 추출 (OCR)
- [x] User Story 2.1: 스마트폰 카메라/갤러리 파일 업로드
  - ✅ 파일 업로드 UI 구현됨 (upload/page.tsx)
  - ✅ Supabase Storage 연동 완료
- [x] User Story 2.2: OCR 텍스트 추출
  - ✅ Naver CLOVA OCR API 연동됨

### Epic 3: AI 기반 계약서 분석 및 위험 고지
- [x] User Story 3.1: 계약서 종류 자동 분류
  - ✅ 근로, 임대차, 용역, 기타 분류 지원
- [x] User Story 3.2: 위험 조항 분석
  - ✅ Claude Sonnet 4 API로 분석 구현됨
  - ⚠️ RAG (pgvector) 미구현
- [x] User Story 3.3: 쉬운 설명 및 가이드 제공
  - ✅ 조항별 설명 및 권장사항 제공

### Epic 4: 분석 결과 시각화
- [x] User Story 4.1: 직관적인 UI 결과 확인
  - ✅ 안전/주의/위험 3단계 신호등 표시
  - ✅ 조항별 분석 결과 표시
  - ✅ 하이라이트 처리 및 상세 뷰
- [ ] User Story 4.2: PDF 다운로드 및 공유 링크
  - ⚠️ 브라우저 인쇄 기능만 구현됨 (PDF 다운로드 미구현)
  - ❌ 공유 링크 미구현

### Epic 5: 사용자 대시보드 및 이력 관리
- [x] User Story 5.1: 검토 내역 대시보드
  - ✅ 대시보드 구현됨
  - ✅ Supabase contracts 테이블 연동
- [ ] User Story 5.2: 키워드 검색
  - ❌ 미구현

---

## PRD 2.0 기능

### Epic 6: AI 법률 Q&A 챗봇 "렉시챗"
- [x] User Story 6.1: AI 챗봇 질의응답
  - ✅ 챗봇 UI 구현됨 (chat/page.tsx)
  - ✅ Claude API 연동됨
  - ⚠️ RAG 고도화 미구현 (출처 링크 없음)
  - ✅ 세션 기반 대화 맥락 유지

### Epic 7: AI 기반 표준 계약서 생성기
- [x] User Story 7.1: 표준 계약서 자동 생성
  - ✅ 근로/임대차/용역 계약서 생성 UI 구현됨 (generate/page.tsx)
  - ✅ AI 기반 계약서 생성 API 연동됨
  - ✅ TXT 다운로드 구현됨
  - ⚠️ HWP, DOCX 다운로드 미구현

### Epic 8: 전문가 연결 및 지역 법률 지원 정보
- [x] User Story 8.1: 전문가 상담 신청
  - ⚠️ 부분 구현 (support/page.tsx에서 링크 제공만 함)
- [x] User Story 8.2: 지도 기반 법률 지원 기관 찾기
  - ⚠️ 부분 구현 (카카오맵 API 미연동, 정적 리스트만 표시)

### Epic 9: 네이티브 앱 개발 및 알림 기능
- [ ] User Story 9.1: iOS/Android 앱
  - ❌ 미구현 (웹 앱만 존재)

---

## PRD 3.0 기능

### Epic 10: 자율 법률 에이전트 "렉시 프로"
- [ ] User Story 10.1: 계약 협상 에이전트
  - ❌ 미구현
- [ ] User Story 10.2: 분쟁 해결 에이전트
  - ❌ 미구현
- [ ] User Story 10.3: 계약 생애주기 관리 에이전트
  - ❌ 미구현

---

## 우선순위별 구현 계획

### 🔴 P0 (즉시 구현 필요)
1. ✅ 카카오 로그인 OAuth 설정 → 비활성화로 해결
2. 마이페이지/프로필 관리 구현
3. 구독 상태 확인 및 결제 연동

### 🟡 P1 (단기 개발)
4. 검색 기능 추가
5. PDF 다운로드 및 공유 링크
6. 카카오맵 API 연동 (법률 지원 기관)
7. RAG 시스템 구축 (pgvector)

### 🟢 P2 (중장기 개발)
8. 프로 티어 에이전트 기능
9. 네이티브 앱 개발
10. HWP/DOCX 다운로드
