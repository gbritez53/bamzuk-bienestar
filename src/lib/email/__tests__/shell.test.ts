import { describe, it, expect } from 'vitest'
import type { CartItem } from '@/lib/contracts'
import {
  renderEmailShell,
  renderLineItems,
  formatEurCents,
  normalizeLocale,
} from '@/lib/email/shell'

const baseItem: CartItem = {
  productId: '1',
  variantId: null,
  name: 'Almohada Cervical',
  unitBasePrice: 1999,
  weightKg: 0.3,
  dimensions: null,
  imageUrl: null,
  quantity: 2,
}

describe('formatEurCents', () => {
  it('formatea céntimos como EUR con dos decimales', () => {
    expect(formatEurCents(1999)).toContain('19,99')
    expect(formatEurCents(1999)).toContain('€')
  })

  it('formatea 0 céntimos', () => {
    expect(formatEurCents(0)).toContain('0,00')
  })
})

describe('normalizeLocale', () => {
  it('pt → pt', () => {
    expect(normalizeLocale('pt')).toBe('pt')
  })

  it('es → es', () => {
    expect(normalizeLocale('es')).toBe('es')
  })

  it('cualquier otro valor → es (default)', () => {
    expect(normalizeLocale('fr')).toBe('es')
    expect(normalizeLocale('')).toBe('es')
  })
})

describe('renderLineItems', () => {
  it('incluye nombre, cantidad y precio del ítem (es)', () => {
    const html = renderLineItems([baseItem], 'es')
    expect(html).toContain('Almohada Cervical')
    expect(html).toContain('2')
    expect(html).toContain('19,99')
  })

  it('renderiza múltiples ítems', () => {
    const secondItem: CartItem = { ...baseItem, productId: '2', name: 'Manta Térmica', quantity: 1 }
    const html = renderLineItems([baseItem, secondItem], 'es')
    expect(html).toContain('Almohada Cervical')
    expect(html).toContain('Manta Térmica')
  })

  it('usa encabezados en portugués cuando locale es pt', () => {
    const html = renderLineItems([baseItem], 'pt')
    expect(html).toMatch(/Produto|Quantidade|Preço/i)
  })

  it('usa encabezados en español cuando locale es es', () => {
    const html = renderLineItems([baseItem], 'es')
    expect(html).toMatch(/Producto|Cantidad|Precio/i)
  })
})

describe('renderEmailShell', () => {
  it('envuelve el HTML interno en el contenedor', () => {
    const html = renderEmailShell('<p>contenido</p>')
    expect(html).toContain('<p>contenido</p>')
  })

  it('incluye el nombre de la tienda en el footer', () => {
    const html = renderEmailShell('<p>x</p>')
    expect(html).toMatch(/font-family/i)
  })
})
