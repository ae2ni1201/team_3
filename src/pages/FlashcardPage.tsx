import { useEffect, useState } from "react";
import type { MedicalTerm } from "../types/medicalTerm";
import { fetchTerms } from "../services/publicDataApi";

// 플래시카드 화면 (팀원 B · 기능 담당 · F-4/F-5).
// 시작 코드: 카드를 눌러 앞(용어)/뒤(뜻)를 뒤집고, 다음/이전으로 넘긴다.
// TODO(팀원 B): 카드 섞기(F-5), 안다/모른다 표시(F-6) 추가.
export default function FlashcardPage() {
  const [terms, setTerms] = useState<MedicalTerm[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTerms()
      .then(setTerms)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="status">카드를 불러오는 중…</p>;
  if (terms.length === 0) return <p className="status">표시할 용어가 없어요.</p>;

  const term = terms[index];

  const go = (delta: number) => {
    setFlipped(false);
    setIndex((i) => (i + delta + terms.length) % terms.length);
  };

  return (
    <section className="flashcard">
      <h2>플래시카드</h2>
      <p className="progress">
        {index + 1} / {terms.length}
      </p>
      <button className="card" onClick={() => setFlipped((f) => !f)}>
        {flipped ? (
          <span className="card-back">{term.korean} — {term.meaning}</span>
        ) : (
          <span className="card-front">{term.english}</span>
        )}
      </button>
      <p className="hint">카드를 누르면 뜻이 보여요</p>
      <div className="card-controls">
        <button onClick={() => go(-1)}>← 이전</button>
        <button onClick={() => go(1)}>다음 →</button>
      </div>
    </section>
  );
}
