import { useState } from "react";
import type { MedicalTerm } from "../types/medicalTerm";
import {
  parseTermsFile,
  saveTerms,
  resetTerms,
  getSavedTerms,
  saveTermsToSupabase,
  isSupabaseReady,
} from "../services/termsSource";
import "./DataPage.css";

// 데이터 관리 화면 (팀원 A · 데이터 담당).
// CSV/JSON 파일을 첨부해 의학용어를 업데이트한다. (공공데이터 API 대체)

const TEMPLATE_CSV =
  "english,korean,meaning,category,example\n" +
  "Hypertension,고혈압,혈압이 정상보다 높은 상태,순환기계,Hypertension increases the risk of stroke.\n" +
  "Fracture,골절,뼈가 부러진 상태,근골격계,\n";

export default function DataPage() {
  const savedCount = getSavedTerms()?.length ?? null;
  const [preview, setPreview] = useState<MedicalTerm[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setSavedMsg("");
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const terms = await parseTermsFile(file);
      if (terms.length === 0) {
        setPreview(null);
        setError("용어를 하나도 읽지 못했어요. 헤더(english,korean,meaning…)와 형식을 확인해 주세요.");
        return;
      }
      setPreview(terms);
      setFileName(file.name);
    } catch (err) {
      setPreview(null);
      setError("파일을 읽는 중 오류가 났어요. 엑셀(.xlsx)·CSV·JSON 형식인지 확인해 주세요.");
      console.error(err);
    }
  };

  const applySave = () => {
    if (!preview) return;
    saveTerms(preview);
    setSavedMsg(`${preview.length}개 용어를 저장했어요. 이제 모든 화면에서 이 용어로 학습합니다.`);
    setPreview(null);
  };

  const applySaveSupabase = async () => {
    if (!preview) return;
    setError("");
    setSavedMsg("");
    setSaving(true);
    try {
      const n = await saveTermsToSupabase(preview);
      setSavedMsg(`Supabase에 ${n}개 용어를 저장했어요. 이제 팀원 모두가 같은 용어로 학습합니다.`);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Supabase 저장에 실패했어요.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const doReset = () => {
    resetTerms();
    setPreview(null);
    setSavedMsg("첨부한 용어를 지우고 기본 용어로 되돌렸어요.");
  };

  const downloadTemplate = () => {
    const blob = new Blob(["﻿" + TEMPLATE_CSV], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "medivoca-용어템플릿.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="data">
      <h2>데이터 관리</h2>
      <p className="data-desc">
        의학용어를 <strong>엑셀(.xlsx)·CSV·JSON 파일로 첨부</strong>해 업데이트합니다.
        <strong>내 브라우저에만 저장</strong>하거나, Supabase가 연결돼 있으면
        <strong> 팀 공용으로 저장</strong>할 수 있습니다. (개인정보는 저장하지 않습니다)
      </p>

      <div className="data-status">
        {savedCount !== null
          ? `현재 첨부된 용어 ${savedCount}개를 사용 중`
          : "현재 기본 내장 용어를 사용 중"}
      </div>
      <div className={"data-status" + (isSupabaseReady ? " ok" : "")}>
        {isSupabaseReady
          ? "🟢 Supabase 연결됨 — 팀 공용 저장 사용 가능"
          : "⚪ Supabase 미설정 — 첨부 용어는 이 브라우저에만 저장"}
      </div>

      <ol className="data-guide">
        <li>
          아래에서 <button className="link-btn" onClick={downloadTemplate}>CSV 템플릿 다운로드</button> →
          엑셀 등에서 용어를 채웁니다. (첫 줄 헤더: <code>english, korean, meaning, category, example</code>)
        </li>
        <li>채운 파일을 <strong>첨부</strong>하고 미리보기를 확인합니다.</li>
        <li><strong>저장</strong>을 누르면 전체 용어가 이 파일 내용으로 교체됩니다.</li>
      </ol>

      <div className="data-upload">
        <label className="file-label">
          📎 파일 첨부 (.xlsx / .csv / .json)
          <input
            type="file"
            accept=".xlsx,.xls,.csv,.json"
            onChange={handleFile}
            hidden
          />
        </label>
        <button className="reset-btn" onClick={doReset}>기본 용어로 되돌리기</button>
      </div>

      {error && <p className="data-error">⚠️ {error}</p>}
      {savedMsg && <p className="data-ok">✅ {savedMsg}</p>}

      {preview && (
        <div className="data-preview">
          <p className="preview-head">
            <strong>{fileName}</strong> — {preview.length}개 용어 미리보기 (앞 5개)
          </p>
          <ul className="term-list">
            {preview.slice(0, 5).map((t) => (
              <li key={t.id} className="term-item">
                <strong>{t.english}</strong>
                {t.korean ? ` · ${t.korean}` : ""}
                <p>{t.meaning}</p>
                {t.category && <span className="badge">{t.category}</span>}
              </li>
            ))}
          </ul>
          <button className="save-btn" onClick={applySave} disabled={saving}>
            이 브라우저에 저장 ({preview.length}개)
          </button>
          {isSupabaseReady && (
            <button
              className="save-btn supabase"
              onClick={applySaveSupabase}
              disabled={saving}
            >
              {saving ? "저장 중…" : `Supabase에 저장 · 팀 공유 (${preview.length}개)`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
