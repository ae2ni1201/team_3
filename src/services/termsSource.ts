import type { MedicalTerm } from "../types/medicalTerm";
import { sampleTerms } from "../data/sampleTerms";

// 용어 데이터 소스 (팀원 A · 데이터 담당).
//
// 공공데이터 오픈 API 대신 "파일 첨부" 방식으로 바꿨다.
//   - 데이터 관리 화면에서 CSV/JSON 파일을 첨부하면 파싱해서 localStorage 에 저장한다.
//   - 저장된 용어가 있으면 그걸 쓰고, 없으면 내장 기본 용어(sampleTerms)를 쓴다.
//   - 서버로 나가지 않으므로 로그인/개인정보 없이 규칙을 지킨다.

const STORAGE_KEY = "medivoca:terms";

// 화면들이 쓰는 용어 조회 함수 (기존 시그니처 유지).
export async function fetchTerms(): Promise<MedicalTerm[]> {
  const saved = getSavedTerms();
  return saved ?? sampleTerms;
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

// 파일 내용(text)을 MedicalTerm[] 로 파싱한다. JSON이면 JSON으로, 아니면 CSV로.
export function parseTermsText(text: string, fileName = ""): MedicalTerm[] {
  const trimmed = text.trim();
  const looksJson =
    fileName.toLowerCase().endsWith(".json") ||
    trimmed.startsWith("[") ||
    trimmed.startsWith("{");
  const rows = looksJson ? fromJson(trimmed) : fromCsv(trimmed);

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

function fromJson(text: string): RawRow[] {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : data.terms ?? [];
  return arr as RawRow[];
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
