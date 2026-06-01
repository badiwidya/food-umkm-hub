import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

type ManagementFieldBaseProps = {
  error?: string
  icon: ReactNode
  label: string
}

type ManagementFormFieldProps = InputHTMLAttributes<HTMLInputElement> &
  ManagementFieldBaseProps

export function ManagementFormField({
  error,
  icon,
  label,
  ...inputProps
}: ManagementFormFieldProps) {
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
      {error ? <p className="text-sm leading-5 text-red-600">{error}</p> : null}
    </label>
  )
}

type ManagementSelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> &
  ManagementFieldBaseProps

export function ManagementSelectField({
  children,
  error,
  icon,
  label,
  ...selectProps
}: ManagementSelectFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-medium leading-5 text-slate-800">
        {label}
      </span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-3 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center text-slate-500">
          {icon}
        </span>
        <select
          className="min-h-[50px] w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-base leading-6 text-slate-900 outline-none transition focus:border-[#1e40af] focus:bg-white focus:ring-2 focus:ring-[#1e40af]/15"
          {...selectProps}
        >
          {children}
        </select>
      </span>
      {error ? <p className="text-sm leading-5 text-red-600">{error}</p> : null}
    </label>
  )
}

type ManagementTextareaFieldProps =
  TextareaHTMLAttributes<HTMLTextAreaElement> & ManagementFieldBaseProps

export function ManagementTextareaField({
  error,
  icon,
  label,
  ...textareaProps
}: ManagementTextareaFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-medium leading-5 text-slate-800">
        {label}
      </span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-3 top-4 flex size-5 items-center justify-center text-slate-500">
          {icon}
        </span>
        <textarea
          className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-base leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1e40af] focus:bg-white focus:ring-2 focus:ring-[#1e40af]/15"
          {...textareaProps}
        />
      </span>
      {error ? <p className="text-sm leading-5 text-red-600">{error}</p> : null}
    </label>
  )
}
