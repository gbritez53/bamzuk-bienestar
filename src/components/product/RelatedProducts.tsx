import ProductCard from '@/components/catalog/ProductCard'
import type { Product } from '@/lib/dropea/types'

interface RelatedProductsProps {
  products: Product[]
  locale: string
  title: string
}

// "Completa tu Rutina" — reutiliza ProductCard del catálogo (DRY, mockup usa
// las mismas cards). Fallback (spec product-detail / "Related-products rail
// with fallback"): <4 productos → se muestran todos los disponibles sin
// placeholders vacíos; 0 productos → la sección entera se omite (no se
// renderiza título ni contenedor).
export default function RelatedProducts({ products, locale, title }: RelatedProductsProps) {
  if (products.length === 0) return null

  const visible = products.slice(0, 4)

  return (
    <section className="mt-16 border-t border-border pt-10">
      <h2 className="mb-6 font-heading text-xl font-extrabold text-foreground sm:text-2xl">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {visible.map(product => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </section>
  )
}
