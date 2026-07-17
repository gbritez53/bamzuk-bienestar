import { describe, it, expect } from 'vitest'
import type { DropeaRawProduct, DropeaRawVariant, DropeaRawOrderTracking } from '@/lib/dropea/types'
import {
  mapDropeaProduct,
  mapDropeaVariant,
  stripDropshipperContent,
  mapDropeaOrderTracking,
} from '@/lib/dropea/mappers'

// Schema real confirmado via exploración — 2026-06-29
const baseRaw: DropeaRawProduct = {
  id: '60',
  name: 'Almohada Cervical Test',
  sku: 'V0103849',
  description: 'Descripción del producto',
  state: 'PUBLIC',
  weight: 1.24,
  height: 18,
  width: 18,
  length: 30,
  pvpr: 32.98,
  cost_price: 16.33,
  fulfillment_cost: 1,
  images: ['https://api.dropea.com/100972/product-file'],
  category: 'Hogar y cocina',
  variants: [],
}

describe('mapDropeaProduct — campos básicos', () => {
  it('mapea id, name, sku y category', () => {
    const result = mapDropeaProduct(baseRaw)
    expect(result.id).toBe('60')
    expect(result.name).toBe('Almohada Cervical Test')
    expect(result.sku).toBe('V0103849')
    expect(result.category).toBe('Hogar y cocina')
  })

  it('mapea costPrice desde cost_price', () => {
    const result = mapDropeaProduct(baseRaw)
    expect(result.costPrice).toBe(16.33)
  })

  it('mapea pvpr recalculándolo con el margen propio, no con el que manda Dropea', () => {
    // baseRaw: cost_price=16.33, fulfillment_cost=1 → costo real=17.33,
    // tramo 10-20€ → margen 40% → 17.33 / 0.60 = 28.88
    const result = mapDropeaProduct(baseRaw)
    expect(result.pvpr).toBe(28.88)
  })
})

describe('mapDropeaProduct — pvpr siempre se recalcula con el margen propio', () => {
  it('aplica margen 55% (costo real < 6€): precio = costo_real / (1 - 0.55)', () => {
    const result = mapDropeaProduct({ ...baseRaw, pvpr: 0, cost_price: 5, fulfillment_cost: 0 })
    expect(result.pvpr).toBe(11.11)
  })

  it('el umbral de 6€ usa margen 47%, no 55%, justo en el límite', () => {
    const result = mapDropeaProduct({ ...baseRaw, pvpr: 0, cost_price: 6, fulfillment_cost: 0 })
    expect(result.pvpr).toBe(11.32)
  })

  it('aplica margen 47% (6€ <= costo real < 10€): precio = costo_real / (1 - 0.47)', () => {
    const result = mapDropeaProduct({ ...baseRaw, pvpr: 0, cost_price: 8, fulfillment_cost: 0 })
    expect(result.pvpr).toBe(15.09)
  })

  it('el umbral de 10€ usa margen 40%, no 47%, justo en el límite', () => {
    const result = mapDropeaProduct({ ...baseRaw, pvpr: 0, cost_price: 10, fulfillment_cost: 0 })
    expect(result.pvpr).toBe(16.67)
  })

  it('aplica margen 40% (10€ <= costo real < 20€): precio = costo_real / (1 - 0.40)', () => {
    const result = mapDropeaProduct({ ...baseRaw, pvpr: 0, cost_price: 15, fulfillment_cost: 0 })
    expect(result.pvpr).toBe(25)
  })

  it('el umbral de 20€ usa margen 35%, no 40%, justo en el límite', () => {
    const result = mapDropeaProduct({ ...baseRaw, pvpr: 0, cost_price: 20, fulfillment_cost: 0 })
    expect(result.pvpr).toBe(30.77)
  })

  it('aplica margen 35% (costo real >= 20€): precio = costo_real / (1 - 0.35)', () => {
    const result = mapDropeaProduct({ ...baseRaw, pvpr: 0, cost_price: 25, fulfillment_cost: 0 })
    expect(result.pvpr).toBe(38.46)
  })

  it('suma fulfillment_cost al cost_price antes de calcular el margen (caso real: Ventilador con humidificador)', () => {
    const result = mapDropeaProduct({ ...baseRaw, pvpr: 0, cost_price: 6.7, fulfillment_cost: 1 })
    expect(result.pvpr).toBe(14.53)
  })

  it('fulfillment_cost null se trata como 0', () => {
    const result = mapDropeaProduct({ ...baseRaw, pvpr: 0, cost_price: 5, fulfillment_cost: null })
    expect(result.pvpr).toBe(11.11)
  })

  it('deja pvpr en 0 si tampoco hay costo real (no se puede calcular)', () => {
    const result = mapDropeaProduct({ ...baseRaw, pvpr: 0, cost_price: 0, fulfillment_cost: 0 })
    expect(result.pvpr).toBe(0)
  })

  it('ignora el pvpr que manda Dropea y lo recalcula con el margen propio (caso real: Ventilador de Cuello, comparable Amazon 15-18€)', () => {
    // cost_price=7.70, fulfillment_cost=1 → costo real=8.70 → margen 47% → 16.42
    // Dropea manda pvpr=29.99 (su propio "precio recomendado", muy por encima del mercado real) — se ignora.
    const result = mapDropeaProduct({ ...baseRaw, pvpr: 29.99, cost_price: 7.7, fulfillment_cost: 1 })
    expect(result.pvpr).toBe(16.42)
  })

  it('caso real: Depiladora multicabezal (comparable Amazon 22,99€, pero más completo — no se apunta a ese techo)', () => {
    // cost_price=4.70, fulfillment_cost=1 → costo real=5.70 → margen 55% → 12.67
    const result = mapDropeaProduct({ ...baseRaw, pvpr: 0, cost_price: 4.7, fulfillment_cost: 1 })
    expect(result.pvpr).toBe(12.67)
  })

  it('mapea weightKg desde weight', () => {
    const result = mapDropeaProduct(baseRaw)
    expect(result.weightKg).toBe(1.24)
  })

  it('mapea dimensions (height, width, length)', () => {
    const result = mapDropeaProduct(baseRaw)
    expect(result.dimensions).toEqual({ height: 18, width: 18, length: 30 })
  })

  it('isPublic true cuando state es PUBLIC', () => {
    const result = mapDropeaProduct(baseRaw)
    expect(result.isPublic).toBe(true)
  })

  it('isPublic false cuando state NO es PUBLIC', () => {
    const result = mapDropeaProduct({ ...baseRaw, state: 'PRIVATE' })
    expect(result.isPublic).toBe(false)
  })
})

describe('mapDropeaProduct — imágenes (String[])', () => {
  it('normaliza array de URLs a { url, alt }', () => {
    const result = mapDropeaProduct(baseRaw)
    expect(result.images).toHaveLength(1)
    expect(result.images[0]).toEqual({
      url: 'https://api.dropea.com/100972/product-file',
      alt: '',
    })
  })

  it('retorna array vacío cuando images es []', () => {
    const result = mapDropeaProduct({ ...baseRaw, images: [] })
    expect(result.images).toEqual([])
  })

  it('mapea múltiples imágenes', () => {
    const raw = {
      ...baseRaw,
      images: [
        'https://api.dropea.com/img1/product-file',
        'https://api.dropea.com/img2/product-file',
      ],
    }
    const result = mapDropeaProduct(raw)
    expect(result.images).toHaveLength(2)
    expect(result.images[1]?.url).toBe('https://api.dropea.com/img2/product-file')
  })
})

describe('mapDropeaProduct — variantes', () => {
  it('retorna array vacío cuando no hay variantes', () => {
    const result = mapDropeaProduct({ ...baseRaw, variants: [] })
    expect(result.variants).toEqual([])
  })

  it('mapea variantes con id, name, sku', () => {
    const variants: DropeaRawVariant[] = [
      { id: 'v1', name: 'Talla S', sku: 'SKU-S', state: 'PUBLIC' },
      { id: 'v2', name: 'Talla L', sku: 'SKU-L', state: 'PRIVATE' },
    ]
    const result = mapDropeaProduct({ ...baseRaw, variants })
    expect(result.variants).toHaveLength(2)
    expect(result.variants[0]).toEqual({ id: 'v1', name: 'Talla S', sku: 'SKU-S' })
    expect(result.variants[1]).toEqual({ id: 'v2', name: 'Talla L', sku: 'SKU-L' })
  })
})

describe('mapDropeaVariant — campos', () => {
  it('mapea id, name y sku', () => {
    const raw: DropeaRawVariant = { id: 'v1', name: 'Color Rojo', sku: 'SKU-R', state: 'PUBLIC' }
    const result = mapDropeaVariant(raw)
    expect(result).toEqual({ id: 'v1', name: 'Color Rojo', sku: 'SKU-R' })
  })
})

describe('stripDropshipperContent — variante estándar (h1/h2 + hr, formato real de Dropea)', () => {
  const html =
    '<h1 data-start="0" data-end="103"><strong data-start="2" data-end="101">Auriculares Inalámbricos Bluetooth V5.3</strong></h1>' +
    '<p data-start="105" data-end="449">Disfruta de un sonido envolvente en un solo producto.</p>' +
    '<hr data-start="451" data-end="456">' +
    '<h2 data-start="458" data-end="517"><strong data-start="461" data-end="515">¿Por qué este producto es ideal para dropshipping?</strong></h2>' +
    '<p data-start="519" data-end="640">✅ <strong data-start="521" data-end="560">Alta demanda y tendencia creciente:</strong> imprescindible.</p>' +
    '<p data-start="642" data-end="772">✅ <strong data-start="644" data-end="669">Fácil de promocionar:</strong> anuncios en TikTok Ads.</p>' +
    '<hr data-start="1148" data-end="1153">' +
    '<h2 data-start="1155" data-end="1192"><strong data-start="1158" data-end="1190">Características del Producto</strong></h2>' +
    '<ul data-start="1194" data-end="1822"><li data-start="1310" data-end="1424"><strong>Estuche de carga inteligente</strong> → Hasta 15 cargas.</li></ul>' +
    '<hr data-start="3463" data-end="3468">' +
    '<h2 data-start="3470" data-end="3498"><strong data-start="3473" data-end="3496">Llamado a la Acción</strong></h2>' +
    '<p data-start="3500" data-end="3775">💼 <strong data-start="3503" data-end="3581">¡Aprovecha este producto innovador y agrégalo a tu tienda de dropshipping!</strong> Best-seller para Facebook Ads.</p>' +
    '<hr data-start="3867" data-end="3872">' +
    '<h2 data-start="3874" data-end="3921"><strong data-start="3877" data-end="3919">📦 Recomendaciones de Envío y Embalaje</strong></h2>' +
    '<p data-start="3923" data-end="4172">Sugerimos incluir una caja de cartón resistente (<strong data-start="3972" data-end="4004">ID: 11913, SKU: CAJAEMBALAJE</strong>).</p>' +
    '<p data-start="4174" data-end="4230" data-is-last-node=""><strong data-start="4177" data-end="4230">¡Listo para vender y triunfar en el dropshipping!</strong></p>'

  const result = stripDropshipperContent(html)

  it('conserva el título (h1)', () => {
    expect(result).toContain('Auriculares Inalámbricos Bluetooth V5.3')
  })

  it('conserva el párrafo introductorio', () => {
    expect(result).toContain('Disfruta de un sonido envolvente')
  })

  it('conserva "Características del Producto" y su contenido', () => {
    expect(result).toContain('Características del Producto')
    expect(result).toContain('Estuche de carga inteligente')
  })

  it('elimina la sección "¿Por qué es ideal para dropshipping?" completa', () => {
    expect(result).not.toContain('ideal para dropshipping')
    expect(result).not.toContain('Alta demanda y tendencia creciente')
  })

  it('elimina "Llamado a la Acción" y su mención a campañas de ads', () => {
    expect(result).not.toContain('Llamado a la Acción')
    expect(result).not.toContain('Facebook Ads')
    expect(result).not.toContain('agrégalo a tu tienda')
  })

  it('elimina "Recomendaciones de Envío y Embalaje" y el SKU interno', () => {
    expect(result).not.toContain('Recomendaciones de Envío y Embalaje')
    expect(result).not.toContain('CAJAEMBALAJE')
  })

  it('elimina el cierre "¡Listo para vender...!"', () => {
    expect(result).not.toContain('Listo para vender')
  })

  it('no deja atributos data-* en el HTML resultante', () => {
    expect(result).not.toMatch(/data-start|data-end|data-is-last-node/)
  })
})

describe('stripDropshipperContent — variante "fusionada" (heading + contenido en un solo <p>, sin hr/h2)', () => {
  const html =
    '<p data-start="0" data-end="450"><strong data-start="0" data-end="119">Máscara de Tratamiento para Ojos</strong><br>Rejuvenece la piel del contorno de ojos.</p>' +
    '<p data-start="452" data-end="1432">🔹 <strong data-start="455" data-end="509">¿Por qué este producto es ideal para dropshipping?</strong><br>✅ <strong>Alta demanda</strong> → producto de lujo.<br>✅ <strong>Fácil de promocionar</strong> → Instagram, Facebook Ads y TikTok.</p>' +
    '<p data-start="1434" data-end="2464">🔹 <strong data-start="1437" data-end="1469">Características del Producto</strong><br>✨ <strong>Composición similar al tejido humano</strong> → absorción inmediata.</p>' +
    '<p data-start="4717" data-end="5211">🔹 <strong data-start="4720" data-end="4759">Recomendaciones de Envío y Embalaje</strong><br>Sugerimos incluir una caja de cartón resistente (ID: 11913, SKU: CAJAEMBALAJE).</p>' +
    '<p data-start="5213" data-end="5297" data-is-last-node="">📦 <strong data-start="5216" data-end="5294">¡Listo para vender y llevar este tratamiento a tus clientes!</strong> 🌟</p>'

  const result = stripDropshipperContent(html)

  it('conserva el título/intro (primer párrafo, sin heading propio)', () => {
    expect(result).toContain('Máscara de Tratamiento para Ojos')
    expect(result).toContain('Rejuvenece la piel del contorno de ojos')
  })

  it('elimina la sección de dropshipping fusionada en un solo <p>', () => {
    expect(result).not.toContain('ideal para dropshipping')
    expect(result).not.toContain('Alta demanda')
  })

  it('conserva "Características del Producto" fusionada en su <p>', () => {
    expect(result).toContain('Características del Producto')
    expect(result).toContain('Composición similar al tejido humano')
  })

  it('elimina "Recomendaciones de Envío y Embalaje" con el SKU interno', () => {
    expect(result).not.toContain('CAJAEMBALAJE')
  })

  it('elimina el cierre final "¡Listo para vender...!"', () => {
    expect(result).not.toContain('Listo para vender')
  })
})

describe('stripDropshipperContent — descripción pegada desde la UI de ChatGPT (divs + data-message-*)', () => {
  const html =
    '<div class="flex max-w-full flex-col flex-grow"><div class="min-h-8 text-message" data-message-author-role="assistant" data-message-id="e7b3f672" dir="auto" data-message-model-slug="gpt-4o-mini"><div class="flex w-full flex-col gap-1"><div class="markdown prose w-full break-words dark:prose-invert dark">' +
    '<h1 data-start="0" data-end="50"><strong data-start="0" data-end="50">Removedor de Callos Eléctrico</strong></h1>' +
    '<p data-start="51" data-end="100">Suaviza tus pies en minutos.</p>' +
    '<hr data-start="101" data-end="104">' +
    '<h2 data-start="105" data-end="150"><strong data-start="105" data-end="150">🔹 ¿Por qué este producto es ideal para dropshipping?</strong></h2>' +
    '<p data-start="151" data-end="200">✅ <strong>Alta demanda</strong> → cuidado personal.</p>' +
    '<hr data-start="201" data-end="204">' +
    '<h2 data-start="205" data-end="250"><strong data-start="205" data-end="250">🔹 Características del Producto</strong></h2>' +
    '<p data-start="251" data-end="300">🔌 <strong>Motor potente</strong> → elimina durezas.</p>' +
    '</div></div></div></div>'

  const result = stripDropshipperContent(html)

  it('desenvuelve el chrome de ChatGPT (divs, data-message-*, class, dir)', () => {
    expect(result).not.toMatch(/<div|data-message-author-role|data-message-id|class="|dir="/)
  })

  it('conserva el título y el contenido real del producto', () => {
    expect(result).toContain('Removedor de Callos Eléctrico')
    expect(result).toContain('Suaviza tus pies en minutos')
    expect(result).toContain('Motor potente')
  })

  it('elimina la sección de dropshipping aunque venga envuelta en el HTML de ChatGPT', () => {
    expect(result).not.toContain('ideal para dropshipping')
    expect(result).not.toContain('Alta demanda')
  })
})

describe('stripDropshipperContent — casos borde', () => {
  it('string vacío devuelve string vacío', () => {
    expect(stripDropshipperContent('')).toBe('')
  })

  it('texto plano sin HTML se conserva tal cual', () => {
    expect(stripDropshipperContent('Base de maquillaje líquida')).toBe('Base de maquillaje líquida')
  })

  it('no elimina secciones legítimas cuyo heading no está en la lista de bloqueo (ej: "¿Por qué es el mejor...?")', () => {
    const html =
      '<h1>Parches Adelgazantes</h1>' +
      '<h2>¿Por qué este parche es el mejor?</h2>' +
      '<ul><li>Fórmula basada en ingredientes naturales</li></ul>'
    const result = stripDropshipperContent(html)
    expect(result).toContain('¿Por qué este parche es el mejor?')
    expect(result).toContain('Fórmula basada en ingredientes naturales')
  })
})

describe('mapDropeaProduct — aplica stripDropshipperContent a la descripción', () => {
  it('limpia la sección de dropshipping al mapear el producto completo', () => {
    const raw: DropeaRawProduct = {
      ...baseRaw,
      description:
        '<h1>Producto</h1><p>Intro real.</p><hr>' +
        '<h2>¿Por qué este producto es ideal para dropshipping?</h2><p>Pitch para revendedores.</p>',
    }
    const result = mapDropeaProduct(raw)
    expect(result.description).toContain('Intro real.')
    expect(result.description).not.toContain('Pitch para revendedores')
  })
})

describe('mapDropeaOrderTracking', () => {
  const rawOrder: DropeaRawOrderTracking = {
    id: '1295211',
    status: 'PREPARED',
    tracking_code: '0280010280017024587071',
    tracking_url: 'https://dinapaqweb.tipsa-dinapaq.com/dinapaqweb/detalle_envio.php?servicio=xxx',
    carrier_company: '#1 - tipsa',
    shop: { id: '17817' },
    customer: { full_name: 'Daniel Longone', email: 'daniel@test.com', zip: '49213' },
  }

  it('mapea id, status, tracking, shop y datos del cliente', () => {
    const result = mapDropeaOrderTracking(rawOrder)
    expect(result).toEqual({
      id: '1295211',
      status: 'PREPARED',
      trackingCode: '0280010280017024587071',
      trackingUrl: 'https://dinapaqweb.tipsa-dinapaq.com/dinapaqweb/detalle_envio.php?servicio=xxx',
      carrierCompany: '#1 - tipsa',
      shopId: '17817',
      customerEmail: 'daniel@test.com',
      customerName: 'Daniel Longone',
      customerZip: '49213',
    })
  })

  it('shop null se mapea a shopId null sin explotar', () => {
    const result = mapDropeaOrderTracking({ ...rawOrder, shop: null })
    expect(result.shopId).toBeNull()
  })

  it('customer null se mapea a campos null sin explotar', () => {
    const result = mapDropeaOrderTracking({ ...rawOrder, customer: null })
    expect(result.customerEmail).toBeNull()
    expect(result.customerName).toBeNull()
    expect(result.customerZip).toBeNull()
  })
})
