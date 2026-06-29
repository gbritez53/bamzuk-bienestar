import { getTranslations } from 'next-intl/server'
import { verifySumUpPayment, createDropeaOrder } from '../actions'

export default async function ConfirmacionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ id?: string }>
}) {
  const { locale } = await params
  const { id: checkoutId } = await searchParams
  const t = await getTranslations({ locale, namespace: 'common' })

  if (!checkoutId) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-red-600">No se encontró el pago.</p>
      </main>
    )
  }

  let paymentStatus = 'UNKNOWN'
  let orderId: string | null = null
  let errorMessage: string | null = null

  try {
    const { status } = await verifySumUpPayment(checkoutId)
    paymentStatus = status

    if (status === 'PAID') {
      // Items are not available server-side (Zustand is client-only).
      // Dropea order creation with full items is deferred to Phase 8 (webhooks).
      // DROPEA_SHOP_ID guard handles missing shop gracefully.
      const result = await createDropeaOrder({
        items: [],
        customer: {
          name: '',
          email: '',
          address: { line: '', city: '', postalCode: '', country: 'ES' },
        },
        locale,
        sumupCheckoutId: checkoutId,
      })
      orderId = result.orderId
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'Error desconocido'
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      {paymentStatus === 'PAID' ? (
        <div className="space-y-4">
          <div className="text-4xl">&#10003;</div>
          <h1 className="text-2xl font-bold text-gray-900">¡Pago confirmado!</h1>
          {orderId && (
            <p className="text-sm text-gray-500">Pedido: {orderId}</p>
          )}
        </div>
      ) : errorMessage ? (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-red-600">{t('error')}</h1>
          <p className="text-sm text-gray-500">{errorMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Estado del pago: {paymentStatus}
          </h1>
          <p className="text-sm text-gray-500">
            Si acabas de pagar, espera unos segundos y recarga la página.
          </p>
        </div>
      )}
    </main>
  )
}
