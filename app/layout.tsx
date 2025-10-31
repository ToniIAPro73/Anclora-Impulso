import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/lib/contexts/language-context"
import { ThemeProvider } from "@/lib/contexts/theme-context"
import { AuthProvider } from "@/lib/contexts/auth-context"
import { Suspense } from "react"
import "./globals.css"
import { Inter } from 'next/font/google'

// Initialize fonts
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: "Anclora Impulso - Tu Entrenador Personal con IA",
  description: "Entrenamientos personalizados con IA y seguimiento inteligente de progreso",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable}`}>
        <Suspense fallback={null}>
          <ThemeProvider>
            <LanguageProvider>
              <AuthProvider>{children}</AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
