import { useEffect, useMemo, useState } from "react";
import type { MedicalTerm } from "../types/medicalTerm";
import { fetchTerms } from "../services/publicDataApi";
import "./SearchPage.css";

// 검색 화면 (팀원 A · 데이터 담당 · F-2).
// 용어를 불러와 영문/한글로 검색하고, 분류(category)로도 걸러 본다.
export default function SearchPage() {
  const [terms, setTerms] = useState<MedicalTerm[]>([]);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<string>("전체");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTerms()
      .then(setTerms)
      .finally(() => setLoading(false));
  }, []);

  // 데이터에 들어있는 분류 목록을 뽑아 필터 버튼으로 쓴다.
  const categories = useMemo(() => {
    const set = new Set<string>();
    terms.forEach((t) => t.category && set.add(t.category));
    return ["전체", ...Array.from(set)];
  }, [terms]);

  const q = keyword.trim().toLowerCase();
  const results = terms.filter((t) => {
    const matchKeyword =
      !q ||
      t.english.toLowerCase().includes(q) ||
      t.korean.includes(keyword.trim()) ||
      t.meaning.includes(keyword.trim());
    const matchCategory = category === "전체" || t.category === category;
    return matchKeyword && matchCategory;
  });

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

      <div className="category-filter">
        {categories.map((c) => (
          <button
            key={c}
            className={"category-chip" + (c === category ? " active" : "")}
            onClick={() => setCategory(c)}
          >
            {c}
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
