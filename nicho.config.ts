export const nichoConfig = {
  name: process.env['NEXT_PUBLIC_SITE_NAME'] ?? 'Mi Tienda',
  domain: process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000',
  logo: '/logo.svg',
  locale: (process.env['NEXT_PUBLIC_LOCALE'] ?? 'es') as 'es' | 'pt',
  colors: {
    primary: '#7C3AED',
    secondary: '#0EA5E9',
    accent: '#F0FDF4',
  },
  font: 'Inter',
  // Categoría del nicho para filtrar productos desde la API de Dropea.
  // Si se setea, SOLO se muestran productos de esta categoría.
  // Dejalo vacío ('') para mostrar todos los productos.
  // Ej: 'Electrónica', 'Hogar', 'Juguetes', etc.
  category: process.env['NICHO_CATEGORY'] ?? 'Electrónica',
} as const

export type NichoConfig = typeof nichoConfig
