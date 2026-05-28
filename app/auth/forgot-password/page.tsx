"use client"

import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useLanguage } from "@/lib/contexts/language-context"

export default function ForgotPasswordPage() {
  const { t } = useLanguage()

  return (
    <div className="relative flex h-screen items-center justify-center overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.25),_transparent_38%),linear-gradient(135deg,_rgba(255,247,237,1)_0%,_rgba(255,237,213,0.85)_42%,_rgba(255,255,255,1)_100%)] p-6 dark:bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.14),_transparent_36%),linear-gradient(135deg,_rgba(2,6,23,1)_0%,_rgba(15,23,42,0.96)_48%,_rgba(30,41,59,0.92)_100%)]">
      <div className="relative w-full max-w-md">
        <Card className="border-white/70 bg-white/78 shadow-[0_32px_80px_-40px_rgba(234,88,12,0.45)] backdrop-blur-xl dark:border-orange-400/10 dark:bg-slate-950/82">
          <CardHeader className="pb-4 pt-6 text-center">
            <BrandLogo size={72} priority className="mx-auto mb-4" />
            <div className="mx-auto mb-3 h-px w-16 bg-gradient-to-r from-transparent via-orange-400/70 to-transparent" />
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              {t.auth.forgotPassword}
            </CardTitle>
            <CardDescription className="text-xs text-gray-600 dark:text-gray-400">
              {t.auth.forgotPasswordCopy}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6 text-center">
            <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
              {t.auth.forgotPasswordContact}{" "}
              <a
                href="mailto:soporte@anclora.es"
                className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400"
              >
                soporte@anclora.es
              </a>
            </p>
            <Link
              href="/auth/login"
              className="text-xs text-orange-600 hover:text-orange-500 dark:text-orange-400"
            >
              {t.auth.backToLogin}
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
