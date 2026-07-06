import Image from 'next/image'
import Link from 'next/link'

interface HomeHeroProps {
  locale: string
  t: (key: string) => string
}

/**
 * Hero de Home rebrandeado — sin las 3 imágenes PNG de mascotas del sitio
 * anterior. `banner_bienestar.png` tiene fondo transparente (confirmado con
 * `sips -g all`) y ya trae su propia tarjeta redondeada anclada a la derecha
 * del canvas, por eso `object-contain` + `object-right` alcanza sin recortar
 * ni necesitar processing adicional.
 */
export default function HomeHero({ locale, t }: HomeHeroProps) {
  const catalogHref = `/${locale}/productos`

  return (
    <section className="relative flex min-h-[420px] flex-col justify-center overflow-hidden rounded-2xl bg-secondary-light/40 shadow-[var(--shadow-md)] md:min-h-[500px]">
      <div className="hero-gradient absolute inset-0" aria-hidden="true" />
      <Image
        src="/banner_bienestar.png"
        alt={t('imageAlt')}
        fill
        priority
        sizes="100vw"
        className="object-contain object-right"
      />
      <div className="relative z-10 max-w-xl space-y-5 p-8 sm:p-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-4 py-1.5 text-xs font-bold tracking-wide text-primary uppercase">
          {t('badge')}
        </span>
        <h1 className="font-heading text-4xl leading-tight font-bold text-foreground sm:text-5xl">
          {t('title')}
        </h1>
        <p className="max-w-md text-base text-muted-foreground sm:text-lg">{t('subtitle')}</p>
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            href={catalogHref}
            className="inline-flex items-center rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
          >
            {t('cta')}
          </Link>
          <Link
            href={catalogHref}
            className="inline-flex items-center rounded-xl border border-border px-7 py-3.5 text-sm font-bold text-primary transition-colors hover:bg-muted"
          >
            {t('ctaSecondary')}
          </Link>
        </div>
      </div>
    </section>
  )
}
