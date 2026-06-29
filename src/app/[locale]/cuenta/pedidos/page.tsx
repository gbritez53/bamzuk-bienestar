import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getDropeaClient } from '@/lib/dropea/client'
import { LIST_ORDERS_QUERY } from '@/lib/dropea/queries/orders'
import { nichoConfig } from '../../../../../nicho.config'
import type { DropeaRawOrderPagination } from '@/lib/dropea/types'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params
  const siteUrl = nichoConfig.domain

  return {
    title: `Mis pedidos — ${nichoConfig.name}`,
    alternates: {
      canonical: `${siteUrl}/${locale}/cuenta/pedidos`,
    },
  }
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  incident: 'Incidencia',
  cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  incident: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

export default async function PedidosPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const { page: pageStr } = await searchParams
  const currentPage = parseInt(pageStr ?? '1', 10) || 1
  const t = await getTranslations({ locale, namespace: 'orders' })

  let orders: DropeaRawOrderPagination['data'] = []
  let total = 0
  let lastPage = 1
  let error: string | null = null

  try {
    const client = getDropeaClient()
    const data = await client.request<{ orders: DropeaRawOrderPagination }>(
      LIST_ORDERS_QUERY,
      { page: currentPage, limit: 20 },
    )
    orders = data.orders.data
    total = data.orders.total
    lastPage = data.orders.last_page ?? 1
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error al cargar pedidos'
  }

  const fmt = (eur: number) =>
    eur.toLocaleString(locale === 'pt' ? 'pt-PT' : 'es-ES', {
      style: 'currency',
      currency: 'EUR',
    })

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">{t('title')}</h1>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500">{t('empty')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map(order => {
              const statusKey = order.status.toLowerCase()
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {t('orderId')}: {order.id}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString(
                        locale === 'pt' ? 'pt-PT' : 'es-ES',
                        { year: 'numeric', month: 'long', day: 'numeric' },
                      )}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[statusKey] ?? 'bg-gray-100 text-gray-800'}`}
                  >
                    {STATUS_LABELS[statusKey] ?? order.status}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Paginación */}
          {lastPage > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {currentPage > 1 && (
                <a
                  href={`/${locale}/cuenta/pedidos?page=${currentPage - 1}`}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
                >
                  Anterior
                </a>
              )}
              <span className="px-3 py-1 text-sm text-gray-500">
                {currentPage} / {lastPage}
              </span>
              {currentPage < lastPage && (
                <a
                  href={`/${locale}/cuenta/pedidos?page=${currentPage + 1}`}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
                >
                  Siguiente
                </a>
              )}
            </div>
          )}
        </>
      )}
    </main>
  )
}
