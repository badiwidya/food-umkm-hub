export type AdminReportStatus =
  | 'new'
  | 'processing'
  | 'waiting_response'
  | 'resolved'
  | 'rejected'

export type AdminReportPriority = 'low' | 'medium' | 'high'

export type AdminReporterRole = 'student' | 'seller'

export type AdminVerificationStatus = 'pending' | 'verified' | 'rejected'

export type AdminStoreActiveStatus = 'active' | 'inactive'

export type AdminReport = {
  id: string
  reporterName: string
  reporterRole: AdminReporterRole
  storeId: string
  storeName: string
  orderNumber: string
  category: string
  status: AdminReportStatus
  priority: AdminReportPriority
  createdAt: string
  chronology: string
  evidenceUrl?: string | null
  adminNote?: string | null
  history: {
    label: string
    date: string
    note?: string
  }[]
}

export type AdminStore = {
  id: string
  name: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  location: string
  category: string
  openTime: string
  closeTime: string
  activeStatus: AdminStoreActiveStatus
  verificationStatus: AdminVerificationStatus
  productCount: number
  orderCount: number
  description: string
}

export type AdminSeller = {
  id: string
  name: string
  email: string
  phone: string
  storeName: string
  registeredAt: string
  accountStatus: 'active' | 'inactive' | 'pending'
  verificationStatus: AdminVerificationStatus
}

export type AdminProduct = {
  id: string
  name: string
  storeId: string
  storeName: string
  price: number
  category: string
  isAvailable: boolean
  isActive: boolean
}

export type AdminDashboardSummary = {
  totalReports: number
  newReports: number
  processingReports: number
  resolvedReports: number
  activeStores: number
  inactiveStores: number
  pendingStoreVerification: number
  pendingSellerVerification: number
}
