import { useEffect, useState } from "react";
import type { MedicalTerm } from "../types/medicalTerm";
import { fetchTerms } from "../services/publicDataApi";
import { getUnknownIds, markKnown, clearAllUnknown } from "../services/reviewStore";
import "./WrongNotePage.css";

// 오답노트 화면 (F-10).
// 플래시카드에서 '모른다'로 표시한 용어를 모아 보여준다.
// 데이터는 브라우저(localStorage)에만 저장된 용어 id로 걸러 낸다.
export default function WrongNotePage() {
  const [terms, setTerms] = useState<MedicalTerm[]>([]);
  const [unknownIds, setUnknownIds] = useState<Set<string>>(getUnknownIds());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTerms()
      .then(setTerms)
      .finally(() => setLoading(false));
  }, []);

  const items = terms.filter((t) => unknownIds.has(t.id));

  const removeOne = (id: string) => {
    markKnown(id); // '외웠다' → 오답노트에서 제거
    setUnknownIds(getUnknownIds());
  };

  const clearAll = () => {
    clearAllUnknown();
    setUnknownIds(getUnknownIds());
  };

  if (loading) return <p className="status">오답노트를 불러오는 중…</p>;

  return (
    <section className="wrongnote">
      <div className="wn-head">
        <h2>오답노트</h2>
        {items.length > 0 && (
          <button className="wn-clear" onClick={clearAll}>모두 비우기</button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="status">
          아직 오답이 없어요. 플래시카드에서 ‘모른다’를 누르면 여기에 모여요. 🙂
        </p>
      ) : (
        <ul className="term-list">
          {items.map((t) => (
            <li key={t.id} className="term-item">
              <strong>{t.english}</strong> · {t.korean}
              <p>{t.meaning}</p>
              <button className="wn-done" onClick={() => removeOne(t.id)}>
                외웠어요 ✅
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
