-- Supabase 용어 테이블 (데이터 담당 관리).
-- Supabase 대시보드 > SQL Editor 에 붙여넣어 실행하면 테이블과 샘플 데이터가 만들어집니다.
-- 개인정보는 저장하지 않습니다. 조회 중심으로만 사용합니다.

create table if not exists public.terms (
  id text primary key,
  english text not null,
  korean text not null,
  meaning text not null,
  category text,
  example text
);

-- 로그인이 없으므로 익명 읽기만 허용 (쓰기는 대시보드에서만).
alter table public.terms enable row level security;

create policy "누구나 읽기 가능" on public.terms
  for select using (true);

insert into public.terms (id, english, korean, meaning, category) values
  ('term-001', 'Hypertension', '고혈압', '혈압이 정상보다 높은 상태.', '순환기계'),
  ('term-002', 'Tachycardia', '빈맥', '심장 박동이 정상보다 빠른 상태.', '순환기계'),
  ('term-003', 'Bradycardia', '서맥', '심장 박동이 정상보다 느린 상태.', '순환기계'),
  ('term-004', 'Dyspnea', '호흡곤란', '숨쉬기가 어렵거나 힘든 증상.', '호흡기계'),
  ('term-005', 'Pneumonia', '폐렴', '폐에 염증이 생긴 질환.', '호흡기계')
on conflict (id) do nothing;
