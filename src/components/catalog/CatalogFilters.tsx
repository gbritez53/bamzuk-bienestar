import { getTranslations } from 'next-intl/server'

// Sidebar de filtros — 100% presentacional por ahora.
// Dropea no expone categorías de mascotas, rango de precio ni marca
// filtrables desde la API (ver nicho.config.ts), así que estos controles
// no están conectados a ninguna lógica de filtrado real todavía. Se dejan
// listos visualmente para cuando el proveedor de mascotas esté integrado.
const CATEGORY_KEYS = ['premiumFood', 'interactiveToys', 'bedsComfort', 'groomingKits'] as const
const BRAND_KEYS = ['wildpaw', 'nutripet', 'softbeds'] as const

interface CatalogFiltersProps {
  locale: string
}

export default async function CatalogFilters({ locale }: CatalogFiltersProps) {
  const t = await getTranslations({ locale, namespace: 'catalogFilters' })

  return (
    <aside className="w-full shrink-0 md:w-64">
      <div className="space-y-8">
        <div>
          <h3 className="mb-4 font-heading text-base font-bold text-foreground">
            {t('category')}
          </h3>
          <ul className="space-y-3">
            {CATEGORY_KEYS.map(key => (
              <li key={key}>
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    disabled
                    className="h-4 w-4 rounded border-border text-primary accent-[var(--primary)]"
                  />
                  <span className="text-sm text-muted-foreground">{t(`categoryOptions.${key}`)}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-heading text-base font-bold text-foreground">{t('price')}</h3>
          <input
            type="range"
            disabled
            min={0}
            max={500}
            className="h-2 w-full cursor-not-allowed appearance-none rounded-lg bg-secondary-light accent-[var(--primary)]"
          />
          <div className="mt-2 flex justify-between text-xs font-medium text-muted-foreground">
            <span>0€</span>
            <span>500€+</span>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-heading text-base font-bold text-foreground">{t('brand')}</h3>
          <ul className="space-y-3">
            {BRAND_KEYS.map(key => (
              <li key={key}>
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    disabled
                    className="h-4 w-4 rounded border-border text-primary accent-[var(--primary)]"
                  />
                  <span className="text-sm text-muted-foreground">{t(`brandOptions.${key}`)}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}
