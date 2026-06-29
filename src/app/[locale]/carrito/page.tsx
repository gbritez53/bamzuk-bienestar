import { getTranslations } from 'next-intl/server'
import CartPageClient from '@/components/cart/CartPageClient'

export default async function CarritoPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'cart' })
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">{t('title')}</h1>
      <CartPageClient locale={locale} />
    </main>
  )
}
