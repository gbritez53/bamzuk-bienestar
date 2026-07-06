import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HomeHero from '../HomeHero'

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

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

const t = (key: string) => key

describe('HomeHero', () => {
  it('renders the badge, title and subtitle copy', () => {
    render(<HomeHero locale="es" t={t} />)
    expect(screen.getByText('badge')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'title' })).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
  })

  it('renders both CTAs pointing to the locale-scoped catalog', () => {
    render(<HomeHero locale="es" t={t} />)
    const primaryCta = screen.getByText('cta').closest('a')
    const secondaryCta = screen.getByText('ctaSecondary').closest('a')
    expect(primaryCta).toHaveAttribute('href', '/es/productos')
    expect(secondaryCta).toHaveAttribute('href', '/es/productos')
  })

  it('renders the wellness banner image, not a pet banner', () => {
    render(<HomeHero locale="es" t={t} />)
    const image = screen.getByAltText('imageAlt')
    expect(image).toHaveAttribute('src', '/banner_bienestar.png')
  })

  it('scopes CTAs to the pt locale when rendered for pt', () => {
    render(<HomeHero locale="pt" t={t} />)
    expect(screen.getByText('cta').closest('a')).toHaveAttribute('href', '/pt/productos')
  })
})
