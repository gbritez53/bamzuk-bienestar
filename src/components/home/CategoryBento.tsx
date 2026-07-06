import Link from 'next/link'
import { SpaIcon, OilDropIcon, SupplementIcon, WellnessIcon } from './icons'

interface CategoryBentoProps {
  locale: string
  t: (key: string) => string
}

/**
 * Bento de categorías del Home. Los 3 tiles chicos (Cremas/Aceites/
 * Suplementos) + el tile ancho "Bienestar Integral" son navegación
 * cosmética hacia el catálogo general: Dropea no expone subcategorías
 * reales, así que ningún tile filtra de verdad (ver design, decisión #4a
 * y catalog-filters spec — "Category/brand controls removed").
 */
export default function CategoryBento({ locale, t }: CategoryBentoProps) {
  const catalogHref = `/${locale}/productos`

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      <Link
        href={catalogHref}
        className="group flex flex-col justify-between rounded-xl bg-muted p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] md:col-span-2"
      >
        <div>
          <SpaIcon className="mb-4 h-9 w-9 text-primary" />
          <h3 className="font-heading text-xl font-semibold text-foreground">
            {t('categoryBento.cremas.title')}
          </h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {t('categoryBento.cremas.description')}
          </p>
        </div>
      </Link>

      <Link
        href={catalogHref}
        className="group flex flex-col justify-between rounded-xl bg-muted p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
      >
        <div>
          <OilDropIcon className="mb-4 h-9 w-9 text-primary" />
          <h3 className="font-heading text-xl font-semibold text-foreground">
            {t('categoryBento.aceites.title')}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{t('categoryBento.aceites.description')}</p>
        </div>
      </Link>

      <Link
        href={catalogHref}
        className="group flex flex-col justify-between rounded-xl bg-secondary-light p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
      >
        <div>
          <SupplementIcon className="mb-4 h-9 w-9 text-primary" />
          <h3 className="font-heading text-xl font-semibold text-foreground">
            {t('categoryBento.suplementos.title')}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('categoryBento.suplementos.description')}
          </p>
        </div>
      </Link>

      <Link
        href={catalogHref}
        className="group flex flex-col items-start justify-between gap-4 rounded-xl bg-primary-light p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] md:col-span-4 md:flex-row md:items-center"
      >
        <div className="max-w-md">
          <h3 className="font-heading text-xl font-semibold text-foreground">
            {t('categoryBento.integral.title')}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('categoryBento.integral.description')}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-primary group-hover:underline">
          <WellnessIcon className="h-5 w-5" />
          {t('categoryBento.integral.cta')}
        </span>
      </Link>
    </div>
  )
}
