import { useEffect, useMemo, useState } from "react";
import type { MedicalTerm } from "../types/medicalTerm";
import { fetchTerms } from "../services/publicDataApi";
import { getUnknownIds, markKnown, markUnknown } from "../services/reviewStore";
import "./FlashcardPage.css";

// 플래시카드 화면 (팀원 B · 기능 담당 · F-4/F-5/F-6).
// 카드 뒤집기(F-4) + 섞기(F-5) + 안다/모른다(F-6, 브라우저 저장).

// 배열을 무작위로 섞는다 (Fisher–Yates).
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardPage() {
  const [terms, setTerms] = useState<MedicalTerm[]>([]);
  const [order, setOrder] = useState<MedicalTerm[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onlyUnknown, setOnlyUnknown] = useState(false); // '모른 카드만' 복습 모드
  const [unknownIds, setUnknownIds] = useState<Set<string>>(getUnknownIds());

  useEffect(() => {
    fetchTerms()
      .then((data) => {
        setTerms(data);
        setOrder(data);
      })
      .finally(() => setLoading(false));
  }, []);

  // 복습 모드에 따라 보여줄 카드 목록을 정한다.
  const deck = useMemo(
    () => (onlyUnknown ? order.filter((t) => unknownIds.has(t.id)) : order),
    [order, onlyUnknown, unknownIds]
  );

  // 카드 목록이 바뀌면 처음부터.
  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [deck.length, onlyUnknown]);

  if (loading) return <p className="status">카드를 불러오는 중…</p>;
  if (terms.length === 0) return <p className="status">표시할 용어가 없어요.</p>;
  if (deck.length === 0)
    return (
      <section className="flashcard">
        <h2>플래시카드</h2>
        <p className="status">
          {onlyUnknown ? "‘모른다’로 표시한 카드가 없어요. 👍" : "표시할 용어가 없어요."}
        </p>
        {onlyUnknown && (
          <button className="fc-btn" onClick={() => setOnlyUnknown(false)}>
            전체 카드 보기
          </button>
        )}
      </section>
    );

  const term = deck[Math.min(index, deck.length - 1)];

  const go = (delta: number) => {
    setFlipped(false);
    setIndex((i) => (i + delta + deck.length) % deck.length);
  };

  const doShuffle = () => {
    setOrder((prev) => shuffle(prev));
    setIndex(0);
    setFlipped(false);
  };

  const setKnow = (known: boolean) => {
    if (known) {
      markKnown(term.id);
    } else {
      markUnknown(term.id);
    }
    setUnknownIds(getUnknownIds());
    go(1); // 표시 후 다음 카드로
  };

  const unknownCount = unknownIds.size;

  return (
    <section className="flashcard">
      <h2>플래시카드</h2>

      <div className="fc-toolbar">
        <button className="fc-btn" onClick={doShuffle}>🔀 섞기</button>
        <button
          className={"fc-btn" + (onlyUnknown ? " active" : "")}
          onClick={() => setOnlyUnknown((v) => !v)}
        >
          ⭐ 모른 카드만 ({unknownCount})
        </button>
      </div>

      <p className="progress">
        {index + 1} / {deck.length}
      </p>

      <button className="card" onClick={() => setFlipped((f) => !f)}>
        {flipped ? (
          <span className="card-back">
            {term.korean} — {term.meaning}
          </span>
        ) : (
          <span className="card-front">{term.english}</span>
        )}
      </button>
      <p className="hint">카드를 누르면 뜻이 보여요</p>

      <div className="fc-know">
        <button className="fc-btn know" onClick={() => setKnow(true)}>✅ 안다</button>
        <button className="fc-btn dont" onClick={() => setKnow(false)}>❌ 모른다</button>
      </div>

      <div className="card-controls">
        <button onClick={() => go(-1)}>← 이전</button>
        <button onClick={() => go(1)}>다음 →</button>
      </div>
    </section>
  );
}
