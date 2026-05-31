import type { ReactNode } from 'react'

type RequiredLabelProps = {
  children: ReactNode
  required?: boolean
}

export function RequiredLabel({ children, required }: RequiredLabelProps) {
  return (
    <span className="block text-sm font-medium leading-5 text-slate-800">
      {children}
      {required ? (
        <span aria-label="wajib diisi" className="ml-1 text-red-600">
          *
        </span>
      ) : null}
    </span>
  )
}
