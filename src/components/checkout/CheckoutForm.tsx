'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useCartStore } from '@/hooks/useCart'
import {
  createSumUpCheckout,
  saveCheckoutPayload,
  generateOrderReference,
} from '@/app/[locale]/checkout/actions'
import { calcularEnvio, calcularPesoEfectivo, getZoneFromCountry, DEFAULT_SHIPPING_SERVICE } from '@/lib/shipping'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

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

        const name = formData.get('name') as string
        const email = formData.get('email') as string
        const address = formData.get('address') as string
        const city = formData.get('city') as string
        const postalCode = formData.get('postalCode') as string
        const country = formData.get('country') as 'ES' | 'PT'

        if (!name || !email || !address || !city || !postalCode) {
          setError('Completá todos los campos obligatorios')
          return
        }

        const reference = await generateOrderReference()

        // 1. Guardar payload ANTES de ir a SumUp
        await saveCheckoutPayload({
          reference,
          items,
          customer: { name, email, address: { line: address, city, postalCode, country } },
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
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground">
              {t('name')}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder={t('name')}
              className={fieldClass}
            />
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
        {isPending ? t('processing') : `${t('pay') || 'Pagar'} — ${totalEur.toLocaleString(locale === 'pt' ? 'pt-PT' : 'es-ES', { style: 'currency', currency: 'EUR' })}`}
      </Button>
    </form>
  )
}
