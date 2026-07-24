import { useEffect, useState } from "react";
import type { MedicalTerm } from "../types/medicalTerm";
import { fetchTerms } from "../services/publicDataApi";

// 검색 화면 (팀원 A · 데이터 담당 · F-2).
// 시작 코드: 용어를 불러와 영문/한글로 검색해 걸러 보여준다.
export default function SearchPage() {
  const [terms, setTerms] = useState<MedicalTerm[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTerms()
      .then(setTerms)
      .finally(() => setLoading(false));
  }, []);

  const q = keyword.trim().toLowerCase();
  const results = q
    ? terms.filter(
        (t) =>
          t.english.toLowerCase().includes(q) ||
          t.korean.includes(keyword.trim()) ||
          t.meaning.includes(keyword.trim())
      )
    : terms;

  if (loading) return <p className="status">용어를 불러오는 중…</p>;

  return (
    <section className="search">
      <h2>용어 검색</h2>
      <input
        className="search-input"
        placeholder="영문 또는 한글로 검색 (예: heart, 고혈압)"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      {results.length === 0 ? (
        <p className="status">검색 결과가 없어요.</p>
      ) : (
        <ul className="term-list">
          {results.map((t) => (
            <li key={t.id} className="term-item">
              <strong>{t.english}</strong> · {t.korean}
              <p>{t.meaning}</p>
              {t.category && <span className="badge">{t.category}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
