-- Supabase 용어 테이블 (데이터 담당 관리).
-- Supabase 대시보드 > SQL Editor 에 붙여넣어 실행하면 테이블과 정책이 만들어집니다.
-- 용어는 개인정보가 아니므로 공용 저장합니다. (이름·전화번호 등 개인정보는 저장 금지)

create table if not exists public.terms (
  id text primary key,
  english text not null,
  korean text,            -- 한글 표기(선택). 데이터에 따라 비어 있을 수 있음
  meaning text not null,  -- 뜻
  category text,
  example text
);

-- 로그인이 없으므로 RLS를 켜고, 익명 사용자에게 읽기 + 저장(업서트)을 허용한다.
-- 주의: 로그인이 없어 누구나 쓰기가 가능하므로, 개인정보는 절대 넣지 말고 용어 데이터만 다룬다.
alter table public.terms enable row level security;

create policy "누구나 읽기 가능" on public.terms
  for select using (true);

create policy "누구나 추가 가능" on public.terms
  for insert with check (true);

create policy "누구나 수정 가능" on public.terms
  for update using (true) with check (true);

-- 초기 데이터는 앱의 [데이터] 화면에서 "Supabase에 저장" 버튼으로 한 번에 올리거나,
-- 아래처럼 직접 넣을 수도 있습니다.
insert into public.terms (id, english, korean, meaning, category) values
  ('term-001', 'Hypertension', '고혈압', '혈압이 정상보다 높은 상태.', '순환기계'),
  ('term-002', 'Tachycardia', '빈맥', '심장 박동이 정상보다 빠른 상태.', '순환기계')
on conflict (id) do nothing;
