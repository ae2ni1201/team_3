import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 (데이터 담당 관리).
// 환경변수는 .env.local 에 넣는다 (.gitignore 로 커밋 제외).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 값이 없으면 null 로 두고, 화면에서는 샘플 데이터로 대체한다.
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseReady = supabase !== null;
