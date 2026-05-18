import * as XLSX from 'xlsx'

export function exportSubmissions(teachers, assignmentName, config = {}) {
  const rows = teachers.map((t, i) => ({
    'ลำดับ':           i + 1,
    'รหัสครู':         t.teacherId,
    'ชื่อ-สกุล':       t.fullName,
    'กลุ่มสาระ':       t.categoryName,
    'สถานะ':           t.status || 'ยังไม่ส่ง',
    'ชื่อหัวข้อที่ส่ง': t.linkTitle || '',
    'ลิงค์ไฟล์':       t.linkUrl   || '',
    'หมายเหตุ':        t.note      || '',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)

  // ปรับความกว้างคอลัมน์
  ws['!cols'] = [
    { wch: 6 }, { wch: 10 }, { wch: 30 }, { wch: 28 },
    { wch: 16 }, { wch: 30 }, { wch: 50 }, { wch: 30 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'ผลการส่งงาน')

  // sheet สรุป
  const summary = [
    ['รายงานผลการส่งงาน'],
    [`งาน: ${assignmentName}`],
    [`โรงเรียน: ${config.school_name || ''}`],
    [`ภาคเรียนที่ ${config.semester || ''} ปีการศึกษา ${config.academic_year || ''}`],
    [],
    ['สถิติ', ''],
    ['ทั้งหมด',      rows.length],
    ['ส่งเรียบร้อย', rows.filter(r => r['สถานะ'] === 'ส่งเรียบร้อย').length],
    ['รอตรวจสอบ',   rows.filter(r => r['สถานะ'] === 'รอตรวจสอบ').length],
    ['ขอแก้ไข',     rows.filter(r => r['สถานะ'] === 'ขอแก้ไข').length],
    ['ไม่ผ่าน',     rows.filter(r => r['สถานะ'] === 'ไม่ผ่าน').length],
    ['ยังไม่ส่ง',   rows.filter(r => r['สถานะ'] === 'ยังไม่ส่ง').length],
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(summary)
  ws2['!cols'] = [{ wch: 20 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'สรุป')

  const fileName = `ผลการส่งงาน_${assignmentName}_${new Date().toLocaleDateString('th-TH').replace(/\//g, '-')}.xlsx`
  XLSX.writeFile(wb, fileName)
}
