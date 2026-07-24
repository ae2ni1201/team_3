import { useEffect, useState } from "react";
import type { MedicalTerm } from "../types/medicalTerm";
import { fetchTerms } from "../services/termsSource";
import "./SearchPage.css";

// 단어장 화면 (팀원 A · 데이터 담당).
// 검색 + 알파벳(A~Z / All) 버튼으로 용어를 찾아본다.
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

export default function SearchPage() {
  const [terms, setTerms] = useState<MedicalTerm[]>([]);
  const [keyword, setKeyword] = useState("");
  const [letter, setLetter] = useState("all"); // "all" 또는 알파벳 한 글자
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTerms()
      .then(setTerms)
      .finally(() => setLoading(false));
  }, []);

  const q = keyword.trim().toLowerCase();
  const results = terms.filter((t) => {
    const matchKeyword =
      !q ||
      t.english.toLowerCase().includes(q) ||
      (t.korean ? t.korean.includes(keyword.trim()) : false) ||
      t.meaning.includes(keyword.trim());
    const matchLetter =
      letter === "all" || t.english.toLowerCase().startsWith(letter);
    return matchKeyword && matchLetter;
  });

  if (loading) return <p className="status">용어를 불러오는 중…</p>;

  return (
    <section className="search">
      <h2>단어장</h2>

      <input
        className="search-input"
        placeholder="검색할 용어를 넣어주세요."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      {/* 알파벳 이동 버튼 (All + A~Z) */}
      <div className="alpha-grid">
        <button
          className={"alpha-btn all" + (letter === "all" ? " active" : "")}
          onClick={() => setLetter("all")}
        >
          All
        </button>
        {LETTERS.map((l) => (
          <button
            key={l}
            className={"alpha-btn" + (letter === l ? " active" : "")}
            onClick={() => setLetter(l)}
          >
            {l}
          </button>
        ))}
      </div>

      <p className="result-count">{results.length}개 용어</p>

      {results.length === 0 ? (
        <p className="status">검색 결과가 없어요.</p>
      ) : (
        <ul className="term-list">
          {results.map((t) => (
            <li key={t.id} className="term-item">
              <strong>{t.english}</strong>
              {t.korean ? ` · ${t.korean}` : ""}
              <p>{t.meaning}</p>
              {t.category && <span className="badge">{t.category}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
