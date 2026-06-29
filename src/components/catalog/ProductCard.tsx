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
    <article className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md">
      <Link href={`/${locale}/productos/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={image?.url ?? '/placeholder.jpg'}
            alt={image ? product.name : 'Sin imagen'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h2 className="line-clamp-2 text-sm font-medium text-gray-900">{product.name}</h2>
          <p className="mt-1 text-sm font-semibold text-gray-900">{price}</p>
        </div>
      </Link>
    </article>
  )
}
