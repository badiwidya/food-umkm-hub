import { FileText, Link, MapPin, Store } from 'lucide-react'

import { AuthButton } from '../components/auth-button'
import { AuthTextField } from '../components/auth-field'
import { AuthShell } from '../components/auth-shell'

export function RegisterSellerDetailsPage() {
  return (
    <AuthShell subtitle="Bergabung dengan IPB Food Hub" title="Buat Toko">
      <div className="space-y-6">
        <div className="space-y-4">
          <AuthTextField
            icon={<Store aria-hidden="true" className="size-5" />}
            label="Nama Toko"
            placeholder="Masukkan nama toko"
            required
            type="text"
          />
          <AuthTextField
            icon={<FileText aria-hidden="true" className="size-5" />}
            label="Deskripsi Toko"
            placeholder="Masukkan deskripsi toko"
            required
            type="text"
          />
          <AuthTextField
            icon={<MapPin aria-hidden="true" className="size-5" />}
            label="Alamat Toko"
            placeholder="Masukkan alamat toko"
            required
            type="text"
          />
          <AuthTextField
            icon={<Link aria-hidden="true" className="size-5" />}
            label="Link Google Maps"
            placeholder="Google Maps"
            type="url"
          />
          <AuthButton>Daftar</AuthButton>
        </div>

        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
          Kolom bertanda <span className="font-medium text-red-600">*</span>{' '}
          wajib diisi. Foto toko dan QRIS tidak digunakan pada iterasi ini.
        </p>

        <p className="text-center text-sm leading-5 text-slate-500">
          Sudah punya akun?{' '}
          <a className="text-[#1e40af] hover:underline" href="/login">
            Masuk sekarang
          </a>
        </p>
      </div>
    </AuthShell>
  )
}
