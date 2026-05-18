# Academic CRW — ระบบบันทึกการตรวจสอบงานวิชาการ

ระบบสำหรับบริหารจัดการการส่งและตรวจสอบงานวิชาการของครูในโรงเรียน  
รองรับการใช้งานบนมือถือแบบ PWA (ติดตั้งเป็นแอปได้โดยไม่ต้องผ่าน App Store)

**Tech Stack:** Vue 3 · Vite · TailwindCSS 4 · Pinia · Supabase · Vercel

---

## ฟีเจอร์หลัก

| ฟีเจอร์ | รายละเอียด |
|---|---|
| ส่งงาน | ครูส่งงานพร้อมแนบ link ได้ |
| ตรวจสอบ | Checker เปลี่ยน status พร้อมโน้ต |
| Dashboard | สถิติ ส่งแล้ว / รอตรวจ / ผ่าน / ไม่ผ่าน / ขอแก้ไข |
| รายงาน | Export Excel ได้ |
| Ranking | จัดอันดับครูที่ส่งงานครบ |
| จัดการข้อมูล | นำเข้าครูจาก Excel, จัดการงาน, บัญชีผู้ใช้ |
| ตั้งค่า | ชื่อโรงเรียน, สี banner, โลโก้, ชื่อหัวหน้า |
| PWA | ติดตั้งบนมือถือได้ ใช้งาน offline ได้บางส่วน |

**บทบาทผู้ใช้:** `admin` · `checker` · `teacher`

---

## วิธี Deploy ระบบนี้ให้โรงเรียนของคุณ

### ขั้นที่ 1 — Fork โปรเจค

1. กดปุ่ม **Fork** มุมขวาบนของหน้า GitHub นี้
2. เลือก GitHub account ของคุณ → กด **Create fork**
3. คุณจะได้ repo ส่วนตัวที่แก้ไขได้อิสระ

---

### ขั้นที่ 2 — สร้าง Supabase Project

1. ไปที่ [supabase.com](https://supabase.com) → สมัครฟรี → **New Project**
2. ตั้งชื่อ project และ password (เก็บไว้)
3. รอ project พร้อม (~1 นาที)
4. ไปที่ **SQL Editor** → วางเนื้อหาทั้งหมดจากไฟล์ `supabase_schema.sql` → กด **Run**
5. ไปที่ **Project Settings → API** → copy ค่า 2 อย่าง:
   - `Project URL`
   - `anon public` key

---

### ขั้นที่ 3 — Deploy บน Vercel

1. ไปที่ [vercel.com](https://vercel.com) → สมัครด้วย GitHub
2. กด **Add New Project** → เลือก repo ที่ Fork มา
3. Vercel ตรวจจับ Vite อัตโนมัติ → กด **Deploy**
4. หลัง deploy เสร็จ ไปที่ **Settings → Environment Variables** → เพิ่ม:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | Project URL จาก Supabase |
| `VITE_SUPABASE_KEY` | anon public key จาก Supabase |

5. กด **Deployments → Redeploy** เพื่อให้ค่า env vars มีผล

---

### ขั้นที่ 4 — เข้าสู่ระบบครั้งแรก

เปิด URL ที่ได้จาก Vercel แล้วเข้าสู่ระบบด้วย:

```
Username : admin
Password : admin1234
```

> ⚠️ **เปลี่ยนรหัสผ่าน admin ทันที** ไปที่ Admin → บัญชีผู้ใช้

---

### ขั้นที่ 5 — ตั้งค่าให้เป็นของโรงเรียน

ไปที่ **Admin → ตั้งค่าระบบ** แล้วแก้ไข:

- ชื่อระบบ / ชื่อโรงเรียน
- สีธีม banner (ใส่ hex color เช่น `#1e3a5f`)
- URL โลโก้โรงเรียน
- ชื่อหัวหน้างานวิชาการ / รองผู้อำนวยการ
- ภาคเรียน / ปีการศึกษา

---

## โครงสร้างฐานข้อมูล

```
teachers       — ข้อมูลครู (teacher_id, full_name, citizen_id, category_name)
assignments    — งานที่กำหนด (name, semester, due_date, is_active, is_pinned)
submissions    — การส่งงาน (teacher_id, assignment_id, status, note, link_url)
accounts       — บัญชี admin/checker (username, password, role)
config         — ค่าตั้งค่าระบบ (key-value)
```

---

## การพัฒนาต่อในเครื่อง

```bash
# Clone repo ของคุณ
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env
cp .env.example .env
# แล้วแก้ไข .env ใส่ค่า Supabase ของคุณ

# รัน dev server
npm run dev
```

---

## License

MIT — ใช้งาน แก้ไข และเผยแพร่ได้อิสระ
