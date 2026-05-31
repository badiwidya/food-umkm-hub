import type {
  SellerDashboardSummary,
  SellerOrder,
  SellerProduct,
  SellerStoreProfile,
} from '../types'

const orders: SellerOrder[] = [
  {
    id: 'ORD-1021',
    buyerName: 'Alya Putri',
    orderedAt: '2026-06-01T08:45:00',
    status: 'waiting_verification',
    paymentMethod: 'qris',
    total: 28000,
    senderName: 'Alya Putri',
    uploadedAt: '2026-06-01T08:52:00',
    paymentProofUrl: null,
    items: [
      {
        id: 'item-1',
        productName: 'Nasi Ayam Geprek',
        quantity: 1,
        price: 18000,
      },
      {
        id: 'item-2',
        productName: 'Es Teh Manis',
        quantity: 1,
        price: 10000,
      },
    ],
  },
  {
    id: 'ORD-1020',
    buyerName: 'Raka Pratama',
    orderedAt: '2026-06-01T08:20:00',
    status: 'processing',
    paymentMethod: 'cod',
    total: 22000,
    items: [
      {
        id: 'item-3',
        productName: 'Mie Ayam Bakso',
        quantity: 1,
        price: 22000,
      },
    ],
  },
  {
    id: 'ORD-1019',
    buyerName: 'Nabila Zahra',
    orderedAt: '2026-06-01T07:55:00',
    status: 'pending_payment',
    paymentMethod: 'transfer',
    total: 15000,
    items: [
      {
        id: 'item-4',
        productName: 'Roti Bakar Coklat',
        quantity: 1,
        price: 15000,
      },
    ],
  },
]

const products: SellerProduct[] = [
  {
    id: 'PRD-1',
    name: 'Nasi Ayam Geprek',
    description: 'Nasi hangat, ayam crispy, sambal pedas, dan lalapan.',
    category: 'Makanan berat',
    price: 18000,
    isAvailable: true,
    isActive: true,
    estimatedMinutes: 12,
    imageUrl: null,
  },
  {
    id: 'PRD-2',
    name: 'Mie Ayam Bakso',
    description: 'Mie ayam dengan topping bakso dan pangsit.',
    category: 'Makanan berat',
    price: 22000,
    isAvailable: true,
    isActive: true,
    estimatedMinutes: 10,
    imageUrl: null,
  },
  {
    id: 'PRD-3',
    name: 'Es Teh Manis',
    description: 'Minuman teh manis dingin.',
    category: 'Minuman',
    price: 10000,
    isAvailable: true,
    isActive: true,
    estimatedMinutes: 3,
    imageUrl: null,
  },
]

const profile: SellerStoreProfile = {
  storeName: 'Kantin Hijau IPB',
  ownerName: 'Budi Santoso',
  description: 'UMKM makanan kampus dengan menu cepat saji untuk mahasiswa.',
  location: 'Area kantin FMIPA IPB',
  openTime: '08:00',
  closeTime: '17:00',
  isOpen: true,
  verificationStatus: 'pending',
  bankName: 'BRI',
  bankAccountNumber: '1234567890',
  bankAccountOwner: 'Budi Santoso',
  qrisUrl: null,
  paymentInstruction:
    'Transfer sesuai total pesanan, lalu unggah bukti pembayaran.',
}

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T
}

export async function getSellerDashboard(): Promise<SellerDashboardSummary> {
  const completedOrders = orders.filter((order) => order.status === 'completed')
  const processingOrders = orders.filter(
    (order) => order.status === 'processing' || order.status === 'ready',
  )
  const waitingVerification = orders.filter(
    (order) => order.status === 'waiting_verification',
  )

  return clone({
    totalOrdersToday: orders.length,
    processingOrders: processingOrders.length,
    waitingVerification: waitingVerification.length,
    completedOrders: completedOrders.length,
    revenueToday: orders
      .filter((order) => order.status !== 'rejected')
      .reduce((total, order) => total + order.total, 0),
    topProducts: [
      { name: 'Nasi Ayam Geprek', sold: 18 },
      { name: 'Mie Ayam Bakso', sold: 12 },
      { name: 'Es Teh Manis', sold: 10 },
    ],
    dailyRevenue: [
      { day: 'Sen', revenue: 125000, orders: 8 },
      { day: 'Sel', revenue: 148000, orders: 10 },
      { day: 'Rab', revenue: 98000, orders: 6 },
      { day: 'Kam', revenue: 176000, orders: 12 },
      { day: 'Jum', revenue: 210000, orders: 14 },
    ],
    store: {
      isOpen: profile.isOpen,
      verificationStatus: profile.verificationStatus,
    },
  })
}

export async function getSellerOrders(): Promise<SellerOrder[]> {
  return clone(orders)
}

export async function getSellerProducts(): Promise<SellerProduct[]> {
  return clone(products)
}

export async function getSellerProfile(): Promise<SellerStoreProfile> {
  return clone(profile)
}