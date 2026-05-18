import Swal from 'sweetalert2'

const base = Swal.mixin({
  confirmButtonColor: '#1d4ed8',
  cancelButtonColor:  '#6b7280',
  reverseButtons: true,
  customClass: { popup: 'font-sarabun' },
})

export const swal = {
  success: (title, text = '') =>
    base.fire({ icon: 'success', title, text, timer: 2000, showConfirmButton: false }),

  error: (title, text = '') =>
    base.fire({ icon: 'error', title, text }),

  confirm: (title, text = '', confirmText = 'ยืนยัน') =>
    base.fire({
      icon: 'warning', title, text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'ยกเลิก',
    }),

  confirmDanger: (title, text = '') =>
    base.fire({
      icon: 'warning', title, text,
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'ยกเลิก',
    }),

  warning: (title, text = '') =>
    base.fire({ icon: 'warning', title, text }),

  loading: (title = 'กำลังดำเนินการ...') =>
    Swal.fire({ title, allowOutsideClick: false, didOpen: () => Swal.showLoading() }),

  close: () => Swal.close(),
}
