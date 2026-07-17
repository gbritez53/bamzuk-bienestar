'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useCartStore } from '@/hooks/useCart'
import {
  createSumUpCheckout,
  saveCheckoutPayload,
  generateOrderReference,
  createCodOrder,
  notifyOrderPlacedAction,
} from '@/app/[locale]/checkout/actions'
import { calcularEnvio, calcularPesoEfectivo, getZoneFromCountry, DEFAULT_SHIPPING_SERVICE } from '@/lib/shipping'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { normalizeLocale } from '@/lib/email/shell'

interface CheckoutFormProps {
  locale: string
}

export default function CheckoutForm({ locale }: CheckoutFormProps) {
  const t = useTranslations('checkout')
  const [isPending, startTransition] = useTransition()
  const items = useCartStore(s => s.items)
  const subtotalCents = useCartStore(s => s.subtotalCents)
  const clearCart = useCartStore(s => s.clearCart)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'sumup' | 'cod'>('sumup')

  // Calcular envío
  const effectiveWeight = calcularPesoEfectivo(items)
  const zone = getZoneFromCountry(locale === 'pt' ? 'PT' : 'ES')
  const shippingRate = calcularEnvio(effectiveWeight, DEFAULT_SHIPPING_SERVICE, zone)
  const shippingEur = shippingRate.costEur
  const totalEur = subtotalCents / 100 + shippingEur

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    startTransition(async () => {
      try {
        setError(null)
        const form = e.currentTarget
        const formData = new FormData(form)

        const firstName = formData.get('firstName') as string
        const lastName = formData.get('lastName') as string
        const email = formData.get('email') as string
        const phone = formData.get('phone') as string
        const address = formData.get('address') as string
        const city = formData.get('city') as string
        const postalCode = formData.get('postalCode') as string
        const country = formData.get('country') as 'ES' | 'PT'

        if (!firstName || !lastName || !email || !phone || !address || !city || !postalCode) {
          setError('Completá todos los campos obligatorios')
          return
        }

        const customer = {
          firstName,
          lastName,
          email,
          phone,
          address: { line: address, city, postalCode, country },
        }

        // Contrareembolso: no pasa por SumUp — la orden se crea directa
        // en Dropea y el cliente paga al recibir
        if (paymentMethod === 'cod') {
          const { orderId, reference: codRef } = await createCodOrder({
            items,
            customer,
            locale,
            shippingEur,
          })

          try {
            await notifyOrderPlacedAction({
              orderId,
              reference: codRef,
              locale: normalizeLocale(locale),
              customer,
              items,
              paymentMethod: 'CASH_ON_DELIVERY',
              subtotalCents,
              shippingEur,
            })
          } catch (e) {
            // La orden ya se creó en Dropea: un fallo de notificación NUNCA
            // debe setError (reintentar duplicaría el pedido).
            console.error('[checkout-cod] notification failed:', e)
          }

          clearCart()
          window.location.href = `/${locale}/checkout/confirmacion?cod=1&order=${encodeURIComponent(orderId)}&ref=${encodeURIComponent(codRef)}`
          return
        }

        const reference = await generateOrderReference()

        // 1. Guardar payload ANTES de ir a SumUp
        await saveCheckoutPayload({
          reference,
          items,
          customer,
          locale,
          subtotalCents,
          shippingEur,
        })

        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
        const returnUrl = `${siteUrl}/${locale}/checkout/confirmacion`

        // 2. Crear checkout en SumUp
        const { checkoutId } = await createSumUpCheckout({
          amountEur: totalEur,
          reference,
          description: `Pedido ${reference}`,
          returnUrl,
        })

        // 3. Limpiar carrito (los datos ya están guardados server-side)
        clearCart()

        // 4. Redirigir a SumUp
        const encodedReturn = encodeURIComponent(
          `${returnUrl}?id=${checkoutId}&ref=${reference}`,
        )
        window.location.href = `https://checkout.sumup.com/?checkout_id=${checkoutId}&return_url=${encodedReturn}`
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al procesar el pago',
        )
      }
    })
  }

  const fieldClass =
    'mt-1 block w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-foreground">
          {t('billingDetails') || 'Datos de facturación'}
        </h2>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-foreground">
                {t('firstName')}
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                autoComplete="given-name"
                placeholder={t('firstName')}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-foreground">
                {t('lastName')}
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                autoComplete="family-name"
                placeholder={t('lastName')}
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              {t('email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder={t('email')}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground">
              {t('phone')}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="+34 600 000 000"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-foreground">
              {t('address')}
            </label>
            <input
              id="address"
              name="address"
              type="text"
              required
              placeholder={t('address')}
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-foreground">
                {t('city')}
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                placeholder={t('city')}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-foreground">
                {t('postalCode')}
              </label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                required
                placeholder={t('postalCode')}
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-foreground">
              {t('country')}
            </label>
            <select
              id="country"
              name="country"
              defaultValue={locale === 'pt' ? 'PT' : 'ES'}
              className={fieldClass}
            >
              <option value="ES">España</option>
              <option value="PT">Portugal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen para confirmación visual */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          {locale === 'pt' ? 'Resumo do pedido' : 'Resumen del pedido'}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('subtotal') || 'Subtotal'}</span>
            <span className="font-medium text-foreground">
              {(subtotalCents / 100).toLocaleString(locale === 'pt' ? 'pt-PT' : 'es-ES', {
                style: 'currency', currency: 'EUR',
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('shipping') || 'Envío'}</span>
            <span className="font-medium text-foreground">
              {shippingEur.toLocaleString(locale === 'pt' ? 'pt-PT' : 'es-ES', {
                style: 'currency', currency: 'EUR',
              })}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span className="text-foreground">{t('total') || 'Total'}</span>
            <span className="text-primary">
              {totalEur.toLocaleString(locale === 'pt' ? 'pt-PT' : 'es-ES', {
                style: 'currency', currency: 'EUR',
              })}
            </span>
          </div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          {items.length} {items.length === 1 ? 'producto' : 'productos'} ·{' '}
          {items.reduce((s, i) => s + i.quantity, 0)} {locale === 'pt' ? 'unidades' : 'unidades'}
        </div>
      </div>

      {/* Método de pago */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          {t('paymentMethod')}
        </h3>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3.5 text-sm transition-colors has-checked:border-primary has-checked:bg-primary-light/30">
            <input
              type="radio"
              name="paymentMethod"
              value="sumup"
              checked={paymentMethod === 'sumup'}
              onChange={() => setPaymentMethod('sumup')}
              className="h-4 w-4 accent-primary"
            />
            <span className="font-medium text-foreground">{t('payCard')}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3.5 text-sm transition-colors has-checked:border-primary has-checked:bg-primary-light/30">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={() => setPaymentMethod('cod')}
              className="h-4 w-4 accent-primary"
            />
            <span className="font-medium text-foreground">{t('payCod')}</span>
          </label>
        </div>
      </div>

      <Separator />

      {error && (
        <div className="rounded-lg bg-destructive-light p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending || items.length === 0}
        className="w-full py-3.5 text-base"
      >
        {isPending
          ? t('processing')
          : `${paymentMethod === 'cod' ? t('confirmOrder') : t('pay')} — ${totalEur.toLocaleString(locale === 'pt' ? 'pt-PT' : 'es-ES', { style: 'currency', currency: 'EUR' })}`}
      </Button>
    </form>
  )
}
