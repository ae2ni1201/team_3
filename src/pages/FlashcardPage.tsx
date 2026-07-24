import { useEffect, useMemo, useState } from "react";
import type { MedicalTerm } from "../types/medicalTerm";
import { fetchTerms } from "../services/termsSource";
import { getUnknownIds, markKnown, markUnknown } from "../services/reviewStore";
import "./FlashcardPage.css";

// 플래시카드 화면 (팀원 B · 기능 담당 · F-4/F-5/F-6).
// 전체 용어에서 랜덤 20개를 뽑아 카드로 넘기며 외운다.
// 뒤집기(F-4) + 새 20개 뽑기/섞기(F-5) + 안다/모른다(F-6, 브라우저 저장).

const SESSION_SIZE = 20; // 한 번에 학습할 카드 수

// 배열을 무작위로 섞는다 (Fisher–Yates).
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 전체에서 무작위 n개를 뽑는다.
function pickRandom(all: MedicalTerm[], n: number): MedicalTerm[] {
  return shuffle(all).slice(0, Math.min(n, all.length));
}

export default function FlashcardPage() {
  const [terms, setTerms] = useState<MedicalTerm[]>([]);
  const [session, setSession] = useState<MedicalTerm[]>([]); // 랜덤 20개
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onlyUnknown, setOnlyUnknown] = useState(false); // '모른 카드만' 복습 모드
  const [unknownIds, setUnknownIds] = useState<Set<string>>(getUnknownIds());

  useEffect(() => {
    fetchTerms()
      .then((data) => {
        setTerms(data);
        setSession(pickRandom(data, SESSION_SIZE));
      })
      .finally(() => setLoading(false));
  }, []);

  // 복습 모드면 전체에서 '모른' 카드, 아니면 랜덤 20개 세션.
  const deck = useMemo(
    () => (onlyUnknown ? terms.filter((t) => unknownIds.has(t.id)) : session),
    [terms, session, onlyUnknown, unknownIds]
  );

  // 카드 묶음이 바뀌면 처음부터.
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
            랜덤 카드 보기
          </button>
        )}
      </section>
    );

  const term = deck[Math.min(index, deck.length - 1)];

  const go = (delta: number) => {
    setFlipped(false);
    setIndex((i) => (i + delta + deck.length) % deck.length); // 끝나면 처음으로 순환
  };

  const newSession = () => {
    setSession(pickRandom(terms, SESSION_SIZE));
    setIndex(0);
    setFlipped(false);
  };

  const setKnow = (known: boolean) => {
    if (known) markKnown(term.id);
    else markUnknown(term.id);
    setUnknownIds(getUnknownIds());
    go(1); // 표시 후 다음 카드로
  };

  const unknownCount = unknownIds.size;

  return (
    <section className="flashcard">
      <h2>플래시카드</h2>

      <div className="fc-toolbar">
        <button className="fc-btn" onClick={newSession}>🔀 새 카드 20개</button>
        <button
          className={"fc-btn" + (onlyUnknown ? " active" : "")}
          onClick={() => setOnlyUnknown((v) => !v)}
        >
          ⭐ 모른 카드만 ({unknownCount})
        </button>
      </div>

      <p className="progress">
        {index + 1} / {deck.length}
        {!onlyUnknown && <span className="fc-sub"> · 전체 {terms.length}개 중 랜덤</span>}
      </p>

      <button className="card" onClick={() => setFlipped((f) => !f)}>
        {flipped ? (
          <span className="card-back">
            {[term.korean, term.meaning].filter(Boolean).join(" — ")}
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
