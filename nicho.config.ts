export const nichoConfig = {
  name: process.env['NEXT_PUBLIC_SITE_NAME'] ?? 'Mi Tienda',
  domain: process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000',
  logo: '/logo.svg',
  locale: (process.env['NEXT_PUBLIC_LOCALE'] ?? 'es') as 'es' | 'pt',
  colors: {
    primary: '#000000',
    secondary: '#1D3557',
    accent: '#f5f5f5',
  },
  font: 'Inter',
} as const

export type NichoConfig = typeof nichoConfig
