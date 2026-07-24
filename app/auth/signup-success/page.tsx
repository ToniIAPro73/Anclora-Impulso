import Link from "next/link"

export default function SignupSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="w-full max-w-md">
        <div className="rounded-xl py-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
          <div className="text-center pb-8 px-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">¡Bienvenido a Anclora Impulso!</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Check your email to confirm your account
            </p>
          </div>
          <div className="text-center space-y-6 px-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                We&apos;ve sent a confirmation email to your inbox. Please click the link in the email to activate your
                account and start your fitness journey.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Didn&apos;t receive the email? Check your spam folder or try signing up again.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex h-9 w-full items-center justify-center rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
