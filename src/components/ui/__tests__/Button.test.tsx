import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with children text', () => {
    render(<Button>Comprar ahora</Button>)
    expect(screen.getByRole('button', { name: 'Comprar ahora' })).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Enviar</Button>)
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled()
  })

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Clic aquí</Button>)
    await user.click(screen.getByRole('button', { name: 'Clic aquí' }))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when button is disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        Deshabilitado
      </Button>,
    )
    await user.click(screen.getByRole('button', { name: 'Deshabilitado' }))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders outline variant with visible text', () => {
    render(<Button variant="outline">Ver más</Button>)
    const btn = screen.getByRole('button', { name: 'Ver más' })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveTextContent('Ver más')
  })

  it('renders ghost variant with visible text', () => {
    render(<Button variant="ghost">Cancelar</Button>)
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveTextContent('Cancelar')
  })

  it('renders destructive variant with visible text', () => {
    render(<Button variant="destructive">Eliminar</Button>)
    expect(screen.getByRole('button', { name: 'Eliminar' })).toHaveTextContent('Eliminar')
  })
})
