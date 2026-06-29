import type { Metadata } from 'next'
import { nichoConfig } from '../../../../../nicho.config'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const siteUrl = nichoConfig.domain
  const title = `Política de Cookies — ${nichoConfig.name}`

  return {
    title,
    description:
      'Información sobre el uso de cookies en cumplimiento del RGPD y la LSSI.',
    alternates: {
      canonical: `${siteUrl}/${locale}/cookies`,
    },
  }
}

export default async function CookiesPage({ params }: PageProps) {
  const { locale } = await params

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Política de Cookies — ${nichoConfig.name}`,
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
        {locale === 'pt' ? 'Política de Cookies' : 'Política de Cookies'}
      </h1>

      {locale === 'pt' ? (
        <div className="prose prose-sm max-w-none space-y-4 text-gray-700">
          <p><strong>Última atualização:</strong> Junho de 2026</p>

          <h2 className="text-lg font-semibold text-gray-900">O que são Cookies?</h2>
          <p>
            Cookies são pequenos ficheiros de texto que são armazenados no seu dispositivo
            quando visita um site. São amplamente utilizados para fazer os sites funcionar
            de forma mais eficiente e fornecer informações aos proprietários do site.
          </p>

          <h2 className="text-lg font-semibold text-gray-900">Tipos de Cookies Utilizados</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Cookies Técnicos (necessários):</strong> Permitem a navegação e utilização
              das funcionalidades básicas do site, como o carrinho de compras. Não requerem
              consentimento.
            </li>
            <li>
              <strong>Cookies de Preferências:</strong> Permitem recordar as suas preferências
              (idioma, moeda) para melhorar a sua experiência.
            </li>
            <li>
              <strong>Cookies de Análise:</strong> Recolhem informação anónima sobre como os
              visitantes utilizam o site para melhorar o seu funcionamento.
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900">Gestão de Cookies</h2>
          <p>
            Pode configurar e gerir o uso de cookies através das definições do seu navegador.
            A desativação de cookies pode afetar o funcionamento de algumas partes do site.
          </p>
          <p>
            Também pode gerir as suas preferências de cookies através do banner de cookies
            apresentado na sua primeira visita ao site.
          </p>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none space-y-4 text-gray-700">
          <p><strong>Última actualización:</strong> Junio de 2026</p>

          <h2 className="text-lg font-semibold text-gray-900">¿Qué son las Cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en su dispositivo
            cuando visita un sitio web. Se utilizan ampliamente para hacer que los sitios web
            funcionen de manera más eficiente y proporcionar información a los propietarios
            del sitio.
          </p>

          <h2 className="text-lg font-semibold text-gray-900">Tipos de Cookies Utilizadas</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Cookies Técnicas (necesarias):</strong> Permiten la navegación y
              utilización de las funcionalidades básicas del sitio, como el carrito de compras.
              No requieren consentimiento.
            </li>
            <li>
              <strong>Cookies de Preferencias:</strong> Permiten recordar sus preferencias
              (idioma, moneda) para mejorar su experiencia.
            </li>
            <li>
              <strong>Cookies de Análisis:</strong> Recogen información anónima sobre cómo los
              visitantes utilizan el sitio para mejorar su funcionamiento.
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900">Gestión de Cookies</h2>
          <p>
            Puede configurar y gestionar el uso de cookies a través de la configuración de su
            navegador. La desactivación de cookies puede afectar al funcionamiento de algunas
            partes del sitio web.
          </p>
          <p>
            También puede gestionar sus preferencias de cookies a través del banner de cookies
            que se muestra en su primera visita al sitio web.
          </p>
        </div>
      )}
    </main>
  )
}
