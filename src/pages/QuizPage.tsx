import { useEffect, useMemo, useState } from "react";
import type { MedicalTerm } from "../types/medicalTerm";
import { fetchTerms } from "../services/publicDataApi";
import "./QuizPage.css";

// 퀴즈 화면 (팀원 B · 기능 담당 · F-7/F-8).
// 용어에서 4지선다 문제 10개를 만들고, 채점·결과를 보여준다.

const QUIZ_SIZE = 10;

interface Question {
  term: MedicalTerm; // 정답 용어
  choices: string[]; // 보기 4개 (뜻)
  answer: string; // 정답 뜻
}

// 배열을 무작위로 섞는다 (Fisher–Yates).
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 용어 목록으로 4지선다 문제들을 만든다 (F-7, S-4: 보기 중복 방지).
function makeQuestions(terms: MedicalTerm[]): Question[] {
  const usable = terms.filter((t) => t.meaning);
  return shuffle(usable)
    .slice(0, Math.min(QUIZ_SIZE, usable.length))
    .map((term) => {
      const wrong = shuffle(usable.filter((t) => t.id !== term.id))
        .slice(0, 3)
        .map((t) => t.meaning);
      const choices = shuffle([term.meaning, ...wrong]);
      return { term, choices, answer: term.meaning };
    });
}

export default function QuizPage() {
  const [terms, setTerms] = useState<MedicalTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [round, setRound] = useState(0); // '다시 풀기'로 새 문제를 만들기 위한 키
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState<(string | null)[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetchTerms()
      .then(setTerms)
      .finally(() => setLoading(false));
  }, []);

  const questions = useMemo(() => makeQuestions(terms), [terms, round]);

  useEffect(() => {
    // 문제가 새로 만들어지면 상태 초기화
    setPicked(Array(questions.length).fill(null));
    setCurrent(0);
    setDone(false);
  }, [questions]);

  if (loading) return <p className="status">문제를 준비하는 중…</p>;
  if (questions.length === 0)
    return <p className="status">문제를 만들 용어가 부족해요.</p>;

  const q = questions[current];

  const pick = (choice: string) => {
    if (picked[current] !== null) return; // 이미 고른 문제는 잠금
    const next = [...picked];
    next[current] = choice;
    setPicked(next);
  };

  const goNext = () => {
    if (current + 1 < questions.length) setCurrent(current + 1);
    else setDone(true);
  };

  const restart = () => setRound((r) => r + 1);

  // ---- 결과 화면 (F-8) ----
  if (done) {
    const score = questions.filter((qq, i) => picked[i] === qq.answer).length;
    const wrongList = questions.filter((qq, i) => picked[i] !== qq.answer);
    return (
      <section className="quiz">
        <h2>퀴즈 결과</h2>
        <p className="quiz-score">
          {questions.length}문제 중 <strong>{score}</strong>개 정답
        </p>
        {wrongList.length > 0 && (
          <div className="quiz-review">
            <h3>틀린 문제 다시 보기</h3>
            <ul>
              {wrongList.map((qq) => (
                <li key={qq.term.id}>
                  <strong>{qq.term.english}</strong> — {qq.answer}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button className="quiz-btn primary" onClick={restart}>
          다시 풀기
        </button>
      </section>
    );
  }

  // ---- 문제 풀이 화면 (F-7) ----
  const chosen = picked[current];
  return (
    <section className="quiz">
      <h2>퀴즈</h2>
      <p className="progress">
        {current + 1} / {questions.length}
      </p>
      <p className="quiz-question">
        <strong>{q.term.english}</strong>의 뜻은?
      </p>
      <div className="quiz-choices">
        {q.choices.map((c) => {
          let cls = "quiz-choice";
          if (chosen !== null) {
            if (c === q.answer) cls += " correct";
            else if (c === chosen) cls += " wrong";
          }
          return (
            <button key={c} className={cls} onClick={() => pick(c)} disabled={chosen !== null}>
              {c}
            </button>
          );
        })}
      </div>
      {chosen !== null && (
        <button className="quiz-btn primary" onClick={goNext}>
          {current + 1 < questions.length ? "다음 문제 →" : "결과 보기"}
        </button>
      )}
    </section>
  );
}
