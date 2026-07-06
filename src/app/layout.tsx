import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import './globals.css'
import { nichoConfig } from '../../nicho.config'

// Plus Jakarta Sans — única tipografía del sitio, headings y body (DESIGN.md)
const headingFont = Plus_Jakarta_Sans({
  variable: '--font-heading-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
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
      className={`${headingFont.variable} ${geistMono.variable} h-full antialiased`}
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
