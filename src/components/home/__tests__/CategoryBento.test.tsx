import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CategoryBento from '../CategoryBento'

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

const t = (key: string) => key

describe('CategoryBento', () => {
  it('renders the four bento tiles with their titles and descriptions', () => {
    render(<CategoryBento locale="es" t={t} />)
    expect(screen.getByText('categoryBento.cremas.title')).toBeInTheDocument()
    expect(screen.getByText('categoryBento.cremas.description')).toBeInTheDocument()
    expect(screen.getByText('categoryBento.aceites.title')).toBeInTheDocument()
    expect(screen.getByText('categoryBento.suplementos.title')).toBeInTheDocument()
    expect(screen.getByText('categoryBento.integral.title')).toBeInTheDocument()
  })

  it('every tile links to the locale-scoped full catalog (no fake subcategory filtering)', () => {
    render(<CategoryBento locale="es" t={t} />)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(4)
    links.forEach(link => {
      expect(link).toHaveAttribute('href', '/es/productos')
    })
  })

  it('scopes tile links to the pt locale when rendered for pt', () => {
    render(<CategoryBento locale="pt" t={t} />)
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveAttribute('href', '/pt/productos')
    })
  })
})
