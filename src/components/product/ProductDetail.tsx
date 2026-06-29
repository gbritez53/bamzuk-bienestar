import Image from 'next/image'
import Link from 'next/link'
import AddToCartButton from '@/components/catalog/AddToCartButton'
import type { Product } from '@/lib/dropea/types'

interface ProductDetailProps {
  product: Product
  locale: string
}

export default function ProductDetail({ product, locale }: ProductDetailProps) {
  const image = product.images[0]
  const price = product.pvpr.toLocaleString(locale === 'pt' ? 'pt-PT' : 'es-ES', {
    style: 'currency',
    currency: 'EUR',
  })

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
        <Image
          src={image?.url ?? '/placeholder.jpg'}
          alt={image ? product.name : 'Sin imagen'}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        <p className="text-2xl font-semibold text-gray-900">{price}</p>
        {product.description && (
          <div
            className="prose prose-sm max-w-none text-gray-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-900 [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        )}
        {product.variants.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              {locale === 'pt' ? 'Variantes:' : 'Variantes:'}
            </p>
            <ul className="flex flex-wrap gap-2">
              {product.variants.map(v => (
                <li
                  key={v.id}
                  className="rounded-md border border-gray-200 px-3 py-1 text-sm text-gray-700"
                >
                  {v.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        <AddToCartButton product={product} />
      </div>
    </div>
  )
}
