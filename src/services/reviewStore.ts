// '모른다'로 표시한 용어(오답)를 브라우저에만 저장하는 헬퍼 (팀원 B).
// 로그인이 없으므로 개인정보 없이 localStorage 에만 저장한다. 서버로 나가지 않는다.
// 저장하는 것은 용어 id 뿐이다.

const KEY = "medivoca:unknownTermIds";

// 저장된 '모른다' 용어 id 집합을 읽는다.
export function getUnknownIds(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function save(ids: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // 저장 실패(용량 초과 등)해도 앱은 계속 동작한다.
  }
}

// '모른다'로 표시 → 오답 목록에 추가.
export function markUnknown(id: string) {
  const ids = getUnknownIds();
  ids.add(id);
  save(ids);
}

// '안다'로 표시 → 오답 목록에서 제거.
export function markKnown(id: string) {
  const ids = getUnknownIds();
  ids.delete(id);
  save(ids);
}
