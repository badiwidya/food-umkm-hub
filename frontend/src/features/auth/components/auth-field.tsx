import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

import { RequiredLabel } from './required-label'

type AuthTextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode
  label: string
  required?: boolean
}

export function AuthTextField({
  icon,
  label,
  required,
  ...inputProps
}: AuthTextFieldProps) {
  return (
    <label className="block space-y-2">
      <RequiredLabel required={required}>{label}</RequiredLabel>
      <span className="relative block">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center text-slate-500">
            {icon}
          </span>
        ) : null}
        <input
          className="min-h-[50px] w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1e40af] focus:bg-white focus:ring-2 focus:ring-[#1e40af]/15"
          {...inputProps}
        />
      </span>
    </label>
  )
}

type AuthPasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  icon?: ReactNode
  label: string
  required?: boolean
}

export function AuthPasswordField({
  icon,
  label,
  required,
  ...inputProps
}: AuthPasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <label className="block space-y-2">
      <RequiredLabel required={required}>{label}</RequiredLabel>
      <span className="relative block">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center text-slate-500">
            {icon}
          </span>
        ) : null}
        <input
          className="min-h-[50px] w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1e40af] focus:bg-white focus:ring-2 focus:ring-[#1e40af]/15"
          type={isVisible ? 'text' : 'password'}
          {...inputProps}
        />
        <button
          aria-label={isVisible ? 'Sembunyikan password' : 'Tampilkan password'}
          className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e40af]"
          onClick={() => setIsVisible((value) => !value)}
          type="button"
        >
          {isVisible ? (
            <EyeOff aria-hidden="true" className="size-5" />
          ) : (
            <Eye aria-hidden="true" className="size-5" />
          )}
        </button>
      </span>
    </label>
  )
}
