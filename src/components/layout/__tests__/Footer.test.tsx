import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Footer from '@/components/layout/Footer'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
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
  it('renders and shows the site name', () => {
    render(<Footer />)
    // nichoConfig.name defaults to 'Mi Tienda'
    expect(screen.getByText(/Mi Tienda/)).toBeInTheDocument()
  })

  it('has a link to /aviso-legal', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'avisoLegal' })
    expect(link).toHaveAttribute('href', '/aviso-legal')
  })

  it('has a link to /privacidad', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'privacidad' })
    expect(link).toHaveAttribute('href', '/privacidad')
  })

  it('has a link to /devoluciones', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'devoluciones' })
    expect(link).toHaveAttribute('href', '/devoluciones')
  })

  it('has a link to /cookies', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'cookies' })
    expect(link).toHaveAttribute('href', '/cookies')
  })

  it('shows the current year', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument()
  })
})
