"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/contexts/language-context"

type Block = { title: string; paragraphs: string[] }

export function LegalDocument({ kind }: { kind: "privacy" | "terms" | "legal" }) {
  const { language } = useLanguage()
  const content = getContent(language, kind)
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-3xl border border-orange-400/20 bg-white/[0.03] p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">Anclora Impulso</p>
          <h1 className="mt-3 text-4xl font-semibold">{content.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{content.description}</p>
          <p className="mt-2 text-xs text-slate-400">{content.updated}</p>
        </section>
        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          {content.blocks.map((block) => (
            <article key={block.title} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <h2 className="text-2xl font-semibold">{block.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-slate-300">
                {block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </article>
          ))}
        </section>
        <nav className="flex flex-wrap gap-3 text-sm">
          <Link href="/terms" className="rounded-full border border-white/15 px-5 py-3">Términos</Link>
          <Link href="/privacy" className="rounded-full border border-white/15 px-5 py-3">Privacidad</Link>
          <Link href="/legal" className="rounded-full border border-white/15 px-5 py-3">Aviso legal</Link>
          <Link href="/" className="rounded-full bg-orange-500 px-5 py-3 font-semibold text-white">Volver</Link>
        </nav>
      </div>
    </main>
  )
}

function getContent(language: "es" | "en", kind: "privacy" | "terms" | "legal"): { title: string; description: string; updated: string; blocks: Block[] } {
  if (language === "en") {
    const common = {
      updated: "Last updated: 17 May 2026",
      owner: "Anclora Impulso is a commercial brand operated under exclusive license by Anclora Group.",
      contact: "Common contact email: hola@anclora.com.",
    }
    if (kind === "privacy") return { title: "Privacy policy", description: "How Anclora Impulso processes account, fitness and operational data.", updated: common.updated, blocks: [{ title: "Controller", paragraphs: ["Controller: Anclora Group, owner and operator of Anclora Impulso.", common.contact] }, { title: "Data", paragraphs: ["We may process account data, authentication, training preferences, nutrition inputs, progress records and technical security data."] }, { title: "Cookies", paragraphs: ["Necessary cookies support security, session and preferences. Optional analytics or marketing cookies remain disabled unless accepted."] }] }
    if (kind === "terms") return { title: "Terms of service", description: "Use conditions for Anclora Impulso.", updated: common.updated, blocks: [{ title: "Operator", paragraphs: [common.owner, common.contact] }, { title: "Service", paragraphs: ["The app provides AI-assisted fitness, nutrition and progress features. It does not replace medical, nutritional or professional advice."] }, { title: "User responsibility", paragraphs: ["Users should adapt activity to their health condition and consult qualified professionals when needed."] }] }
    return { title: "Legal notice", description: "Ownership and contact information for Anclora Impulso.", updated: common.updated, blocks: [{ title: "Ownership", paragraphs: ["Owner and operator: Anclora Group.", common.owner] }, { title: "Contact", paragraphs: [common.contact] }, { title: "IP", paragraphs: ["Product identity, interface and proprietary documentation are governed by Anclora Group without prejudice to third-party rights."] }] }
  }
  const common = {
    updated: "Última actualización: 17 de mayo de 2026",
    owner: "Anclora Impulso es una marca comercial operada bajo licencia exclusiva por Anclora Group.",
    contact: "Email común de contacto: hola@anclora.com.",
  }
  if (kind === "privacy") return { title: "Política de privacidad", description: "Tratamiento de datos de cuenta, fitness y operación en Anclora Impulso.", updated: common.updated, blocks: [{ title: "Responsable", paragraphs: ["Responsable del tratamiento: Anclora Group, entidad propietaria y operadora de Anclora Impulso.", common.contact] }, { title: "Datos", paragraphs: ["Podemos tratar datos de cuenta, autenticación, preferencias de entrenamiento, nutrición, progreso y datos técnicos de seguridad."] }, { title: "Cookies", paragraphs: ["Las cookies necesarias soportan seguridad, sesión y preferencias. Las opcionales de análisis o marketing permanecen desactivadas salvo consentimiento."] }] }
  if (kind === "terms") return { title: "Términos del servicio", description: "Condiciones de uso de Anclora Impulso.", updated: common.updated, blocks: [{ title: "Operador", paragraphs: [common.owner, common.contact] }, { title: "Servicio", paragraphs: ["La app ofrece funciones de fitness, nutrición y progreso asistidas por IA. No sustituye consejo médico, nutricional ni profesional."] }, { title: "Responsabilidad del usuario", paragraphs: ["El usuario debe adaptar la actividad a su estado de salud y consultar profesionales cualificados cuando sea necesario."] }] }
  return { title: "Aviso legal", description: "Información de titularidad y contacto de Anclora Impulso.", updated: common.updated, blocks: [{ title: "Titularidad", paragraphs: ["Titular y operador: Anclora Group.", common.owner] }, { title: "Contacto", paragraphs: [common.contact] }, { title: "Propiedad intelectual", paragraphs: ["La identidad de producto, interfaz y documentación propia se gobiernan bajo Anclora Group sin perjuicio de derechos de terceros."] }] }
}
