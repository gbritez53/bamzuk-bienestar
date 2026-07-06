import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ValuesSection from '../ValuesSection'

const t = (key: string) => key

describe('ValuesSection', () => {
  it('renders the three trust-badge values with title and description', () => {
    render(<ValuesSection t={t} />)
    expect(screen.getByText('values.organic.title')).toBeInTheDocument()
    expect(screen.getByText('values.organic.description')).toBeInTheDocument()
    expect(screen.getByText('values.clinical.title')).toBeInTheDocument()
    expect(screen.getByText('values.clinical.description')).toBeInTheDocument()
    expect(screen.getByText('values.packaging.title')).toBeInTheDocument()
    expect(screen.getByText('values.packaging.description')).toBeInTheDocument()
  })
})
