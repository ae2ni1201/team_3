import type { MedicalTerm } from "../types/medicalTerm";

// 공공데이터 API/Supabase 연결 전에도 데모가 돌아가도록 넣어둔 샘플 데이터.
// 데이터 담당(F-1)이 API를 연결하면 이 파일은 "대체(fallback) 데이터"로만 쓰인다.
export const sampleTerms: MedicalTerm[] = [
  { id: "term-001", english: "Hypertension", korean: "고혈압", meaning: "혈압이 정상보다 높은 상태.", category: "순환기계", example: "Hypertension increases the risk of stroke." },
  { id: "term-002", english: "Tachycardia", korean: "빈맥", meaning: "심장 박동이 정상보다 빠른 상태.", category: "순환기계" },
  { id: "term-003", english: "Bradycardia", korean: "서맥", meaning: "심장 박동이 정상보다 느린 상태.", category: "순환기계" },
  { id: "term-004", english: "Dyspnea", korean: "호흡곤란", meaning: "숨쉬기가 어렵거나 힘든 증상.", category: "호흡기계" },
  { id: "term-005", english: "Pneumonia", korean: "폐렴", meaning: "폐에 염증이 생긴 질환.", category: "호흡기계" },
  { id: "term-006", english: "Anemia", korean: "빈혈", meaning: "혈액 속 적혈구나 헤모글로빈이 부족한 상태.", category: "혈액" },
  { id: "term-007", english: "Edema", korean: "부종", meaning: "몸의 조직에 물이 차서 붓는 상태.", category: "일반" },
  { id: "term-008", english: "Fracture", korean: "골절", meaning: "뼈가 부러진 상태.", category: "근골격계" },
  { id: "term-009", english: "Hepatitis", korean: "간염", meaning: "간에 염증이 생긴 질환.", category: "소화기계" },
  { id: "term-010", english: "Nephritis", korean: "신장염", meaning: "신장(콩팥)에 염증이 생긴 질환.", category: "비뇨기계" },
  { id: "term-011", english: "Gastritis", korean: "위염", meaning: "위 점막에 염증이 생긴 질환.", category: "소화기계" },
  { id: "term-012", english: "Arthritis", korean: "관절염", meaning: "관절에 염증이 생겨 통증이 나타나는 질환.", category: "근골격계" },
  { id: "term-013", english: "Diabetes", korean: "당뇨병", meaning: "혈당이 높게 유지되는 대사 질환.", category: "내분비계" },
  { id: "term-014", english: "Insomnia", korean: "불면증", meaning: "잠들기 어렵거나 자주 깨는 수면 장애.", category: "신경계" },
  { id: "term-015", english: "Migraine", korean: "편두통", meaning: "머리 한쪽이 심하게 아픈 두통.", category: "신경계" },
];
