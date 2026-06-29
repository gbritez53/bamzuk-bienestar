import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Footer from '@/components/layout/Footer'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'es' }),
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

describe('Footer', () => {
  it('shows the current year', () => {
    render(<Footer />)
    // Year is inside © 2026 Mi Tienda — use a function matcher
    expect(
      screen.getByText((content) => content.includes(new Date().getFullYear().toString())),
    ).toBeInTheDocument()
  })

  it('shows the site name', () => {
    render(<Footer />)
    expect(screen.getByText('Mi Tienda')).toBeInTheDocument()
  })

  it('has a link to /es/aviso-legal', () => {
    render(<Footer />)
    const link = screen.getByText('avisoLegal').closest('a')
    expect(link).toHaveAttribute('href', '/es/aviso-legal')
  })

  it('has a link to /es/privacidad', () => {
    render(<Footer />)
    const link = screen.getByText('privacidad').closest('a')
    expect(link).toHaveAttribute('href', '/es/privacidad')
  })

  it('has a link to /es/devoluciones', () => {
    render(<Footer />)
    const link = screen.getByText('devoluciones').closest('a')
    expect(link).toHaveAttribute('href', '/es/devoluciones')
  })

  it('has a link to /es/cookies', () => {
    render(<Footer />)
    const link = screen.getByText('cookies').closest('a')
    expect(link).toHaveAttribute('href', '/es/cookies')
  })
})
