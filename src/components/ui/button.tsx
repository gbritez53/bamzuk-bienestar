import { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-md',
  outline:
    'border border-border text-foreground bg-transparent hover:bg-muted hover:border-primary/30',
  ghost: 'text-muted-foreground bg-transparent hover:bg-muted hover:text-foreground',
  destructive:
    'bg-destructive text-white hover:bg-red-700',
}

export function Button({
  variant = 'default',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
