import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Accordion } from '../accordion'

const items = [
  { id: 'a', title: 'Descripción', content: <p>Contenido A</p> },
  { id: 'b', title: 'Especificaciones', content: <p>Contenido B</p> },
  { id: 'c', title: 'Envíos', content: <p>Contenido C</p> },
]

describe('Accordion', () => {
  it('renders all section titles', () => {
    render(<Accordion items={items} />)
    expect(screen.getByText('Descripción')).toBeInTheDocument()
    expect(screen.getByText('Especificaciones')).toBeInTheDocument()
    expect(screen.getByText('Envíos')).toBeInTheDocument()
  })

  it('opens the first item by default', () => {
    render(<Accordion items={items} />)
    expect(screen.getByText('Contenido A')).toBeInTheDocument()
    expect(screen.queryByText('Contenido B')).not.toBeInTheDocument()
    expect(screen.queryByText('Contenido C')).not.toBeInTheDocument()
  })

  it('sets aria-expanded correctly on each trigger', () => {
    render(<Accordion items={items} />)
    expect(screen.getByRole('button', { name: 'Descripción' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Especificaciones' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('button', { name: 'Envíos' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('expands a section and does not affect the others state', async () => {
    const user = userEvent.setup()
    render(<Accordion items={items} />)
    await user.click(screen.getByRole('button', { name: 'Especificaciones' }))
    expect(screen.getByText('Contenido B')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Especificaciones' })).toHaveAttribute('aria-expanded', 'true')
    // Descripción (item a) remains open/unaffected since each section toggles independently
    expect(screen.getByText('Contenido A')).toBeInTheDocument()
  })

  it('collapses an open section when its trigger is clicked again', async () => {
    const user = userEvent.setup()
    render(<Accordion items={items} />)
    await user.click(screen.getByRole('button', { name: 'Descripción' }))
    expect(screen.queryByText('Contenido A')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Descripción' })).toHaveAttribute('aria-expanded', 'false')
  })
})
