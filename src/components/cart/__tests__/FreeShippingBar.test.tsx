import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}|${JSON.stringify(params)}` : key,
}))

import FreeShippingBar from '../FreeShippingBar'

describe('FreeShippingBar', () => {
  it('no renderiza nada cuando el threshold es 0 (no configurado)', () => {
    const { container } = render(
      <FreeShippingBar
        subtotalEur={20}
        thresholdEur={0}
        remainingEur={0}
        isFree={false}
        locale="es"
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('no renderiza nada cuando el threshold es negativo', () => {
    const { container } = render(
      <FreeShippingBar
        subtotalEur={20}
        thresholdEur={-10}
        remainingEur={0}
        isFree={false}
        locale="es"
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('por debajo del threshold: muestra el monto restante formateado y una barra de progreso proporcional', () => {
    render(
      <FreeShippingBar
        subtotalEur={20}
        thresholdEur={50}
        remainingEur={30}
        isFree={false}
        locale="es"
      />,
    )
    expect(
      screen.getByText(/freeShippingRemaining\|.*30,00.?€/),
    ).toBeInTheDocument()
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '40')
  })

  it('subtotal en 0: la barra de progreso está en 0% y el restante es el threshold completo', () => {
    render(
      <FreeShippingBar
        subtotalEur={0}
        thresholdEur={50}
        remainingEur={50}
        isFree={false}
        locale="es"
      />,
    )
    expect(
      screen.getByText(/freeShippingRemaining\|.*50,00.?€/),
    ).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0',
    )
  })

  it('threshold alcanzado: muestra el mensaje de confirmación y NO muestra el monto restante ni la barra', () => {
    render(
      <FreeShippingBar
        subtotalEur={60}
        thresholdEur={50}
        remainingEur={0}
        isFree={true}
        locale="es"
      />,
    )
    expect(screen.getByText('freeShippingAchieved')).toBeInTheDocument()
    expect(screen.queryByText(/freeShippingRemaining/)).not.toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('formatea el monto restante en pt-PT cuando el locale es pt', () => {
    render(
      <FreeShippingBar
        subtotalEur={20}
        thresholdEur={50}
        remainingEur={30}
        isFree={false}
        locale="pt"
      />,
    )
    expect(
      screen.getByText(/freeShippingRemaining\|.*30,00.?€/),
    ).toBeInTheDocument()
  })
})
