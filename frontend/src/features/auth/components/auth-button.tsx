import type { ButtonHTMLAttributes } from 'react'

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export function AuthButton({
  className,
  type = 'button',
  ...props
}: AuthButtonProps) {
  return (
    <button
      className={[
        'min-h-12 w-full appearance-none rounded-lg border border-transparent bg-[#1e40af] px-4 py-3 text-center text-base font-medium leading-6 text-white transition hover:bg-[#1d3a9c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e40af] disabled:cursor-not-allowed disabled:opacity-60',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      type={type}
      {...props}
    />
  )
}
