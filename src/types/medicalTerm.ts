// 의학용어 하나를 나타내는 공통 타입.
// 모든 화면(플래시카드/검색/퀴즈)이 이 타입을 함께 사용한다.
export interface MedicalTerm {
  id: string; // 고유 id (예: "term-001")
  english: string; // 영문 용어 (예: "Hypertension")
  korean: string; // 한글 용어 (예: "고혈압")
  meaning: string; // 뜻 / 설명
  category?: string; // 분류 (예: "순환기계") — 있으면 표시
  example?: string; // 예문 — 있으면 표시
}
