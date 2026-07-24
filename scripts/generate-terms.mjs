// 엑셀(의학용어.xlsx: "의학용어","뜻" 2열)을 앱 기본 데이터(JSON)로 변환한다.
// 사용: node scripts/generate-terms.mjs "<xlsx 경로>"
import * as XLSX from "xlsx";
import fs from "node:fs";

const src = process.argv[2] || "C:/Users/inae3/Desktop/CCN/의학용어.xlsx";
const wb = XLSX.read(fs.readFileSync(src), { type: "buffer" });
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });

const seen = new Set();
const terms = [];
for (const r of rows) {
  const english = String(r["의학용어"] ?? "").trim();
  const meaning = String(r["뜻"] ?? "").trim();
  if (!english && !meaning) continue;
  const key = english.toLowerCase();
  if (key && seen.has(key)) continue; // 같은 영문 용어 중복 제거
  seen.add(key);
  terms.push({
    id: `term-${String(terms.length + 1).padStart(4, "0")}`,
    english,
    meaning,
  });
}

fs.writeFileSync(
  "C:/Users/inae3/Desktop/0724/src/data/medicalTerms.json",
  JSON.stringify(terms, null, 2),
  "utf8"
);
console.log(`generated ${terms.length} terms (from ${rows.length} rows)`);
