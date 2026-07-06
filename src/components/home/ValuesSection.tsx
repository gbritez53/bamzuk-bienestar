import { EcoIcon, ScienceIcon, PackagingIcon } from './icons'

interface ValuesSectionProps {
  t: (key: string) => string
}

/**
 * Trust badges (mockup "Values Section"): 100% Orgánico / Probado
 * Clínicamente / Eco-Packaging — copy tomada literal del mockup
 * `knowledge/stitch_modern_paws_market/inicio_bamzuk_bienestar/code.html`.
 */
export default function ValuesSection({ t }: ValuesSectionProps) {
  const values = [
    { key: 'organic', Icon: EcoIcon },
    { key: 'clinical', Icon: ScienceIcon },
    { key: 'packaging', Icon: PackagingIcon },
  ] as const

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
      {values.map(({ key, Icon }) => (
        <div key={key} className="text-center">
          <Icon className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h3 className="font-heading text-xl font-semibold text-foreground">
            {t(`values.${key}.title`)}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{t(`values.${key}.description`)}</p>
        </div>
      ))}
    </div>
  )
}
