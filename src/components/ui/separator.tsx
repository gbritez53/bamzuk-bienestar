import { HTMLAttributes } from 'react'

interface SeparatorProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical'
}

export function Separator({ orientation = 'horizontal', className = '', ...props }: SeparatorProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={['h-full w-px bg-gray-200', className].filter(Boolean).join(' ')}
        role="separator"
        aria-orientation="vertical"
      />
    )
  }

  return (
    <hr
      className={['border-t border-gray-200', className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}
