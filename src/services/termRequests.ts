import { supabase, isSupabaseReady } from "./supabase";

// 단어 추가 요청 게시판 (Supabase 공용 테이블 term_requests).
// 로그인 없이 누구나 "이 용어를 추가해 주세요"를 올리고 목록으로 본다.
// 개인정보는 받지 않는다(용어/뜻만).

export { isSupabaseReady };

export interface TermRequest {
  id: string;
  english: string;
  meaning: string;
  created_at: string;
}

// 요청 목록을 최신순으로 가져온다.
export async function fetchRequests(): Promise<TermRequest[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("term_requests")
    .select("id, english, meaning, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as TermRequest[];
}

// 새 요청을 등록한다.
export async function addRequest(
  english: string,
  meaning: string
): Promise<TermRequest> {
  if (!supabase) {
    throw new Error("Supabase가 설정되지 않았어요. .env.local 의 VITE_SUPABASE_* 값을 확인하세요.");
  }
  const payload = { english: english.trim(), meaning: meaning.trim() };
  const { data, error } = await supabase
    .from("term_requests")
    .insert(payload)
    .select("id, english, meaning, created_at")
    .single();
  if (error) throw error;
  return data as TermRequest;
}
