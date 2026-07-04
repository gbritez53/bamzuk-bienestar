import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LanguageSwitcher from '../LanguageSwitcher'

const mockUsePathname = vi.fn()
const mockUseSearchParams = vi.fn()

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
    'aria-label': ariaLabel,
    'aria-current': ariaCurrent,
  }: {
    href: string
    children: React.ReactNode
    className?: string
    'aria-label'?: string
    'aria-current'?: 'true' | false
  }) => (
    <a href={href} className={className} aria-label={ariaLabel} aria-current={ariaCurrent}>
      {children}
    </a>
  ),
}))

describe('LanguageSwitcher', () => {
  it('renderiza un link para cada locale (es y pt)', () => {
    mockUsePathname.mockReturnValue('/es/productos')
    mockUseSearchParams.mockReturnValue(new URLSearchParams())
    render(<LanguageSwitcher />)
    expect(screen.getByRole('link', { name: /^es$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^pt$/i })).toBeInTheDocument()
  })

  it('marca el locale actual con aria-current', () => {
    mockUsePathname.mockReturnValue('/es/productos')
    mockUseSearchParams.mockReturnValue(new URLSearchParams())
    render(<LanguageSwitcher />)
    expect(screen.getByRole('link', { name: /^es$/i })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('link', { name: /^pt$/i })).not.toHaveAttribute('aria-current')
  })

  it('el link a pt reemplaza el segmento de locale preservando el resto del path', () => {
    mockUsePathname.mockReturnValue('/es/productos/5227')
    mockUseSearchParams.mockReturnValue(new URLSearchParams())
    render(<LanguageSwitcher />)
    expect(screen.getByRole('link', { name: /^pt$/i })).toHaveAttribute(
      'href',
      '/pt/productos/5227',
    )
  })

  it('preserva los query params al cambiar de idioma', () => {
    mockUsePathname.mockReturnValue('/es/productos')
    mockUseSearchParams.mockReturnValue(new URLSearchParams('page=2'))
    render(<LanguageSwitcher />)
    expect(screen.getByRole('link', { name: /^pt$/i })).toHaveAttribute(
      'href',
      '/pt/productos?page=2',
    )
  })
})
