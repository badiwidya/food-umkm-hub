import { Building2, GraduationCap, IdCard } from 'lucide-react'

import { AuthButton } from '../components/auth-button'
import { AuthTextField } from '../components/auth-field'
import { AuthShell } from '../components/auth-shell'

export function RegisterStudentDetailsPage() {
  return (
    <AuthShell
      subtitle="Bergabung dengan IPB Food Hub"
      title="Buat Akun Mahasiswa"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <AuthTextField
            icon={<IdCard aria-hidden="true" className="size-5" />}
            label="NIM"
            placeholder="Masukkan NIM"
            required
            type="text"
          />
          <AuthTextField
            icon={<Building2 aria-hidden="true" className="size-5" />}
            label="Fakultas"
            placeholder="Masukkan fakultas"
            required
            type="text"
          />
          <AuthTextField
            icon={<GraduationCap aria-hidden="true" className="size-5" />}
            label="Departemen / Program Studi"
            placeholder="Masukkan departemen"
            required
            type="text"
          />
          <AuthButton>Daftar</AuthButton>
        </div>

        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
          Kolom bertanda <span className="font-medium text-red-600">*</span>{' '}
          wajib diisi sesuai data akademik mahasiswa.
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
