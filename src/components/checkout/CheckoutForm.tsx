'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useCartStore } from '@/hooks/useCart'
import {
  createSumUpCheckout,
  generateOrderReference,
} from '@/app/[locale]/checkout/actions'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface CheckoutFormProps {
  locale: string
}

export default function CheckoutForm({ locale }: CheckoutFormProps) {
  const t = useTranslations('checkout')
  const [isPending, startTransition] = useTransition()
  const subtotalCents = useCartStore(s => s.subtotalCents)
  const items = useCartStore(s => s.items)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    startTransition(async () => {
      try {
        setError(null)
        const reference = await generateOrderReference()
        const amountEur = subtotalCents / 100
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
        const returnUrl = `${siteUrl}/${locale}/checkout/confirmacion`

        const { checkoutId } = await createSumUpCheckout({
          amountEur,
          reference,
          description: `Pedido ${reference}`,
          returnUrl,
        })

        const encodedReturn = encodeURIComponent(
          `${returnUrl}?id=${checkoutId}`,
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
          Datos de facturación
        </h2>
        <div className="grid gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground"
            >
              {t('name')}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder={t('name')}
              aria-label={t('name')}
              className={fieldClass}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              {t('email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder={t('email')}
              aria-label={t('email')}
              className={fieldClass}
            />
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-foreground"
            >
              {t('address')}
            </label>
            <input
              id="address"
              name="address"
              type="text"
              required
              placeholder={t('address')}
              aria-label={t('address')}
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-foreground"
              >
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
              <label
                htmlFor="postalCode"
                className="block text-sm font-medium text-foreground"
              >
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
            <label
              htmlFor="country"
              className="block text-sm font-medium text-foreground"
            >
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
        {isPending ? t('processing') : t('pay')}
      </Button>
    </form>
  )
}
