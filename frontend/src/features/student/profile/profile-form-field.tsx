import type { InputHTMLAttributes, ReactNode } from 'react'

type ProfileFormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string
  helperText?: string
  icon: ReactNode
  label: string
}

export function ProfileFormField({
  error,
  helperText,
  icon,
  label,
  ...inputProps
}: ProfileFormFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-medium leading-5 text-slate-800">
        {label}
      </span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-3 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center text-slate-500">
          {icon}
        </span>
        <input
          className="min-h-[50px] w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-base leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1e40af] focus:bg-white focus:ring-2 focus:ring-[#1e40af]/15"
          {...inputProps}
        />
      </span>
      {helperText ? (
        <p className="text-xs leading-4 text-slate-500">{helperText}</p>
      ) : null}
      {error ? <p className="text-sm leading-5 text-red-600">{error}</p> : null}
    </label>
  )
}
