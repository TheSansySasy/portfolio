import type { ComponentPropsWithoutRef, ReactNode } from 'react'

type Variant = 'solid' | 'outline' | 'ghost'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] transition-colors duration-150 disabled:opacity-50'

const variants: Record<Variant, string> = {
  solid: 'bg-accent text-[#0a0a0b] hover:bg-accent-text hover:text-bg',
  outline: 'border border-line text-text hover:border-accent hover:text-accent-text',
  ghost: 'text-muted hover:text-text',
}

export function Button({
  children,
  variant = 'outline',
  className = '',
  ...rest
}: { children: ReactNode; variant?: Variant } & ComponentPropsWithoutRef<'button'>) {
  return (
    <button type="button" className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function ButtonLink({
  children,
  variant = 'outline',
  className = '',
  ...rest
}: { children: ReactNode; variant?: Variant } & ComponentPropsWithoutRef<'a'>) {
  return (
    <a className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </a>
  )
}
