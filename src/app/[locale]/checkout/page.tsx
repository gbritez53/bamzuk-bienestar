import { getTranslations } from 'next-intl/server'
import CheckoutForm from '@/components/checkout/CheckoutForm'

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'checkout' })

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">{t('title')}</h1>
      <CheckoutForm locale={locale} />
    </main>
  )
}
