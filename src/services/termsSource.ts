import type { MedicalTerm } from "../types/medicalTerm";
import { sampleTerms } from "../data/sampleTerms";
import { supabase, isSupabaseReady } from "./supabase";
import * as XLSX from "xlsx";

// 용어 데이터 소스 (팀원 A · 데이터 담당).
//
// 용어 조회 우선순위:
//   1) Supabase 공용 테이블(terms) — 팀이 함께 쓰는 저장소 (설정된 경우)
//   2) 이 브라우저에 첨부·저장한 용어 (localStorage)
//   3) 내장 기본 용어(sampleTerms)
// 용어는 개인정보가 아니므로 Supabase 공용 저장이 팀 규칙에 맞는다(로그인 없음 유지).

export { isSupabaseReady };

const STORAGE_KEY = "medivoca:terms";
const TERM_COLUMNS = "id, english, korean, meaning, category, example";

// 화면들이 쓰는 용어 조회 함수 (기존 시그니처 유지).
export async function fetchTerms(): Promise<MedicalTerm[]> {
  // 1) Supabase 공용 용어
  if (supabase) {
    try {
      const { data, error } = await supabase.from("terms").select(TERM_COLUMNS);
      if (error) throw error;
      if (data && data.length > 0) return data as MedicalTerm[];
    } catch (err) {
      console.warn("Supabase 조회 실패, 로컬/기본 데이터로 대체합니다.", err);
    }
  }
  // 2) 이 브라우저에 저장한 용어  3) 내장 기본 용어
  return getSavedTerms() ?? sampleTerms;
}

// 용어를 Supabase 공용 테이블에 저장(모두 공유). 저장한 개수를 반환한다.
export async function saveTermsToSupabase(terms: MedicalTerm[]): Promise<number> {
  if (!supabase) {
    throw new Error("Supabase가 설정되지 않았어요. .env.local 의 VITE_SUPABASE_* 값을 확인하세요.");
  }
  const chunkSize = 500; // 요청 크기 제한 대비 나눠서 upsert
  for (let i = 0; i < terms.length; i += chunkSize) {
    const chunk = terms.slice(i, i + chunkSize).map((t) => ({
      id: t.id,
      english: t.english,
      korean: t.korean ?? null,
      meaning: t.meaning,
      category: t.category ?? null,
      example: t.example ?? null,
    }));
    const { error } = await supabase.from("terms").upsert(chunk);
    if (error) throw error;
  }
  return terms.length;
}

// 저장된(첨부한) 용어 목록. 없으면 null.
export function getSavedTerms(): MedicalTerm[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const arr = JSON.parse(raw) as MedicalTerm[];
    return Array.isArray(arr) && arr.length > 0 ? arr : null;
  } catch {
    return null;
  }
}

// 첨부 파일을 파싱해 얻은 용어를 저장한다.
export function saveTerms(terms: MedicalTerm[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(terms));
}

// 첨부한 용어를 지우고 기본 용어로 되돌린다.
export function resetTerms() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isUsingUploaded(): boolean {
  return getSavedTerms() !== null;
}

// ---- 파일 파싱 ----

// 첨부한 파일을 형식에 맞춰 MedicalTerm[] 로 파싱한다.
// 지원: .xlsx / .xls (엑셀), .csv, .json
export async function parseTermsFile(file: File): Promise<MedicalTerm[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const buffer = await file.arrayBuffer();
    return rowsToTerms(fromExcel(buffer));
  }
  const text = await file.text();
  return parseTermsText(text, file.name);
}

// 파일 내용(text)을 MedicalTerm[] 로 파싱한다. JSON이면 JSON으로, 아니면 CSV로.
export function parseTermsText(text: string, fileName = ""): MedicalTerm[] {
  const trimmed = text.trim();
  const looksJson =
    fileName.toLowerCase().endsWith(".json") ||
    trimmed.startsWith("[") ||
    trimmed.startsWith("{");
  const rows = looksJson ? fromJson(trimmed) : fromCsv(trimmed);
  return rowsToTerms(rows);
}

// 원시 행(RawRow)들을 최종 MedicalTerm[] 로 변환한다 (모든 형식 공통).
function rowsToTerms(rows: RawRow[]): MedicalTerm[] {
  return rows
    .map((r, i) => ({
      id: r.id?.trim() || `term-${i + 1}`,
      english: (r.english ?? "").trim(),
      korean: (r.korean ?? "").trim(),
      meaning: (r.meaning ?? "").trim(),
      category: r.category?.trim() || undefined,
      example: r.example?.trim() || undefined,
    }))
    // 영문/한글/뜻 중 하나라도 있으면 유효한 줄로 본다.
    .filter((t) => t.english || t.korean || t.meaning);
}

interface RawRow {
  id?: string;
  english?: string;
  korean?: string;
  meaning?: string;
  category?: string;
  example?: string;
}

// 헤더가 자유로운 객체 목록(엑셀/JSON)을 RawRow 로 정규화한다.
function normalizeObjects(objs: Record<string, unknown>[]): RawRow[] {
  return objs.map((obj) => {
    const row: RawRow = {};
    for (const [rawKey, value] of Object.entries(obj)) {
      const key = headerToKey(rawKey);
      if (key) row[key] = value == null ? "" : String(value);
    }
    return row;
  });
}

function fromJson(text: string): RawRow[] {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : data.terms ?? [];
  return normalizeObjects(arr as Record<string, unknown>[]);
}

function fromExcel(buffer: ArrayBuffer): RawRow[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const first = wb.SheetNames[0];
  if (!first) return [];
  const sheet = wb.Sheets[first];
  // 첫 줄을 헤더로 보고 객체 배열로 변환 (빈 칸은 "" 로).
  const objs = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });
  return normalizeObjects(objs);
}

// 헤더 이름을 우리 필드로 매핑 (영문/한글 헤더 모두 허용).
function headerToKey(h: string): keyof RawRow | null {
  const k = h.trim().toLowerCase();
  if (["id"].includes(k)) return "id";
  if (["english", "영문", "영어", "term"].includes(k)) return "english";
  if (["korean", "한글", "국문"].includes(k)) return "korean";
  if (["meaning", "뜻", "의미", "정의", "설명"].includes(k)) return "meaning";
  if (["category", "분류", "카테고리"].includes(k)) return "category";
  if (["example", "예문", "예시"].includes(k)) return "example";
  return null;
}

function fromCsv(text: string): RawRow[] {
  const grid = parseCsvGrid(text);
  if (grid.length < 2) return [];
  const header = grid[0].map(headerToKey);
  const rows: RawRow[] = [];
  for (let r = 1; r < grid.length; r++) {
    const cells = grid[r];
    if (cells.every((c) => c.trim() === "")) continue; // 빈 줄 skip
    const row: RawRow = {};
    header.forEach((key, c) => {
      if (key) row[key] = cells[c] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

// 따옴표·쉼표를 처리하는 CSV 파서.
function parseCsvGrid(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}
