export const nichoConfig = {
  name: process.env['NEXT_PUBLIC_SITE_NAME'] ?? 'Bamzuk Bienestar',
  domain: process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000',
  logo: '/logo.png',
  locale: (process.env['NEXT_PUBLIC_LOCALE'] ?? 'es') as 'es' | 'pt',
  colors: {
    // OJO: estos 3 valores se inyectan en runtime como override de
    // `:root` en src/app/layout.tsx (nichoStyle), así que DEBEN coincidir
    // con los tokens base definidos en src/app/globals.css o se pisan
    // entre sí. Paleta "Minimalist Apothecary" (verde): `primary` es el
    // verde principal (WCAG-AA sobre blanco/#f5fbf0), `secondary` es el
    // sage oscuro para acentos de alto contraste.
    primary: '#1d6d00',
    secondary: '#51634e',
    accent: '#FFFFFF',
  },
  font: 'Plus Jakarta Sans',
  // Categoría(s) del nicho para filtrar productos desde la API de Dropea
  // (proveedor único de catálogo y fulfillment de esta tienda).
  // Acepta una o varias categorías separadas por coma (match EXACTO,
  // case-insensitive, contra el campo `category` de Dropea — ver
  // `scanCatalogByCategory` en src/lib/dropea/products.ts).
  // Vacío ('') = mostrar todo el catálogo sin filtrar.
  //
  // Verificado contra la API viva de Dropea (2026-07-06): NO existe una
  // categoría combinada "Salud y cuidado personal, belleza" — son DOS
  // categorías reales separadas: "Belleza" (961 productos, 858 vendibles)
  // y "Salud y cuidado personal" (634 productos, 388 vendibles). El string
  // original con coma se reinterpreta como lista de 2 categorías, no un
  // literal — de ahí el soporte multi-categoría por coma.
  // NOTA: `NICHO_CATEGORY` debe documentarse en `.env.example` (el
  // sandbox de esta sesión bloqueó la escritura directa sobre ese archivo).
  category: process.env['NICHO_CATEGORY'] ?? 'Salud y cuidado personal,Belleza',
} as const

export type NichoConfig = typeof nichoConfig
