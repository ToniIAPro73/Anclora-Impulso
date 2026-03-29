import { LoginPageContent } from "@/components/login-page-content"

export default function LoginPage() {
  const shouldAutofill = process.env.UTILIZAR_USER_TEXT === "true"

  return (
    <LoginPageContent
      defaultEmail={shouldAutofill ? process.env.USER_TEXT ?? "" : ""}
      defaultPassword={shouldAutofill ? process.env.PASS_TEXT ?? "" : ""}
    />
  )
}
