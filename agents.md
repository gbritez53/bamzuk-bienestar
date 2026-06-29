# Dropshipping Template — Agent Team

## Proyecto

Template de tienda dropshipping reutilizable por nicho. Construido con Next.js 15 + Dropea GraphQL API. Cada nicho se lanza clonando este repo y configurando variables de entorno + contenido.

## Stack confirmado

| Capa | Tecnología | Decisión |
|---|---|---|
| Framework | Next.js 15 App Router | SSR/SSG nativo, Server Actions, Route Handlers |
| Lenguaje | TypeScript | Tipado estricto |
| Estilos | Tailwind CSS v4 | Utility-first, fácil de tematizar por nicho |
| GraphQL client | graphql-request | Liviano, ideal para Server Components |
| Proveedor | Dropea API | `https://api.dropea.com/graphql/dropshippers` |
| Auth API | x-api-key header | Token desde Mi Cuenta → Access Tokens |
| Deploy | Vercel | CI/CD, previews, env vars por entorno |
| i18n | next-intl | Español (ES) + Portugués (PT) |

## Variables de entorno

```env
DROPEA_API_KEY=          # Token de Dropea (nunca commitear)
NEXT_PUBLIC_SITE_NAME=   # Nombre de la tienda por nicho
NEXT_PUBLIC_SITE_URL=    # URL pública (para SEO y OG)
NEXT_PUBLIC_LOCALE=      # es | pt
```

## Estructura del proyecto

```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx                  # Home
│   │   ├── productos/
│   │   │   ├── page.tsx              # Catálogo
│   │   │   └── [slug]/page.tsx       # Detalle de producto
│   │   ├── carrito/page.tsx          # Carrito
│   │   ├── checkout/page.tsx         # Checkout
│   │   ├── cuenta/
│   │   │   └── pedidos/page.tsx      # Historial de pedidos
│   │   └── (legal)/
│   │       ├── aviso-legal/page.tsx
│   │       ├── privacidad/page.tsx
│   │       ├── devoluciones/page.tsx
│   │       └── cookies/page.tsx
│   └── api/
│       └── webhooks/
│           └── dropea/route.ts       # Webhooks de Dropea
├── lib/
│   ├── dropea/
│   │   ├── client.ts                 # GraphQLClient configurado
│   │   ├── queries/
│   │   │   ├── products.ts
│   │   │   └── orders.ts
│   │   ├── mutations/
│   │   │   └── orders.ts
│   │   └── types.ts                  # Tipos generados del schema
├── components/
│   ├── ui/                           # shadcn/ui base
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   └── ProductDetail.tsx
│   ├── cart/
│   │   ├── CartDrawer.tsx
│   │   └── CartItem.tsx
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
├── hooks/
│   └── useCart.ts                    # Estado del carrito (Zustand)
├── messages/
│   ├── es.json                       # Traducciones español
│   └── pt.json                       # Traducciones portugués
└── middleware.ts                     # Routing de locales
```

---

## Agentes

### Orquestador principal

**Rol:** Coordina todos los sub-agentes. No escribe código de producto. Toma decisiones arquitecturales, resuelve conflictos entre dominios, y gestiona el flujo SDD (proposal → spec → design → tasks → apply → verify).

**Responsabilidades:**
- Recibir el requerimiento del usuario
- Delegar exploración y propuesta a los sub-agentes correspondientes
- Verificar que cada fase cumpla el contrato antes de avanzar
- Resolver dependencias entre dominios (ej: cart-agent necesita tipos de api-agent)

---

### Sub-agentes

#### `api-agent`
**Dominio:** Toda la integración con Dropea.

**Archivos que posee:**
- `src/lib/dropea/client.ts`
- `src/lib/dropea/queries/*.ts`
- `src/lib/dropea/mutations/*.ts`
- `src/lib/dropea/types.ts`

**Responsabilidades:**
- Configurar el GraphQLClient con autenticación `x-api-key`
- Escribir y tipar todas las queries (productos, órdenes, tienda)
- Escribir y tipar todas las mutations (OrderCreate, OrderCancel)
- Explorar el schema via introspección para descubrir campos disponibles
- Documentar los scopes necesarios por operación

**NO toca:** componentes, páginas, lógica de UI.

---

#### `catalog-agent`
**Dominio:** Catálogo de productos y páginas de detalle.

**Archivos que posee:**
- `src/app/[locale]/productos/**`
- `src/components/product/**`

**Responsabilidades:**
- Página de listado con filtros y paginación
- Página de detalle con galería, variantes, descripción
- Generación estática (SSG/ISR) de páginas de producto para SEO
- Integrar queries de `api-agent` (solo consume, no escribe queries)

**Depende de:** `api-agent` (tipos y queries de productos)

---

#### `cart-agent`
**Dominio:** Carrito de compras y flujo de checkout.

**Archivos que posee:**
- `src/app/[locale]/carrito/**`
- `src/app/[locale]/checkout/**`
- `src/components/cart/**`
- `src/hooks/useCart.ts`

**Responsabilidades:**
- Estado del carrito con Zustand (persistido en localStorage)
- Drawer de carrito accesible desde cualquier página
- Página de checkout con formulario de datos del cliente
- Server Action para crear la orden via `OrderCreate` mutation
- Validación de campos requeridos por Dropea (Customer, Country)

**Depende de:** `api-agent` (mutation OrderCreate y tipos)

---

#### `webhook-agent`
**Dominio:** Recepción y procesamiento de eventos de Dropea.

**Archivos que posee:**
- `src/app/api/webhooks/dropea/route.ts`

**Responsabilidades:**
- Route Handler POST para recibir webhooks de Dropea
- Verificación de autenticidad del webhook
- Procesamiento de eventos: cambio de estado de pedido, incidencias
- Actualización de estado de pedido en la UI (revalidación de caché)

**NO depende de otros agentes** — es un receptor de eventos.

---

#### `i18n-agent`
**Dominio:** Internacionalización ES/PT.

**Archivos que posee:**
- `src/messages/es.json`
- `src/messages/pt.json`
- `src/middleware.ts`
- Configuración de `next-intl`

**Responsabilidades:**
- Configurar routing por locale (`/es/...`, `/pt/...`)
- Traducir todos los textos de UI (botones, labels, mensajes de error)
- Adaptar formatos de fecha, moneda y número por locale
- Páginas legales en ambos idiomas (Aviso Legal, Privacidad, Devoluciones)

**Depende de:** todos los agentes (provee las claves de traducción que cada agente usa)

---

#### `seo-agent`
**Dominio:** Metadata, SEO técnico y structured data.

**Archivos que posee:**
- `generateMetadata` en cada página
- `src/app/sitemap.ts`
- `src/app/robots.ts`

**Responsabilidades:**
- Metadata dinámica por página (title, description, OG)
- Structured data (JSON-LD) para productos (Product schema)
- Sitemap dinámico generado desde el catálogo de Dropea
- robots.txt configurado para Vercel

**Depende de:** `api-agent` (datos de productos para metadata dinámica)

---

#### `ui-agent`
**Dominio:** Sistema de diseño y componentes compartidos.

**Archivos que posee:**
- `src/components/ui/**` (shadcn/ui)
- `src/components/layout/**`
- `tailwind.config.ts`
- Tokens de diseño (colores, tipografía, espaciado)

**Responsabilidades:**
- Setup de shadcn/ui con tema base
- Header con navegación y badge del carrito
- Footer con links legales
- Tokens de diseño fáciles de cambiar por nicho (CSS variables)
- Tema oscuro/claro opcional

**NO depende de otros agentes** — provee primitivas a todos.

---

## Skills

### `dropea-graphql`

**Cuándo aplicar:** cualquier agente que interactúe con la API de Dropea.

**Contexto:**
- Endpoint: `https://api.dropea.com/graphql/dropshippers`
- Auth: header `x-api-key: ${DROPEA_API_KEY}`
- Cliente: `graphql-request` (no Apollo)
- Scopes disponibles: Producto (Listar/Ver), Orden (Listar/Ver/Crear/Confirmar/Cancelar/Actualizar), Tienda (Listar/Ver), Incidencia (Listar/Ver/Resolver), Usuario (Ver)
- Webhooks: estados de pedidos, incidencias, totales de pedidos
- El schema completo se descubre via introspección — no asumir campos

---

### `nextjs-appRouter`

**Cuándo aplicar:** cualquier agente que escriba páginas o componentes.

**Reglas:**
- Componentes son Server Components por defecto — no agregar `"use client"` sin razón
- `"use client"` solo para: estado interactivo, event handlers, browser APIs
- Data fetching en Server Components con `graphql-request` directamente
- Mutations vía Server Actions (`"use server"`)
- Cachear agresivamente con `{ next: { revalidate: 3600 } }` en productos
- ISR para páginas de producto: `export const revalidate = 3600`

---

### `ecommerce-patterns`

**Cuándo aplicar:** `cart-agent`, `catalog-agent`.

**Reglas:**
- Carrito en Zustand con persistencia en localStorage
- Nunca guardar datos sensibles del cliente en el carrito
- El checkout siempre valida del lado del servidor antes de crear la orden
- Manejo de errores de stock (producto sin stock al momento del checkout)
- El número de orden de Dropea se muestra al cliente tras confirmar

---

### `es-pt-market`

**Cuándo aplicar:** `i18n-agent`, páginas legales, checkout.

**Reglas:**
- Páginas legales obligatorias en España/Portugal: Aviso Legal, Política de Privacidad, Política de Devoluciones (14 días mínimo por ley UE), Política de Cookies
- Banner de cookies obligatorio (RGPD)
- IVA: España 21%, Portugal 23% — mostrar precio con IVA incluido
- Métodos de pago relevantes: PayPal, Stripe, Contra reembolso (Dropea lo gestiona)
- Moneda: EUR (€)

---

## Flujo SDD para nuevas features

```
/sdd-new <feature>
  → sdd-explore: investiga codebase + API de Dropea
  → sdd-propose: propone approach con tradeoffs
  → sdd-spec: define requirements y escenarios
  → sdd-design: arquitectura técnica
  → sdd-tasks: lista de tareas ordenadas
  → sdd-apply: implementación por agente responsable
  → sdd-verify: valida contra specs
  → sdd-archive: cierra el cambio
```

## Cómo clonar para un nuevo nicho

1. `git clone <repo> mi-tienda-nicho && cd mi-tienda-nicho`
2. Copiar `.env.example` a `.env.local` y completar variables
3. Cambiar tokens de diseño en `tailwind.config.ts`
4. Reemplazar contenido en `src/messages/es.json` y `pt.json`
5. `vercel deploy`
