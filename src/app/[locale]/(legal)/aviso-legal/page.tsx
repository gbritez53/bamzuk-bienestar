import type { Metadata } from 'next'
import { nichoConfig } from '../../../../../nicho.config'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const siteUrl = nichoConfig.domain
  const title = `Aviso Legal — ${nichoConfig.name}`

  return {
    title,
    description: 'Información legal, términos y condiciones de uso de la tienda online.',
    alternates: {
      canonical: `${siteUrl}/${locale}/aviso-legal`,
    },
  }
}

export default async function AvisoLegalPage({ params }: PageProps) {
  const { locale } = await params

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Aviso Legal — ${nichoConfig.name}`,
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
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Aviso Legal</h1>

      {locale === 'pt' ? (
        <div className="prose prose-sm max-w-none space-y-4 text-gray-700">
          <h2 className="text-lg font-semibold text-gray-900">Dados do Titular</h2>
          <p>
            Em cumprimento do dever de informação estabelecido na Lei 34/2002, de 11 de julho, de
            Serviços da Sociedade da Informação e de Comércio Eletrónico (LSSI-CE), os dados
            gerais do titular deste site são os seguintes:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Titular:</strong> {nichoConfig.name}</li>
            <li><strong>NIF/CIF:</strong> [Pendente de registo]</li>
            <li><strong>Endereço:</strong> [Endereço do titular]</li>
            <li><strong>E-mail:</strong> [E-mail de contacto]</li>
            <li><strong>Telefone:</strong> [Telefone de contacto]</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900">Propriedade Intelectual</h2>
          <p>
            Todos os conteúdos do site, incluindo design, textos, imagens, logótipos e código-fonte,
            são propriedade do titular ou têm licença de uso, estando protegidos pelas leis de
            propriedade intelectual e industrial.
          </p>

          <h2 className="text-lg font-semibold text-gray-900">Responsabilidade</h2>
          <p>
            O titular não se responsabiliza por danos ou prejuízos decorrentes do uso indevido
            dos conteúdos do site, nem por eventuais erros técnicos ou de segurança que possam
            ocorrer durante a navegação.
          </p>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none space-y-4 text-gray-700">
          <h2 className="text-lg font-semibold text-gray-900">Datos del Titular</h2>
          <p>
            En cumplimiento del deber de información establecido en la Ley 34/2002, de 11 de julio,
            de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), los
            datos generales del titular de este sitio web son los siguientes:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Titular:</strong> {nichoConfig.name}</li>
            <li><strong>NIF/CIF:</strong> [Pendiente de registro]</li>
            <li><strong>Dirección:</strong> [Dirección del titular]</li>
            <li><strong>Correo electrónico:</strong> [Email de contacto]</li>
            <li><strong>Teléfono:</strong> [Teléfono de contacto]</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900">Propiedad Intelectual</h2>
          <p>
            Todos los contenidos del sitio web, incluyendo diseño, textos, imágenes, logotipos y
            código fuente, son propiedad del titular o cuentan con licencia de uso, estando
            protegidos por las leyes de propiedad intelectual e industrial.
          </p>

          <h2 className="text-lg font-semibold text-gray-900">Responsabilidad</h2>
          <p>
            El titular no se hace responsable de los daños o perjuicios derivados del uso
            indebido de los contenidos del sitio web, ni de posibles errores técnicos o de
            seguridad que pudieran ocurrir durante la navegación.
          </p>
        </div>
      )}
    </main>
  )
}
