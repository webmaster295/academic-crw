import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Map helpers (snake_case DB → camelCase frontend) ──

function mapTeacher(t) {
  return {
    id:           t.id,
    teacherId:    t.teacher_id,
    fullName:     t.full_name,
    citizenId:    t.citizen_id   || '',
    categoryName: t.category_name || '',
    imgurl:       t.img_url       || '',
  }
}

function mapAssignment(a) {
  return {
    id:            a.id,
    name:          a.name,
    description:   a.description   || '',
    semester:      a.semester       || '',
    academic_year: a.academic_year  || '',
    due_date:      a.due_date       || '',
    is_active:     a.is_active,
    is_visible:    a.is_visible  !== false,  // default true
    is_pinned:     a.is_pinned   === true,
    sort_order:    a.sort_order  ?? 0,
  }
}

// ── API ───────────────────────────────────────────────

export const api = {

  // ── Config ────────────────────────────────────────
  async getConfig() {
    const { data } = await supabase.from('config').select('*')
    return Object.fromEntries((data || []).map(r => [r.key, r.value]))
  },

  async updateConfig(obj) {
    const rows = Object.entries(obj).map(([key, value]) => ({ key, value: String(value ?? '') }))
    const { error } = await supabase.from('config').upsert(rows, { onConflict: 'key' })
    if (error) throw error
    return { success: true }
  },

  // ── Teachers ──────────────────────────────────────
  async getTeachers() {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('category_name')
      .order('full_name')
    if (error) throw error
    return (data || []).map(mapTeacher)
  },

  async saveTeacher(t) {
    const record = {
      teacher_id:    t.teacherId,
      full_name:     t.fullName,
      citizen_id:    t.citizenId    || '',
      category_name: t.categoryName || '',
      img_url:       t.imgurl       || '',
    }
    let error
    if (t.id) {
      // แก้ไข: update by numeric id → เปลี่ยน teacher_id / citizen_id ได้โดยประวัติงานไม่หาย
      ;({ error } = await supabase.from('teachers').update(record).eq('id', t.id))
    } else {
      // เพิ่มใหม่ หรือ import Excel (ไม่มี id) → upsert by teacher_id
      ;({ error } = await supabase.from('teachers').upsert(record, { onConflict: 'teacher_id' }))
    }
    if (error) throw error
    return { success: true }
  },

  async deleteTeacher(teacherId) {
    const { error } = await supabase.from('teachers').delete().eq('teacher_id', teacherId)
    if (error) throw error
    return { success: true }
  },

  // ── Assignments ───────────────────────────────────
  async getAssignments(params = {}) {
    let q = supabase.from('assignments').select('*')
      .order('is_pinned',  { ascending: false })
      .order('sort_order', { ascending: true })
      .order('id',         { ascending: false })
    if (params.active === true || params.active === 'true') q = q.eq('is_active', true)
    const { data, error } = await q
    if (error) throw error
    return (data || []).map(mapAssignment)
  },

  async updateSortOrders(items) {
    // items: [{ id, sort_order }]
    await Promise.all(
      items.map(({ id, sort_order }) =>
        supabase.from('assignments').update({ sort_order }).eq('id', id)
      )
    )
    return { success: true }
  },

  async saveAssignment(a) {
    const record = {
      name:          a.name,
      description:   a.description   || '',
      semester:      a.semester       || '',
      academic_year: a.academic_year  || '',
      due_date:      a.due_date       || '',
      is_active:     a.is_active  === true || a.is_active  === 'TRUE',
      is_visible:    a.is_visible !== false,
      is_pinned:     a.is_pinned  === true,
      sort_order:    Number(a.sort_order) || 0,
    }
    let error
    if (a.id) {
      ;({ error } = await supabase.from('assignments').update(record).eq('id', a.id))
    } else {
      ;({ error } = await supabase.from('assignments').insert(record))
    }
    if (error) throw error
    return { success: true }
  },

  async deleteAssignment(id) {
    const { error } = await supabase.from('assignments').delete().eq('id', id)
    if (error) throw error
    return { success: true }
  },

  // ── Dashboard ─────────────────────────────────────
  // คืน { teachers: [...], stats: {...} }
  async getDashboard(assignmentId) {
    const [{ data: teachers }, { data: subs }] = await Promise.all([
      supabase.from('teachers').select('*').order('category_name').order('full_name'),
      supabase.from('submissions').select('*').eq('assignment_id', assignmentId),
    ])

    const subsMap = {}
    for (const s of (subs || [])) subsMap[s.teacher_id] = s

    const rows = (teachers || []).map(t => {
      const sub = subsMap[t.id] || null
      return {
        id:           t.id,
        teacherId:    t.teacher_id,
        fullName:     t.full_name,
        categoryName: t.category_name || '',
        imgurl:       t.img_url || '',
        status:       sub ? sub.status : 'ยังไม่ส่ง',
        submittedAt:  sub ? sub.submitted_at : null,
        note:         sub ? sub.note : '',
        linkUrl:      sub ? sub.link_url : '',
        linkTitle:    sub ? sub.link_title : '',
        submissionId: sub ? sub.id : null,
      }
    })

    const stats = {
      total:    rows.length,
      submitted: rows.filter(r => r.status !== 'ยังไม่ส่ง').length,
      approved:  rows.filter(r => r.status === 'ส่งเรียบร้อย').length,
      pending:   rows.filter(r => r.status === 'รอตรวจสอบ').length,
      rejected:  rows.filter(r => r.status === 'ไม่ผ่าน').length,
      revision:  rows.filter(r => r.status === 'ขอแก้ไข').length,
    }

    return { teachers: rows, stats }
  },

  // ── Report ────────────────────────────────────────
  // คืนแถวครูทุกคน + สถานะสำหรับงานที่เลือก
  async getReport({ assignmentId }) {
    const [{ data: teachers }, { data: subs }] = await Promise.all([
      supabase.from('teachers').select('*').order('category_name').order('full_name'),
      supabase.from('submissions').select('*').eq('assignment_id', assignmentId),
    ])

    const subsMap = {}
    for (const s of (subs || [])) subsMap[s.teacher_id] = s

    return (teachers || []).map(t => {
      const sub = subsMap[t.id] || null
      return {
        teacherId:    t.teacher_id,
        fullName:     t.full_name,
        categoryName: t.category_name || '',
        imgurl:       t.img_url || '',
        status:       sub ? sub.status : 'ยังไม่ส่ง',
        submittedAt:  sub ? sub.submitted_at : null,
        note:         sub ? sub.note : '',
      }
    })
  },

  // ── Ranking ───────────────────────────────────────
  async getRanking() {
    const [{ data: teachers }, { data: subs }, { data: assignments }] = await Promise.all([
      supabase.from('teachers').select('*'),
      supabase.from('submissions').select('*').eq('status', 'ส่งเรียบร้อย'),
      supabase.from('assignments').select('id').eq('is_active', true),
    ])

    const totalCount = (assignments || []).length
    const subsMap = {}
    for (const s of (subs || [])) {
      if (!subsMap[s.teacher_id]) subsMap[s.teacher_id] = []
      subsMap[s.teacher_id].push(s)
    }

    const sorted = (teachers || [])
      .map(t => {
        const ts = subsMap[t.id] || []
        const approvedCount = ts.length
        const firstSubmitMs = ts.length
          ? Math.min(...ts.map(s => new Date(s.submitted_at).getTime()))
          : Infinity
        return {
          teacherId:      t.teacher_id,
          fullName:       t.full_name,
          categoryName:   t.category_name || '',
          imgurl:         t.img_url || '',
          approvedCount,
          firstSubmitMs,
          completionRate: totalCount ? Math.round((approvedCount / totalCount) * 100) : 0,
        }
      })
      .filter(r => r.approvedCount > 0)
      .sort((a, b) => b.approvedCount - a.approvedCount || a.firstSubmitMs - b.firstSubmitMs)
      .map((t, i) => ({ ...t, rank: i + 1 }))

    return { teachers: sorted, totalAssignments: totalCount }
  },

  // ── My Submissions (ใช้ numeric teacher id) ────────
  async getMySubmissions(numericTeacherId) {
    const { data, error } = await supabase
      .from('submissions')
      .select('assignment_id, status, submitted_at, note')
      .eq('teacher_id', numericTeacherId)
    if (error) throw error
    return data || []
  },

  // ── Submissions ───────────────────────────────────
  async saveSubmission({ teacher_id, assignment_id, status, note, link_url, link_title }) {
    const tid = Number(teacher_id)
    const aid = Number(assignment_id)

    const { data: existing } = await supabase
      .from('submissions')
      .select('id')
      .eq('teacher_id', tid)
      .eq('assignment_id', aid)
      .maybeSingle()

    const now = new Date().toISOString()

    // ลอง save พร้อม link ก่อน ถ้าคอลัมน์ยังไม่มีให้ fallback โดยไม่มี link
    const tryUpdate = async (withLink) => {
      const payload = withLink
        ? { status: status || 'รอตรวจสอบ', note: note || '', link_url: link_url || '', link_title: link_title || '', updated_at: now }
        : { status: status || 'รอตรวจสอบ', note: note || '', updated_at: now }
      return supabase.from('submissions')[existing ? 'update' : 'insert'](
        existing
          ? payload
          : { teacher_id: tid, assignment_id: aid, submitted_at: now, ...payload }
      )[existing ? 'eq' : 'select'](...(existing ? ['id', existing.id] : []))
    }

    // สำหรับ existing record ใช้ update; ไม่มีให้ insert
    if (existing) {
      let { error } = await supabase.from('submissions')
        .update({ status: status || 'รอตรวจสอบ', note: note || '', link_url: link_url || '', link_title: link_title || '', updated_at: now })
        .eq('id', existing.id)
      if (error?.message?.includes('link')) {
        // fallback ถ้า column ยังไม่มี
        ;({ error } = await supabase.from('submissions')
          .update({ status: status || 'รอตรวจสอบ', note: note || '', updated_at: now })
          .eq('id', existing.id))
      }
      if (error) throw error
    } else {
      let { error } = await supabase.from('submissions').insert({
        teacher_id: tid, assignment_id: aid, status: status || 'รอตรวจสอบ',
        note: note || '', link_url: link_url || '', link_title: link_title || '',
        submitted_at: now, updated_at: now,
      })
      if (error?.message?.includes('link')) {
        // fallback ถ้า column ยังไม่มี
        ;({ error } = await supabase.from('submissions').insert({
          teacher_id: tid, assignment_id: aid, status: status || 'รอตรวจสอบ',
          note: note || '', submitted_at: now, updated_at: now,
        }))
      }
      if (error) throw error
    }
    return { success: true }
  },

  async clearSubmissions({ assignment_id }) {
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('assignment_id', Number(assignment_id))
    if (error) throw error
    return { success: true }
  },

  // ── Accounts ──────────────────────────────────────
  async getAccounts() {
    const { data, error } = await supabase
      .from('accounts')
      .select('id, full_name, username, role, is_active')
      .order('id')
    if (error) throw error
    return data || []
  },

  async saveAccount(a) {
    const record = {
      full_name: a.full_name || '',
      username:  a.username,
      role:      a.role || 'checker',
      is_active: a.is_active === true || a.is_active === 'TRUE',
    }
    if (a.password) record.password = a.password

    let error
    if (a.id) {
      ;({ error } = await supabase.from('accounts').update(record).eq('id', a.id))
    } else {
      if (!record.password) throw new Error('กรุณากรอกรหัสผ่าน')
      ;({ error } = await supabase.from('accounts').insert(record))
    }
    if (error) throw error
    return { success: true }
  },

  // ── Login ─────────────────────────────────────────
  async login({ role, username, password }) {
    if (role === 'teacher') {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('teacher_id', username)
        .eq('citizen_id', password)
        .maybeSingle()
      if (error || !data) return { success: false, message: 'รหัสครูหรือรหัสผ่านไม่ถูกต้อง' }
      return {
        success: true,
        role:    'teacher',
        user:    mapTeacher(data),
      }
    } else {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .eq('is_active', true)
        .maybeSingle()
      if (error || !data) return { success: false, message: 'username หรือรหัสผ่านไม่ถูกต้อง' }
      return {
        success: true,
        role:    data.role,
        user:    { id: data.id, fullName: data.full_name, username: data.username, role: data.role },
      }
    }
  },
}
