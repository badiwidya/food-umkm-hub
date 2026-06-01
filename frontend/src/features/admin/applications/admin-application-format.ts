import type { StoreApprovalStatus, UserStatus } from '../../../client'

export function formatApplicationStatus(status: StoreApprovalStatus) {
  if (status === 'approved') {
    return 'Disetujui'
  }

  if (status === 'rejected') {
    return 'Ditolak'
  }

  return 'Pending'
}

export function getApplicationStatusClassName(status: StoreApprovalStatus) {
  if (status === 'approved') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (status === 'rejected') {
    return 'bg-red-50 text-red-700'
  }

  return 'bg-amber-50 text-amber-700'
}

export function formatUserStatus(status: UserStatus) {
  if (status === 'active') {
    return 'Aktif'
  }

  if (status === 'suspended') {
    return 'Ditangguhkan'
  }

  return 'Tidak aktif'
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
