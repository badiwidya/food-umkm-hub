import type {
  AdminDashboardSummary,
  AdminProduct,
  AdminReport,
  AdminReportStatus,
  AdminSeller,
  AdminStore,
  AdminVerificationStatus,
} from '../types'

const reports: AdminReport[] = [
  {
    id: 'RPT-1001',
    reporterName: 'Alya Putri',
    reporterRole: 'student',
    storeId: 'STR-1',
    storeName: 'Kantin Hijau IPB',
    orderNumber: 'ORD-1021',
    category: 'Pembayaran',
    status: 'new',
    priority: 'high',
    createdAt: '2026-06-01T08:40:00',
    chronology:
      'Pembeli sudah mengunggah bukti pembayaran, tetapi pesanan belum diproses oleh penjual.',
    evidenceUrl: null,
    adminNote: null,
    history: [
      {
        label: 'Laporan dibuat',
        date: '2026-06-01T08:40:00',
        note: 'Laporan masuk dari pembeli.',
      },
    ],
  },
  {
    id: 'RPT-1002',
    reporterName: 'Budi Santoso',
    reporterRole: 'seller',
    storeId: 'STR-2',
    storeName: 'Ayam Geprek FMIPA',
    orderNumber: 'ORD-1018',
    category: 'Pesanan',
    status: 'processing',
    priority: 'medium',
    createdAt: '2026-06-01T07:20:00',
    chronology:
      'Penjual melaporkan pembeli tidak mengambil pesanan sampai batas waktu.',
    evidenceUrl: null,
    adminNote: 'Sedang menunggu respon pembeli.',
    history: [
      {
        label: 'Laporan dibuat',
        date: '2026-06-01T07:20:00',
      },
      {
        label: 'Diproses admin',
        date: '2026-06-01T07:50:00',
        note: 'Admin menghubungi pembeli.',
      },
    ],
  },
  {
    id: 'RPT-1003',
    reporterName: 'Raka Pratama',
    reporterRole: 'student',
    storeId: 'STR-3',
    storeName: 'Roti Bakar Kampus',
    orderNumber: 'ORD-1009',
    category: 'Produk',
    status: 'resolved',
    priority: 'low',
    createdAt: '2026-05-31T16:12:00',
    chronology: 'Produk yang diterima tidak sesuai catatan pesanan.',
    evidenceUrl: null,
    adminNote: 'Laporan selesai. Penjual sudah memberi kompensasi.',
    history: [
      {
        label: 'Laporan dibuat',
        date: '2026-05-31T16:12:00',
      },
      {
        label: 'Selesai',
        date: '2026-05-31T17:10:00',
        note: 'Masalah berhasil diselesaikan.',
      },
    ],
  },
]

const stores: AdminStore[] = [
  {
    id: 'STR-1',
    name: 'Kantin Hijau IPB',
    ownerName: 'Budi Santoso',
    ownerEmail: 'budi@example.com',
    ownerPhone: '081234567890',
    location: 'Area Kantin FMIPA IPB',
    category: 'Makanan berat',
    openTime: '08:00',
    closeTime: '17:00',
    activeStatus: 'active',
    verificationStatus: 'pending',
    productCount: 12,
    orderCount: 64,
    description: 'UMKM makanan kampus dengan menu cepat saji untuk mahasiswa.',
  },
  {
    id: 'STR-2',
    name: 'Ayam Geprek FMIPA',
    ownerName: 'Siti Aminah',
    ownerEmail: 'siti@example.com',
    ownerPhone: '081987654321',
    location: 'Dekat Gedung FMIPA',
    category: 'Ayam geprek',
    openTime: '09:00',
    closeTime: '18:00',
    activeStatus: 'active',
    verificationStatus: 'verified',
    productCount: 8,
    orderCount: 92,
    description: 'Menu ayam geprek dan minuman untuk mahasiswa.',
  },
  {
    id: 'STR-3',
    name: 'Roti Bakar Kampus',
    ownerName: 'Dimas Putra',
    ownerEmail: 'dimas@example.com',
    ownerPhone: '082112223333',
    location: 'Area kantin asrama',
    category: 'Camilan',
    openTime: '10:00',
    closeTime: '21:00',
    activeStatus: 'inactive',
    verificationStatus: 'rejected',
    productCount: 5,
    orderCount: 18,
    description: 'Roti bakar, pisang bakar, dan minuman ringan.',
  },
]

const sellers: AdminSeller[] = [
  {
    id: 'SEL-1',
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '081234567890',
    storeName: 'Kantin Hijau IPB',
    registeredAt: '2026-05-28T09:00:00',
    accountStatus: 'pending',
    verificationStatus: 'pending',
  },
  {
    id: 'SEL-2',
    name: 'Siti Aminah',
    email: 'siti@example.com',
    phone: '081987654321',
    storeName: 'Ayam Geprek FMIPA',
    registeredAt: '2026-05-25T13:30:00',
    accountStatus: 'active',
    verificationStatus: 'verified',
  },
]

const products: AdminProduct[] = [
  {
    id: 'PRD-1',
    name: 'Nasi Ayam Geprek',
    storeId: 'STR-1',
    storeName: 'Kantin Hijau IPB',
    price: 18000,
    category: 'Makanan berat',
    isAvailable: true,
    isActive: true,
  },
  {
    id: 'PRD-2',
    name: 'Es Teh Manis',
    storeId: 'STR-1',
    storeName: 'Kantin Hijau IPB',
    price: 8000,
    category: 'Minuman',
    isAvailable: true,
    isActive: true,
  },
  {
    id: 'PRD-3',
    name: 'Roti Bakar Coklat',
    storeId: 'STR-3',
    storeName: 'Roti Bakar Kampus',
    price: 15000,
    category: 'Camilan',
    isAvailable: false,
    isActive: true,
  },
]

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T
}

export async function getAdminDashboard(): Promise<AdminDashboardSummary> {
  return clone({
    totalReports: reports.length,
    newReports: reports.filter((report) => report.status === 'new').length,
    processingReports: reports.filter((report) =>
      ['processing', 'waiting_response'].includes(report.status),
    ).length,
    resolvedReports: reports.filter((report) => report.status === 'resolved')
      .length,
    activeStores: stores.filter((store) => store.activeStatus === 'active')
      .length,
    inactiveStores: stores.filter((store) => store.activeStatus === 'inactive')
      .length,
    pendingStoreVerification: stores.filter(
      (store) => store.verificationStatus === 'pending',
    ).length,
    pendingSellerVerification: sellers.filter(
      (seller) => seller.verificationStatus === 'pending',
    ).length,
  })
}

export async function getAdminReports(): Promise<AdminReport[]> {
  return clone(reports)
}

export async function getAdminReportById(
  reportId: string,
): Promise<AdminReport | null> {
  return clone(reports.find((report) => report.id === reportId) ?? null)
}

export async function getAdminStores(): Promise<AdminStore[]> {
  return clone(stores)
}

export async function getAdminStoreById(
  storeId: string,
): Promise<AdminStore | null> {
  return clone(stores.find((store) => store.id === storeId) ?? null)
}

export async function getAdminSellers(): Promise<AdminSeller[]> {
  return clone(sellers)
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  return clone(products)
}

export async function getAdminProductsByStore(
  storeId: string,
): Promise<AdminProduct[]> {
  return clone(products.filter((product) => product.storeId === storeId))
}

export async function getAdminReportsByStore(
  storeId: string,
): Promise<AdminReport[]> {
  return clone(reports.filter((report) => report.storeId === storeId))
}

export async function updateReportStatus(
  reportId: string,
  status: AdminReportStatus,
): Promise<{ reportId: string; status: AdminReportStatus }> {
  return { reportId, status }
}

export async function updateStoreVerification(
  storeId: string,
  status: AdminVerificationStatus,
): Promise<{ storeId: string; status: AdminVerificationStatus }> {
  return { storeId, status }
}

export async function updateSellerVerification(
  sellerId: string,
  status: AdminVerificationStatus,
): Promise<{ sellerId: string; status: AdminVerificationStatus }> {
  return { sellerId, status }
}
