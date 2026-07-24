import { useEffect, useState } from "react";
import {
  fetchRequests,
  addRequest,
  isSupabaseReady,
  type TermRequest,
} from "../services/termRequests";
import "./RequestPage.css";

// 단어 추가 요청 탭.
// 누구나 로그인 없이 "추가했으면 하는 용어"를 올리고, 올라온 요청을 함께 본다.
// 요청은 Supabase 공용 테이블(term_requests)에 저장된다.
export default function RequestPage() {
  const [list, setList] = useState<TermRequest[]>([]);
  const [english, setEnglish] = useState("");
  const [meaning, setMeaning] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    fetchRequests()
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : "목록을 불러오지 못했어요."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isSupabaseReady) load();
    else setLoading(false);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!english.trim() || !meaning.trim()) {
      setError("용어와 뜻을 모두 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const created = await addRequest(english, meaning);
      setList((prev) => [created, ...prev]); // 목록 맨 위에 바로 추가
      setEnglish("");
      setMeaning("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  };

  // Supabase가 없으면 요청 게시판을 쓸 수 없으므로 안내만 보여준다.
  if (!isSupabaseReady) {
    return (
      <section className="request">
        <h2>단어 추가 요청</h2>
        <p className="status">
          이 기능은 팀 공용 저장(Supabase)이 필요해요. <br />
          <code>.env.local</code> 에 <code>VITE_SUPABASE_*</code> 값을 넣으면 활성화됩니다.
        </p>
      </section>
    );
  }

  return (
    <section className="request">
      <h2>단어 추가 요청</h2>
      <p className="request-desc">
        사전에 넣었으면 하는 의학용어를 올려 주세요. 팀원 모두가 함께 봅니다.
      </p>

      <form className="request-form" onSubmit={submit}>
        <input
          className="request-input"
          placeholder="영문 용어 (예: tachypnea)"
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          maxLength={80}
        />
        <input
          className="request-input"
          placeholder="뜻 (예: 빠른 호흡)"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          maxLength={200}
        />
        <button className="request-submit" type="submit" disabled={submitting}>
          {submitting ? "등록 중…" : "요청 올리기"}
        </button>
      </form>

      {error && <p className="request-error">⚠️ {error}</p>}

      {loading ? (
        <p className="status">요청 목록을 불러오는 중…</p>
      ) : list.length === 0 ? (
        <p className="status">아직 요청이 없어요. 첫 요청을 올려 보세요! 🙂</p>
      ) : (
        <ul className="request-list">
          {list.map((r) => (
            <li key={r.id} className="request-item">
              <strong>{r.english}</strong> — {r.meaning}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
