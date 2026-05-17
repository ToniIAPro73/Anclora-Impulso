"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/contexts/language-context"

export function LegalFooter() {
  const { language } = useLanguage()
  const year = new Date().getFullYear()
  const copy = language === "en"
    ? {
        terms: "Terms of service",
        privacy: "Privacy policy",
        legal: "Legal notice",
        rights: "All rights reserved.",
        brand: "Anclora Impulso is a commercial brand operated under exclusive license by Anclora Group.",
      }
    : {
        terms: "Términos del servicio",
        privacy: "Política de privacidad",
        legal: "Aviso legal",
        rights: "Todos los derechos reservados.",
        brand: "Anclora Impulso es una marca comercial operada bajo licencia exclusiva por Anclora Group.",
      }

  return (
    <footer className="border-t border-orange-500/15 bg-slate-950/70 px-5 py-6 text-xs text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p>© {year} Anclora Group — {copy.rights}</p>
          <p>{copy.brand}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/terms" className="hover:text-white">{copy.terms}</Link>
          <Link href="/privacy" className="hover:text-white">{copy.privacy}</Link>
          <Link href="/legal" className="hover:text-white">{copy.legal}</Link>
          <a href="mailto:hola@anclora.com" className="hover:text-white">hola@anclora.com</a>
          <button type="button" onClick={() => window.dispatchEvent(new Event("anclora:open-cookie-preferences"))} className="hover:text-white">Cookies</button>
        </div>
      </div>
    </footer>
  )
}
