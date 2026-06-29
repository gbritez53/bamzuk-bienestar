import { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-black text-white hover:opacity-90',
  outline: 'border border-gray-300 text-gray-900 bg-transparent hover:bg-gray-50',
  ghost: 'text-gray-700 bg-transparent hover:bg-gray-100',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
}

export function Button({ variant = 'default', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
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
