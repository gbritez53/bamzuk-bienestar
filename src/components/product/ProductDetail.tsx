'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import AddToCartButton from '@/components/catalog/AddToCartButton'
import { Separator } from '@/components/ui/separator'
import { Accordion, type AccordionItemData } from '@/components/ui/accordion'
import RelatedProducts from '@/components/product/RelatedProducts'
import { calcularPesoEfectivo, calcularEnvio } from '@/lib/shipping'
import type { Product } from '@/lib/dropea/types'

interface ProductDetailProps {
  product: Product
  locale: string
  relatedProducts?: Product[]
}

export default function ProductDetail({ product, locale, relatedProducts = [] }: ProductDetailProps) {
  const t = useTranslations('productDetail')
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [selectedImageIdx, setSelectedImageIdx] = useState(0)
  const image = product.images[selectedImageIdx] ?? product.images[0]

  const fmt = (eur: number) =>
    eur.toLocaleString(locale === 'pt' ? 'pt-PT' : 'es-ES', {
      style: 'currency',
      currency: 'EUR',
    })

  const price = fmt(product.pvpr)
  const costPrice = fmt(product.costPrice)

  // Cálculo de envío para 1 unidad de este producto — ambas zonas (datos reales)
  const shippingRates = useMemo<{ es: { cost: number; label: string }; pt: { cost: number; label: string } } | null>(() => {
    const effectiveWeight = calcularPesoEfectivo([
      {
        weightKg: product.weightKg,
        dimensions: product.dimensions
          ? { lengthCm: product.dimensions.length, widthCm: product.dimensions.width, heightCm: product.dimensions.height }
          : null,
        quantity: 1,
      },
    ])
    if (effectiveWeight == null) return null
    const es = calcularEnvio(effectiveWeight, undefined, 'peninsula_es')
    const pt = calcularEnvio(effectiveWeight, undefined, 'peninsula_pt')
    return { es: { cost: es.costEur, label: es.label }, pt: { cost: pt.costEur, label: pt.label } }
  }, [product])

  // Acordeón de info — reorganiza contenido REAL ya existente (Descripción /
  // Especificaciones / Envíos). No se inventan secciones "Beneficios" /
  // "Ingredientes" / "Modo de Uso": Dropea no expone esos campos (ver
  // design.md §4c, "DATA REALITY").
  const accordionItems: AccordionItemData[] = []
  if (product.description) {
    accordionItems.push({
      id: 'description',
      title: t('tabDescription'),
      content: (
        <div
          className="prose prose-sm max-w-none text-muted-foreground prose-headings:text-foreground prose-headings:font-semibold prose-a:text-primary prose-strong:text-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      ),
    })
  }
  accordionItems.push({
    id: 'specs',
    title: t('tabSpecs'),
    content: (
      <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div className="flex justify-between border-b border-border pb-1.5 sm:block sm:border-0 sm:pb-0">
          <dt className="text-muted-foreground">SKU</dt>
          <dd className="font-semibold text-foreground">{product.sku}</dd>
        </div>
        {product.weightKg > 0 && (
          <div className="flex justify-between border-b border-border pb-1.5 sm:block sm:border-0 sm:pb-0">
            <dt className="text-muted-foreground">{t('weight')}</dt>
            <dd className="font-semibold text-foreground">{product.weightKg} kg</dd>
          </div>
        )}
        {product.dimensions.length > 0 && product.dimensions.width > 0 && product.dimensions.height > 0 && (
          <div className="flex justify-between border-b border-border pb-1.5 sm:block sm:border-0 sm:pb-0 sm:col-span-2">
            <dt className="text-muted-foreground">{t('dimensions')}</dt>
            <dd className="font-semibold text-foreground">
              {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
            </dd>
          </div>
        )}
      </dl>
    ),
  })
  accordionItems.push({
    id: 'shipping',
    title: t('tabShipping'),
    content: shippingRates ? (
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="text-muted-foreground">🇪🇸 {locale === 'pt' ? 'Espanha' : 'España'}</span>
          <span className="font-semibold text-foreground">
            {fmt(shippingRates.es.cost)} <span className="text-muted-foreground">({shippingRates.es.label})</span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">🇵🇹 Portugal</span>
          <span className="font-semibold text-foreground">
            {fmt(shippingRates.pt.cost)} <span className="text-muted-foreground">({shippingRates.pt.label})</span>
          </span>
        </div>
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">{t('shippingUnavailable')}</p>
    ),
  })

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-12">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-card shadow-[var(--shadow-md)]">
            {image ? (
              <Image
                src={image.url}
                alt={image.alt || product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="h-20 w-20 text-muted-foreground/30"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.41a2.25 2.25 0 0 1 3.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 transition-all ${
                    idx === selectedImageIdx
                      ? 'border-primary'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `${product.name} ${idx + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5 lg:col-span-5">
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">
              {product.name}
            </h1>
            {product.category && (
              <span className="mt-2 inline-block rounded-full bg-primary-light/40 px-3 py-0.5 text-xs font-semibold text-primary">
                {product.category}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-heading text-3xl font-extrabold text-foreground">{price}</span>
            <span className="text-sm text-muted-foreground line-through">{costPrice}</span>
          </div>

          {/* Variantes reales — Dropea no distingue color/talla, solo variantes con nombre */}
          {product.variants.length > 0 && (
            <div>
              <p className="mb-2.5 text-xs font-bold tracking-wider text-secondary uppercase">{t('variants')}</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => {
                  const isSelected = selectedVariantId === v.id
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(isSelected ? null : v.id)}
                      className={`cursor-pointer rounded-xl border-2 px-3.5 py-1.5 text-sm font-semibold transition-all ${
                        isSelected
                          ? 'border-primary bg-primary-light/40 text-primary'
                          : 'border-border bg-card text-foreground hover:border-primary/50'
                      }`}
                    >
                      {v.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-1">
            <AddToCartButton product={product} variantId={selectedVariantId ?? undefined} />
          </div>

          {/* Acordeón: Descripción / Especificaciones / Envíos — datos reales
              reorganizados, primera sección abierta por defecto */}
          <Accordion items={accordionItems} />
        </div>
      </div>

      <RelatedProducts products={relatedProducts} locale={locale} title={t('relatedProducts')} />

      <Separator className="mt-16" />
    </div>
  )
}
