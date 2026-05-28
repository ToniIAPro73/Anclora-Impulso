import type React from "react"
import { LegalFooter } from "@/components/legal-footer"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <LegalFooter />
    </>
  )
}
