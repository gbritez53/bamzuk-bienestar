'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useCartStore } from '@/hooks/useCart'
import {
  createSumUpCheckout,
  generateOrderReference,
} from '@/app/[locale]/checkout/actions'

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
        const reference = generateOrderReference()
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

        // Build SumUp hosted checkout URL with encoded return URL that includes checkoutId
        const encodedReturn = encodeURIComponent(`${returnUrl}?id=${checkoutId}`)
        window.location.href = `https://checkout.sumup.com/?checkout_id=${checkoutId}&return_url=${encodedReturn}`
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al procesar el pago',
        )
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            {t('name')}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            aria-label={t('name')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            {t('email')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            aria-label={t('email')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            {t('address')}
          </label>
          <input
            id="address"
            name="address"
            type="text"
            required
            aria-label={t('address')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700"
            >
              {t('city')}
            </label>
            <input
              id="city"
              name="city"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="postalCode"
              className="block text-sm font-medium text-gray-700"
            >
              {t('postalCode')}
            </label>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700"
          >
            {t('country')}
          </label>
          <select
            id="country"
            name="country"
            defaultValue={locale === 'pt' ? 'PT' : 'ES'}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
          >
            <option value="ES">España</option>
            <option value="PT">Portugal</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending || items.length === 0}
        aria-label={t('pay')}
        className="w-full rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? t('processing') : t('pay')}
      </button>
    </form>
  )
}
