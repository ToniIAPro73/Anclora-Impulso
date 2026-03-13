import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/lib/contexts/language-context"
import { ThemeProvider } from "@/lib/contexts/theme-context"
import "./globals.css"
import { Inter } from 'next/font/google'

// Initialize fonts
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: "Anclora Impulso - Tu Entrenador Personal con IA",
  description: "Entrenamientos personalizados con IA y seguimiento inteligente de progreso",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/impulso_favicon.ico", sizes: "any" },
      { url: "/impulso_favicon_32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/impulso_favicon_512.png", type: "image/png", sizes: "512x512" }],
    shortcut: ["/impulso_favicon.ico"],
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable}`}>
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
