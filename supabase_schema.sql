-- =====================================================
-- ระบบบันทึกการตรวจสอบงานวิชาการ
-- รัน SQL นี้ใน Supabase → SQL Editor
-- =====================================================

-- ── Tables ──────────────────────────────────────────

create table if not exists teachers (
  id            bigserial primary key,
  teacher_id    text unique not null,
  full_name     text not null,
  citizen_id    text default '',
  category_name text default '',
  img_url       text default ''
);

create table if not exists assignments (
  id            bigserial primary key,
  name          text not null,
  description   text default '',
  semester      text default '',
  academic_year text default '',
  due_date      text default '',
  is_active     boolean default true,
  created_at    timestamptz default now()
);

create table if not exists submissions (
  id            bigserial primary key,
  teacher_id    bigint references teachers(id) on delete cascade,
  assignment_id bigint references assignments(id) on delete cascade,
  status        text default 'รอตรวจสอบ',
  note          text default '',
  link_url      text default '',
  link_title    text default '',
  submitted_at  timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(teacher_id, assignment_id)
);

-- migration: ถ้ามีตาราง submissions อยู่แล้วให้รันบรรทัดนี้แยกต่างหาก
-- alter table submissions add column if not exists link_url text default '';
-- alter table submissions add column if not exists link_title text default '';

-- migration: เพิ่มคอลัมน์ควบคุมการแสดงผลงาน
-- alter table assignments add column if not exists is_visible boolean default true;
-- alter table assignments add column if not exists is_pinned  boolean default false;
-- alter table assignments add column if not exists sort_order integer default 0;

create table if not exists accounts (
  id         bigserial primary key,
  full_name  text default '',
  username   text unique not null,
  password   text not null,
  role       text default 'checker',
  is_active  boolean default true
);

create table if not exists config (
  key   text primary key,
  value text default ''
);

-- ── Seed config (ค่าเริ่มต้น) ──────────────────────

insert into config (key, value) values
  ('system_name',              'ระบบบันทึกการตรวจสอบงานวิชาการ'),
  ('school_name',              'โรงเรียน'),
  ('semester',                 '1'),
  ('academic_year',            '2567'),
  ('banner_color',             '#1e3a5f'),
  ('banner_color2',            '#1e6fa8'),
  ('logo_url',                 ''),
  ('academic_head_name',       ''),
  ('academic_head_position',   ''),
  ('deputy_director_name',     ''),
  ('deputy_director_position', '')
on conflict (key) do nothing;

-- ── Default admin account ──────────────────────────
-- username: admin  password: admin1234  (เปลี่ยนทันทีหลัง deploy)

insert into accounts (full_name, username, password, role, is_active) values
  ('ผู้ดูแลระบบ', 'admin', 'admin1234', 'admin', true)
on conflict (username) do nothing;

-- ── Row Level Security ─────────────────────────────
-- เปิด RLS แต่อนุญาตทุกอย่างด้วย anon key (ปรับให้รัดกุมขึ้นภายหลัง)

alter table teachers    enable row level security;
alter table assignments enable row level security;
alter table submissions enable row level security;
alter table accounts    enable row level security;
alter table config      enable row level security;

create policy "anon_all" on teachers    for all using (true) with check (true);
create policy "anon_all" on assignments for all using (true) with check (true);
create policy "anon_all" on submissions for all using (true) with check (true);
create policy "anon_all" on accounts    for all using (true) with check (true);
create policy "anon_all" on config      for all using (true) with check (true);
