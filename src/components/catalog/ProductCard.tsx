import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/dropea/types'

interface ProductCardProps {
  product: Product
  locale: string
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  const image = product.images[0]
  const price = product.pvpr.toLocaleString(locale === 'pt' ? 'pt-PT' : 'es-ES', {
    style: 'currency',
    currency: 'EUR',
  })

  return (
    <Link
      href={`/${locale}/productos/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted to-accent">
        {image ? (
          <Image
            src={image.url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-all duration-300 group-hover:scale-105"
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
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h2 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h2>
        <p className="text-sm font-bold text-primary">{price}</p>
        {product.variants.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {product.variants.length}{' '}
            {product.variants.length === 1 ? 'variante' : 'variantes'}
          </p>
        )}
      </div>
    </Link>
  )
}
