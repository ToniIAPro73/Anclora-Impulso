import Link from "next/link"

type AuthErrorPageProps = {
  searchParams?: {
    error?: string
  }
}

export default function AuthErrorPage({
  searchParams,
}: AuthErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="w-full max-w-md">
        <div className="rounded-xl py-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
          <div className="text-center pb-8 px-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Authentication Error</h1>
          </div>
          <div className="text-center space-y-6 px-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {searchParams?.error ? (
                <p className="text-sm text-red-800 dark:text-red-200">Error: {searchParams.error}</p>
              ) : (
                <p className="text-sm text-red-800 dark:text-red-200">
                  An authentication error occurred. Please try again.
                </p>
              )}
            </div>
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="inline-flex h-9 w-full items-center justify-center rounded-md bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-medium text-white shadow-xs transition-all hover:from-orange-600 hover:to-red-600 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Try Again
              </Link>
              <Link
                href="/"
                className="inline-flex h-9 w-full items-center justify-center rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium shadow-xs transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
