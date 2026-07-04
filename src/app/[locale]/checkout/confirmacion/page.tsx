import { getTranslations } from 'next-intl/server'
import { verifySumUpPayment, createDropeaOrder } from '../actions'
import { checkoutStore } from '@/lib/webhooks/checkout-store'

export default async function ConfirmacionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ id?: string; ref?: string; cod?: string; order?: string }>
}) {
  const { locale } = await params
  const { id: checkoutId, ref, cod, order } = await searchParams
  const t = await getTranslations({ locale, namespace: 'common' })

  // Contrareembolso: la orden ya se creó en Dropea desde el form,
  // acá solo confirmamos visualmente
  if (cod === '1' && order) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-8 w-8 text-success"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            {locale === 'pt' ? 'Pedido confirmado!' : '¡Pedido confirmado!'}
          </h1>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">
              {locale === 'pt' ? 'Pedido' : 'Pedido'}
            </p>
            <p className="mt-1 font-mono text-sm font-medium text-foreground">
              {ref ? `${ref} · ` : ''}{order}
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            {locale === 'pt'
              ? 'Pagará em dinheiro ao receber a sua encomenda. Receberá um e-mail com os detalhes de envio.'
              : 'Vas a pagar en efectivo al recibir tu pedido. Te va a llegar un email con los detalles de envío.'}
          </p>
        </div>
      </main>
    )
  }

  if (!checkoutId) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-destructive font-medium">No se encontró el pago.</p>
      </main>
    )
  }

  let paymentStatus = 'UNKNOWN'
  let orderId: string | null = null
  let errorMessage: string | null = null
  let customerName: string | null = null

  try {
    const { status } = await verifySumUpPayment(checkoutId)
    paymentStatus = status

    if (status === 'PAID') {
      // Recuperar payload guardado antes de redirigir a SumUp
      let payload = ref ? await checkoutStore.get(ref) : null

      if (payload) {
        const result = await createDropeaOrder({
          items: payload.items,
          customer: payload.customer,
          locale: payload.locale,
          sumupCheckoutId: checkoutId,
          reference: ref!,
          paymentMethod: 'PAID',
        })
        orderId = result.orderId
        customerName = payload.customer.firstName
        // Limpiar payload procesado
        await checkoutStore.delete(ref!)
      } else {
        // El payload pudo perderse por cold start de serverless
        // La orden se creará cuando llegue el webhook de SumUp
        orderId = `pending-${checkoutId.slice(0, 8)}`
      }
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'Error desconocido'
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      {paymentStatus === 'PAID' ? (
        <div className="space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-8 w-8 text-success"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            {locale === 'pt' ? 'Pagamento confirmado!' : '¡Pago confirmado!'}
          </h1>

          {customerName && (
            <p className="text-base text-muted-foreground">
              {locale === 'pt'
                ? `Obrigado, ${customerName}!`
                : `Gracias, ${customerName}!`}
            </p>
          )}

          {orderId && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">
                {locale === 'pt' ? 'Pedido' : 'Pedido'}
              </p>
              <p className="mt-1 font-mono text-sm font-medium text-foreground">{orderId}</p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            {locale === 'pt'
              ? 'Receberá um e-mail com a confirmação e os detalhes de envio.'
              : 'Vas a recibir un email con la confirmación y los detalles de envío.'}
          </p>
        </div>
      ) : errorMessage ? (
        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-8 w-8 text-destructive"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-destructive">{t('error')}</h1>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            Estado del pago: {paymentStatus}
          </h1>
          <p className="text-sm text-muted-foreground">
            {locale === 'pt'
              ? 'Se acabou de pagar, aguarde alguns segundos e recarregue a página.'
              : 'Si acabas de pagar, esperá unos segundos y recargá la página.'}
          </p>
        </div>
      )}
    </main>
  )
}
