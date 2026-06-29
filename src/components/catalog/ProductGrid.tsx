import ProductCard from './ProductCard'
import type { Product } from '@/lib/dropea/types'

interface ProductGridProps {
  products: Product[]
  locale: string
}

export default function ProductGrid({ products, locale }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-gray-500">
        <p>No hay productos disponibles</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  )
}
