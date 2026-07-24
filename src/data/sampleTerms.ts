import type { MedicalTerm } from "../types/medicalTerm";
import terms from "./medicalTerms.json";

// 내장 기본 용어. 파일을 첨부하기 전에도 앱이 바로 돌아가도록 넣어둔다.
// medicalTerms.json 은 의학용어.xlsx(의학용어/뜻 2열)에서 생성됨 (scripts/generate-terms.mjs).
// 데이터 관리 화면에서 CSV/JSON/엑셀을 첨부하면 이 목록 대신 첨부한 용어를 쓴다.
export const sampleTerms: MedicalTerm[] = terms as MedicalTerm[];
