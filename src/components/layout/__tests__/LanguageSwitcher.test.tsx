import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LanguageSwitcher from '../LanguageSwitcher'

const mockUsePathname = vi.fn()
const mockUseSearchParams = vi.fn()
const mockPush = vi.fn()

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue('/es/productos')
    mockUseSearchParams.mockReturnValue(new URLSearchParams())
  })

  it('muestra un botón trigger con la bandera del idioma actual', () => {
    render(<LanguageSwitcher />)
    const trigger = screen.getByRole('button', { name: /selectorLabel: es/i })
    expect(trigger).toBeInTheDocument()
  })

  it('el dropdown está cerrado por defecto', () => {
    render(<LanguageSwitcher />)
    expect(screen.queryByRole('listbox')).not.toHaveClass('opacity-100')
  })

  it('abre el dropdown y muestra una opción por locale (es y pt)', async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher />)
    await user.click(screen.getByRole('button', { name: /selectorLabel/i }))
    expect(screen.getByRole('option', { name: /^es$/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /^pt$/i })).toBeInTheDocument()
  })

  it('marca el locale actual con aria-selected', async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher />)
    await user.click(screen.getByRole('button', { name: /selectorLabel/i }))
    expect(screen.getByRole('option', { name: /^es$/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: /^pt$/i })).toHaveAttribute('aria-selected', 'false')
  })

  it('navega preservando el resto del path y los query params al elegir pt', async () => {
    mockUsePathname.mockReturnValue('/es/productos/5227')
    mockUseSearchParams.mockReturnValue(new URLSearchParams('page=2'))
    const user = userEvent.setup()
    render(<LanguageSwitcher />)
    await user.click(screen.getByRole('button', { name: /selectorLabel/i }))
    await user.click(screen.getByRole('button', { name: /^pt$/i }))
    expect(mockPush).toHaveBeenCalledWith('/pt/productos/5227?page=2')
  })

  it('cierra el dropdown con Escape', async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher />)
    await user.click(screen.getByRole('button', { name: /selectorLabel/i }))
    expect(screen.getByRole('listbox')).toHaveClass('opacity-100')
    await user.keyboard('{Escape}')
    expect(screen.getByRole('listbox')).toHaveClass('opacity-0')
  })
})
