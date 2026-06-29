import type { Metadata } from 'next'
import { nichoConfig } from '../../../../../nicho.config'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const siteUrl = nichoConfig.domain
  const title = `Política de Devoluciones — ${nichoConfig.name}`

  return {
    title,
    description:
      'Política de devoluciones y derecho de desistimiento de 14 días según la normativa UE.',
    alternates: {
      canonical: `${siteUrl}/${locale}/devoluciones`,
    },
  }
}

export default async function DevolucionesPage({ params }: PageProps) {
  const { locale } = await params

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Política de Devoluciones — ${nichoConfig.name}`,
    isPartOf: {
      '@type': 'OnlineStore',
      name: nichoConfig.name,
      url: nichoConfig.domain,
    },
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {locale === 'pt' ? 'Política de Devoluções' : 'Política de Devoluciones'}
      </h1>

      {locale === 'pt' ? (
        <div className="prose prose-sm max-w-none space-y-4 text-gray-700">
          <p><strong>Última atualização:</strong> Junho de 2026</p>

          <h2 className="text-lg font-semibold text-gray-900">Direito de Desistimento</h2>
          <p>
            De acordo com a Diretiva Europeia 2011/83/UE, o consumidor tem direito a desistir
            da compra no prazo de <strong>14 dias</strong> a contar da data de receção do
            produto, sem necessidade de indicar o motivo.
          </p>

          <h2 className="text-lg font-semibold text-gray-900">Como Exercer o Direito</h2>
          <p>
            Para exercer o direito de desistimento, deve comunicar-nos a sua decisão através
            do e-mail [Email de contacto] ou através do formulário de contacto do site.
          </p>

          <h2 className="text-lg font-semibold text-gray-900">Condições da Devolução</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>O produto deve estar em perfeito estado, sem sinais de uso</li>
            <li>Deve ser devolvido na sua embalagem original</li>
            <li>Os custos diretos de devolução são da responsabilidade do cliente</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900">Reembolso</h2>
          <p>
            O reembolso será processado no prazo máximo de <strong>14 dias</strong> após
            recebermos o produto devolvido ou após recebermos prova de envio do mesmo.
            O reembolso será efetuado através do mesmo método de pagamento utilizado na compra.
          </p>

          <h2 className="text-lg font-semibold text-gray-900">Exceções</h2>
          <p>Não se aplica o direito de desistimento a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Produtos personalizados ou feitos por medida</li>
            <li>Produtos selados que não possam ser devolvidos por razões de proteção da saúde</li>
            <li>Produtos que se deterioram rapidamente</li>
          </ul>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none space-y-4 text-gray-700">
          <p><strong>Última actualización:</strong> Junio de 2026</p>

          <h2 className="text-lg font-semibold text-gray-900">Derecho de Desistimiento</h2>
          <p>
            De acuerdo con la Directiva Europea 2011/83/UE, el consumidor tiene derecho a desistir
            de la compra en un plazo de <strong>14 días</strong> desde la fecha de recepción del
            producto, sin necesidad de indicar el motivo.
          </p>

          <h2 className="text-lg font-semibold text-gray-900">Cómo Ejercer el Derecho</h2>
          <p>
            Para ejercer el derecho de desistimiento, debe comunicarnos su decisión a través
            del correo electrónico [Email de contacto] o mediante el formulario de contacto
            del sitio web.
          </p>

          <h2 className="text-lg font-semibold text-gray-900">Condiciones de la Devolución</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>El producto debe estar en perfecto estado, sin muestras de uso</li>
            <li>Debe devolverse en su embalaje original</li>
            <li>Los costes directos de devolución corren a cargo del cliente</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900">Reembolso</h2>
          <p>
            El reembolso se procesará en un plazo máximo de <strong>14 días</strong> desde
            que recibamos el producto devuelto o desde que recibamos una prueba de envío del
            mismo. El reembolso se efectuará mediante el mismo método de pago utilizado en la
            compra.
          </p>

          <h2 className="text-lg font-semibold text-gray-900">Excepciones</h2>
          <p>No se aplica el derecho de desistimiento a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Productos personalizados o hechos a medida</li>
            <li>Productos sellados que no puedan devolverse por razones de protección de la salud</li>
            <li>Productos que se deterioran rápidamente</li>
          </ul>
        </div>
      )}
    </main>
  )
}
