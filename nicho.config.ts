export const nichoConfig = {
  name: process.env['NEXT_PUBLIC_SITE_NAME'] ?? 'Bamzuk Mascotas',
  domain: process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000',
  logo: '/logo-hz.png',
  locale: (process.env['NEXT_PUBLIC_LOCALE'] ?? 'es') as 'es' | 'pt',
  colors: {
    // OJO: estos 3 valores se inyectan en runtime como override de
    // `:root` en src/app/layout.tsx (nichoStyle), así que DEBEN coincidir
    // con los tokens base definidos en src/app/globals.css o se pisan
    // entre sí. El amarillo de marca (#F6CF65) NO va acá: se usa solo
    // como `--primary-light` (fondos/botones/badges) en globals.css,
    // porque como color de TEXTO no cumple contraste WCAG. Acá `primary`
    // es el dorado oscuro que sí funciona como texto/estado activo.
    primary: '#755B00',
    secondary: '#2D3436',
    accent: '#FFFFFF',
  },
  font: 'Plus Jakarta Sans',
  // Categoría del nicho para filtrar productos desde la API de Dropea
  // (proveedor único de catálogo y fulfillment de esta tienda).
  // Si se setea, SOLO se muestran productos de esa categoría (el nombre
  // debe coincidir EXACTO con el que devuelve Dropea en `category`).
  // Vacío ('') = mostrar todo el catálogo sin filtrar.
  category: process.env['NICHO_CATEGORY'] ?? 'Productos para mascotas',
} as const

export type NichoConfig = typeof nichoConfig
