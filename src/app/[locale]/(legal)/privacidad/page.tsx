import type { Metadata } from 'next'
import { nichoConfig } from '../../../../../nicho.config'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const siteUrl = nichoConfig.domain
  const title = `Política de Privacidad — ${nichoConfig.name}`

  return {
    title,
    description: 'Política de privacidad y tratamiento de datos personales según el RGPD.',
    alternates: {
      canonical: `${siteUrl}/${locale}/privacidad`,
    },
  }
}

export default async function PrivacidadPage({ params }: PageProps) {
  const { locale } = await params

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Política de Privacidad — ${nichoConfig.name}`,
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
        {locale === 'pt' ? 'Política de Privacidade' : 'Política de Privacidad'}
      </h1>

      {locale === 'pt' ? (
        <div className="prose prose-sm max-w-none space-y-4 text-gray-700">
          <p><strong>Última atualização:</strong> Junho de 2026</p>

          <h2 className="text-lg font-semibold text-gray-900">1. Responsável pelo Tratamento</h2>
          <p>
            O responsável pelo tratamento dos dados pessoais recolhidos neste site é{' '}
            {nichoConfig.name}, com endereço em [Endereço do titular] e e-mail de contacto
            [Email de contacto].
          </p>

          <h2 className="text-lg font-semibold text-gray-900">2. Dados Recolhidos</h2>
          <p>Recolhemos os seguintes dados pessoais:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Dados de identificação:</strong> nome, e-mail, morada, telefone</li>
            <li><strong>Dados de navegação:</strong> endereço IP, tipo de navegador, páginas visitadas</li>
            <li><strong>Dados de compra:</strong> produtos adquiridos, montante, data da compra</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900">3. Finalidade do Tratamento</h2>
          <p>Os seus dados são tratados para as seguintes finalidades:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Gestão e processamento de pedidos</li>
            <li>Comunicações relacionadas com a sua compra</li>
            <li>Cumprimento de obrigações legais (fiscais, contabilísticas)</li>
            <li>Melhoria da experiência de navegação</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900">4. Base Legal</h2>
          <p>
            O tratamento dos seus dados baseia-se na execução de um contrato (compra de produtos),
            no cumprimento de obrigações legais e, quando aplicável, no seu consentimento explícito.
          </p>

          <h2 className="text-lg font-semibold text-gray-900">5. Prazo de Conservação</h2>
          <p>
            Os dados serão conservados durante o período necessário para cumprir as finalidades
            descritas e, em qualquer caso, durante os prazos legais estabelecidos (nomeadamente
            4 anos para dados fiscais e contabilísticos).
          </p>

          <h2 className="text-lg font-semibold text-gray-900">6. Direitos do Utilizador</h2>
          <p>De acordo com o RGPD, pode exercer os seguintes direitos:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Acesso:</strong> saber que dados tratamos</li>
            <li><strong>Retificação:</strong> solicitar correção de dados inexatos</li>
            <li><strong>Eliminação:</strong> solicitar a eliminação dos seus dados</li>
            <li><strong>Limitação:</strong> solicitar a limitação do tratamento</li>
            <li><strong>Portabilidade:</strong> receber os seus dados noutro formato</li>
            <li><strong>Oposição:</strong> opor-se ao tratamento dos seus dados</li>
          </ul>
          <p>
            Para exercer os seus direitos, contacte-nos através do e-mail [Email de contacto].
          </p>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none space-y-4 text-gray-700">
          <p><strong>Última actualización:</strong> Junio de 2026</p>

          <h2 className="text-lg font-semibold text-gray-900">1. Responsable del Tratamiento</h2>
          <p>
            El responsable del tratamiento de los datos personales recogidos en este sitio web es{' '}
            {nichoConfig.name}, con domicilio en [Dirección del titular] y correo electrónico
            de contacto [Email de contacto].
          </p>

          <h2 className="text-lg font-semibold text-gray-900">2. Datos Recogidos</h2>
          <p>Recogemos los siguientes datos personales:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Datos de identificación:</strong> nombre, email, dirección, teléfono</li>
            <li><strong>Datos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas</li>
            <li><strong>Datos de compra:</strong> productos adquiridos, importe, fecha de compra</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900">3. Finalidad del Tratamiento</h2>
          <p>Sus datos se tratan para las siguientes finalidades:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Gestión y procesamiento de pedidos</li>
            <li>Comunicaciones relacionadas con su compra</li>
            <li>Cumplimiento de obligaciones legales (fiscales, contables)</li>
            <li>Mejora de la experiencia de navegación</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900">4. Base Legal</h2>
          <p>
            El tratamiento de sus datos se basa en la ejecución de un contrato (compra de productos),
            en el cumplimiento de obligaciones legales y, cuando corresponda, en su consentimiento
            explícito.
          </p>

          <h2 className="text-lg font-semibold text-gray-900">5. Plazo de Conservación</h2>
          <p>
            Los datos se conservarán durante el período necesario para cumplir las finalidades
            descritas y, en cualquier caso, durante los plazos legales establecidos
            (especialmente 4 años para datos fiscales y contables).
          </p>

          <h2 className="text-lg font-semibold text-gray-900">6. Derechos del Usuario</h2>
          <p>Según el RGPD, puede ejercer los siguientes derechos:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Acceso:</strong> saber qué datos tratamos</li>
            <li><strong>Rectificación:</strong> solicitar corrección de datos inexactos</li>
            <li><strong>Supresión:</strong> solicitar la eliminación de sus datos</li>
            <li><strong>Limitación:</strong> solicitar la limitación del tratamiento</li>
            <li><strong>Portabilidad:</strong> recibir sus datos en otro formato</li>
            <li><strong>Oposición:</strong> oponerse al tratamiento de sus datos</li>
          </ul>
          <p>
            Para ejercer sus derechos, contáctenos a través del email [Email de contacto].
          </p>
        </div>
      )}
    </main>
  )
}
