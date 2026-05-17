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
      brand: "Anclora Impulso is part of the Anclora Group ecosystem.",
      contact: "Contact email: hola@anclora.com.",
    }
    if (kind === "privacy") return {
      title: "Privacy policy",
      description: "How Anclora Impulso processes account, fitness and operational data.",
      updated: common.updated,
      blocks: [
        { title: "Controller", paragraphs: ["Controller: Anclora Group, owner and operator of Anclora Impulso.", common.contact] },
        { title: "Data we process", paragraphs: ["We may process account data, authentication credentials, training preferences, nutrition inputs, progress records and technical security data."] },
        { title: "Legal basis", paragraphs: ["Processing is based on contractual performance (to provide the service), legitimate interest (security and operational continuity) and consent for optional features."] },
        { title: "Retention", paragraphs: ["Data is kept for the duration of the account and up to 12 months after deletion, unless legal obligations require longer retention."] },
        { title: "Your rights", paragraphs: ["You may request access, rectification, erasure, restriction or portability of your data by writing to hola@anclora.com."] },
        { title: "Cookies", paragraphs: ["Necessary cookies support security, session and preferences. Optional analytics or marketing cookies remain disabled unless accepted."] },
        { title: "Third parties", paragraphs: ["We may use trusted processors (hosting, analytics) under data processing agreements. We do not sell personal data."] },
        { title: "Changes", paragraphs: ["We may update this policy. Material changes will be notified via the app or email."] },
      ],
    }
    if (kind === "terms") return {
      title: "Terms of service",
      description: "Use conditions for Anclora Impulso.",
      updated: common.updated,
      blocks: [
        { title: "Operator", paragraphs: [common.brand, common.contact] },
        { title: "Service", paragraphs: ["The app provides AI-assisted fitness, nutrition and progress features. It does not replace medical, nutritional or professional advice."] },
        { title: "User responsibility", paragraphs: ["Users should adapt activity to their health condition and consult qualified professionals when needed."] },
        { title: "Account", paragraphs: ["You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account."] },
        { title: "Acceptable use", paragraphs: ["You agree not to misuse the service, attempt to reverse-engineer it, or use it for any unlawful purpose."] },
        { title: "Availability", paragraphs: ["We aim for high availability but do not guarantee uninterrupted access. Maintenance windows may occur with advance notice when possible."] },
        { title: "Limitation of liability", paragraphs: ["To the extent permitted by law, Anclora Group is not liable for indirect damages arising from use of the app."] },
        { title: "Governing law", paragraphs: ["These terms are governed by applicable Spanish law. Disputes shall be submitted to the courts of Spain unless mandatory consumer law provides otherwise."] },
      ],
    }
    return {
      title: "Legal notice",
      description: "Ownership and contact information for Anclora Impulso.",
      updated: common.updated,
      blocks: [
        { title: "Ownership", paragraphs: ["Owner and operator: Anclora Group.", common.brand] },
        { title: "Contact", paragraphs: [common.contact] },
        { title: "Intellectual property", paragraphs: ["Product identity, interface and proprietary documentation are owned by Anclora Group without prejudice to third-party rights."] },
        { title: "No medical advice", paragraphs: ["Content in the app is informational only and does not constitute medical, nutritional or professional advice."] },
        { title: "Links", paragraphs: ["The app may contain links to third-party resources. Anclora Group is not responsible for their content."] },
        { title: "Accuracy", paragraphs: ["We strive to keep information accurate but do not warrant the completeness or fitness for a particular purpose of any content."] },
        { title: "Changes", paragraphs: ["This legal notice may be updated. Continued use of the app constitutes acceptance of the current version."] },
        { title: "Complaints", paragraphs: ["If you have a complaint, please contact hola@anclora.com. We will endeavour to respond within 15 business days."] },
      ],
    }
  }
  const common = {
    updated: "Última actualización: 17 de mayo de 2026",
    brand: "Anclora Impulso forma parte del ecosistema Anclora Group.",
    contact: "Email de contacto: hola@anclora.com.",
  }
  if (kind === "privacy") return {
    title: "Política de privacidad",
    description: "Tratamiento de datos de cuenta, fitness y operación en Anclora Impulso.",
    updated: common.updated,
    blocks: [
      { title: "Responsable", paragraphs: ["Responsable del tratamiento: Anclora Group, entidad propietaria y operadora de Anclora Impulso.", common.contact] },
      { title: "Datos que tratamos", paragraphs: ["Podemos tratar datos de cuenta, autenticación, preferencias de entrenamiento, nutrición, progreso y datos técnicos de seguridad."] },
      { title: "Base legal", paragraphs: ["El tratamiento se basa en la ejecución del contrato (para prestar el servicio), el interés legítimo (seguridad y continuidad operativa) y el consentimiento para funciones opcionales."] },
      { title: "Conservación", paragraphs: ["Los datos se conservan durante la vigencia de la cuenta y hasta 12 meses tras su eliminación, salvo que obligaciones legales exijan un plazo mayor."] },
      { title: "Tus derechos", paragraphs: ["Puedes solicitar acceso, rectificación, supresión, limitación o portabilidad de tus datos escribiendo a hola@anclora.com."] },
      { title: "Cookies", paragraphs: ["Las cookies necesarias soportan seguridad, sesión y preferencias. Las opcionales de análisis o marketing permanecen desactivadas salvo consentimiento."] },
      { title: "Terceros", paragraphs: ["Podemos utilizar encargados de confianza (alojamiento, analítica) bajo acuerdos de tratamiento. No vendemos datos personales."] },
      { title: "Cambios", paragraphs: ["Podemos actualizar esta política. Los cambios sustanciales se notificarán a través de la app o por email."] },
    ],
  }
  if (kind === "terms") return {
    title: "Términos del servicio",
    description: "Condiciones de uso de Anclora Impulso.",
    updated: common.updated,
    blocks: [
      { title: "Operador", paragraphs: [common.brand, common.contact] },
      { title: "Servicio", paragraphs: ["La app ofrece funciones de fitness, nutrición y progreso asistidas por IA. No sustituye consejo médico, nutricional ni profesional."] },
      { title: "Responsabilidad del usuario", paragraphs: ["El usuario debe adaptar la actividad a su estado de salud y consultar profesionales cualificados cuando sea necesario."] },
      { title: "Cuenta", paragraphs: ["Eres responsable de mantener la confidencialidad de tus credenciales y de toda la actividad realizada bajo tu cuenta."] },
      { title: "Uso aceptable", paragraphs: ["Te comprometes a no hacer un uso indebido del servicio, no intentar ingeniería inversa ni utilizarlo para ningún fin ilícito."] },
      { title: "Disponibilidad", paragraphs: ["Procuramos una alta disponibilidad, pero no garantizamos acceso ininterrumpido. Pueden existir ventanas de mantenimiento con aviso previo cuando sea posible."] },
      { title: "Limitación de responsabilidad", paragraphs: ["En la medida permitida por la ley, Anclora Group no responde por daños indirectos derivados del uso de la app."] },
      { title: "Ley aplicable", paragraphs: ["Estos términos se rigen por la legislación española. Las disputas se someterán a los tribunales de España, salvo que la normativa de consumo obligue a otra jurisdicción."] },
    ],
  }
  return {
    title: "Aviso legal",
    description: "Información de titularidad y contacto de Anclora Impulso.",
    updated: common.updated,
    blocks: [
      { title: "Titularidad", paragraphs: ["Titular y operador: Anclora Group.", common.brand] },
      { title: "Contacto", paragraphs: [common.contact] },
      { title: "Propiedad intelectual", paragraphs: ["La identidad de producto, interfaz y documentación propia son propiedad de Anclora Group sin perjuicio de derechos de terceros."] },
      { title: "Sin consejo médico", paragraphs: ["El contenido de la app tiene carácter informativo y no constituye consejo médico, nutricional ni profesional."] },
      { title: "Enlaces", paragraphs: ["La app puede contener enlaces a recursos de terceros. Anclora Group no es responsable de su contenido."] },
      { title: "Exactitud", paragraphs: ["Procuramos mantener la información actualizada, pero no garantizamos la completitud ni la idoneidad para un fin concreto."] },
      { title: "Cambios", paragraphs: ["Este aviso legal puede actualizarse. El uso continuado de la app implica la aceptación de la versión vigente."] },
      { title: "Reclamaciones", paragraphs: ["Si tienes una reclamación, contacta con hola@anclora.com. Intentaremos responder en un plazo de 15 días hábiles."] },
    ],
  }
}
