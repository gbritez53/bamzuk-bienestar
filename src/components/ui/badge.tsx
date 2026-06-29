import { HTMLAttributes } from 'react'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

export function Badge({ children, className = '', ...props }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center justify-center min-w-5 h-5 px-1.5',
        'text-[10px] font-bold leading-none rounded-full',
        'bg-primary text-primary-foreground',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </span>
  )
}
