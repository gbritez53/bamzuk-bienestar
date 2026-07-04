import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Be_Vietnam_Pro, Geist_Mono } from 'next/font/google'
import './globals.css'
import { nichoConfig } from '../../nicho.config'

// Plus Jakarta Sans — tipografía de headings y precios (DESIGN.md)
const headingFont = Plus_Jakarta_Sans({
  variable: '--font-heading-sans',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
})

// Be Vietnam Pro — tipografía de body/descripciones/formularios (DESIGN.md)
const bodyFont = Be_Vietnam_Pro({
  variable: '--font-body-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: nichoConfig.name,
  description: `Tienda online — ${nichoConfig.name}`,
}

const nichoStyle = `
  :root {
    --primary: ${nichoConfig.colors.primary};
    --secondary: ${nichoConfig.colors.secondary};
    --accent: ${nichoConfig.colors.accent};
  }
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${headingFont.variable} ${bodyFont.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* eslint-disable-next-line react/no-danger */}
        <style dangerouslySetInnerHTML={{ __html: nichoStyle }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
