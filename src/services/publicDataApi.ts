import type { MedicalTerm } from "../types/medicalTerm";
import { sampleTerms } from "../data/sampleTerms";
import { supabase } from "./supabase";

// 용어 데이터를 가져오는 서비스 (데이터 담당 F-1).
//
// 우선순위:
//   1) 공공데이터 API (VITE_PUBLIC_DATA_API_URL / KEY 가 있으면)
//   2) Supabase 테이블 "terms"
//   3) 샘플 데이터 (위 둘 다 없거나 실패하면)
//
// TODO(데이터 담당): 실제 공공데이터 API 응답 구조에 맞춰 mapping 부분을 채운다.

const API_URL = import.meta.env.VITE_PUBLIC_DATA_API_URL;
const API_KEY = import.meta.env.VITE_PUBLIC_DATA_API_KEY;

export async function fetchTerms(): Promise<MedicalTerm[]> {
  // 1) 공공데이터 API
  if (API_URL && API_KEY) {
    try {
      const url = `${API_URL}?serviceKey=${encodeURIComponent(API_KEY)}&type=json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API 응답 오류: ${res.status}`);
      const json = await res.json();
      // TODO: 아래 매핑을 실제 응답 필드명에 맞춰 수정하세요.
      const items: any[] = json?.items ?? json?.response?.body?.items ?? [];
      if (items.length > 0) {
        return items.map((it, i) => ({
          id: it.id ?? `api-${i}`,
          english: it.engTerm ?? it.english ?? "",
          korean: it.korTerm ?? it.korean ?? "",
          meaning: it.definition ?? it.meaning ?? "",
          category: it.category,
          example: it.example,
        }));
      }
    } catch (err) {
      console.warn("공공데이터 API 호출 실패, 다음 소스로 대체합니다.", err);
    }
  }

  // 2) Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase.from("terms").select("*");
      if (error) throw error;
      if (data && data.length > 0) {
        return data as MedicalTerm[];
      }
    } catch (err) {
      console.warn("Supabase 조회 실패, 샘플 데이터로 대체합니다.", err);
    }
  }

  // 3) 샘플 데이터 (데모용 fallback)
  return sampleTerms;
}
