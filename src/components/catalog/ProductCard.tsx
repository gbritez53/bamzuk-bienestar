'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useCartStore } from '@/hooks/useCart'
import type { Product } from '@/lib/dropea/types'

interface ProductCardProps {
  product: Product
  locale: string
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  const t = useTranslations('products')
  const addItem = useCartStore(s => s.addItem)
  const image = product.images[0]
  const price = product.pvpr.toLocaleString(locale === 'pt' ? 'pt-PT' : 'es-ES', {
    style: 'currency',
    currency: 'EUR',
  })

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      productId: product.id,
      variantId: null,
      name: product.name,
      unitBasePrice: Math.round(product.pvpr * 100),
      weightKg: product.weightKg,
      dimensions: product.dimensions
        ? {
            lengthCm: product.dimensions.length,
            widthCm: product.dimensions.width,
            heightCm: product.dimensions.height,
          }
        : null,
      imageUrl: product.images[0]?.url ?? null,
      quantity: 1,
    })
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-card shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
      <Link href={`/${locale}/productos/${product.id}`} className="flex flex-1 cursor-pointer flex-col">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image.url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="h-12 w-12 text-muted-foreground/30"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.41a2.25 2.25 0 0 1 3.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          {product.category && (
            <span className="w-fit rounded-full bg-primary-light/40 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-primary uppercase">
              {product.category}
            </span>
          )}
          <h2 className="line-clamp-2 font-heading text-sm leading-tight font-bold text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h2>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-2 p-4 pt-0">
        <span className="font-heading text-lg font-extrabold text-primary">{price}</span>
        <button
          onClick={handleAddToCart}
          className="shrink-0 cursor-pointer rounded-full bg-primary-light px-4 py-2 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
        >
          {t('addToCart')}
        </button>
      </div>
    </div>
  )
}
