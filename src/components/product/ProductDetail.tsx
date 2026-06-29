'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import AddToCartButton from '@/components/catalog/AddToCartButton'
import { Separator } from '@/components/ui/separator'
import { calcularPesoEfectivo, calcularEnvio, type ShippingZone } from '@/lib/shipping'
import type { Product } from '@/lib/dropea/types'

interface ProductDetailProps {
  product: Product
  locale: string
}

export default function ProductDetail({ product, locale }: ProductDetailProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const image = product.images[0]

  const fmt = (eur: number) =>
    eur.toLocaleString(locale === 'pt' ? 'pt-PT' : 'es-ES', {
      style: 'currency',
      currency: 'EUR',
    })

  const price = fmt(product.pvpr)
  const costPrice = fmt(product.costPrice)

  // Cálculo de envío para 1 unidad de este producto — ambas zonas
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

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {/* Gallery */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-muted to-accent">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt || product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center">
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

      {/* Info */}
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
          {product.category && (
            <span className="mt-1 inline-block rounded-full bg-primary-light px-3 py-0.5 text-xs font-medium text-primary">
              {product.category}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary">{price}</span>
          <span className="text-sm text-muted-foreground line-through">{costPrice}</span>
        </div>

        {/* Shipping estimate — both zones */}
        {shippingRates && (
          <div className="rounded-lg bg-muted/50 px-3.5 py-2.5 text-sm space-y-1.5">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4 flex-shrink-0 text-primary"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
              <span className="font-medium text-foreground">
                {locale === 'pt' ? 'Frete' : 'Envío'}
              </span>
            </div>
            <div className="ml-6 space-y-0.5 text-muted-foreground">
              <span className="block">
                🇪🇸{' '}
                {locale === 'pt' ? 'Espanha' : 'España'}:{' '}
                <span className="font-semibold text-foreground">{fmt(shippingRates.es.cost)}</span>
                <span className="ml-1">({shippingRates.es.label})</span>
              </span>
              <span className="block">
                🇵🇹{' '}
                {locale === 'pt' ? 'Portugal' : 'Portugal'}:{' '}
                <span className="font-semibold text-foreground">{fmt(shippingRates.pt.cost)}</span>
                <span className="ml-1">({shippingRates.pt.label})</span>
              </span>
            </div>
          </div>
        )}

        <Separator />

        {product.description && (
          <div
            className="prose prose-sm max-w-none text-muted-foreground prose-headings:text-foreground prose-headings:font-semibold prose-a:text-primary prose-strong:text-foreground [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:list-disc"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        )}

        {/* Variants — selectable chips */}
        {product.variants.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="mb-2.5 text-sm font-medium text-foreground">Variantes</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => {
                  const isSelected = selectedVariantId === v.id
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() =>
                        setSelectedVariantId(isSelected ? null : v.id)
                      }
                      className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium shadow-sm transition-all ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground shadow-primary/25'
                          : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary-light hover:text-primary'
                      }`}
                    >
                      {v.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        <Separator />

        <AddToCartButton product={product} variantId={selectedVariantId ?? undefined} />
      </div>
    </div>
  )
}
