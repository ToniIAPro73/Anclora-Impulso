import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-9 w-full min-w-0 appearance-none rounded-md border bg-transparent px-3 py-1 text-base text-foreground shadow-xs transition-[color,box-shadow] outline-none [color-scheme:light] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:text-white dark:[color-scheme:dark] md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        'dark:[&:-webkit-autofill]:[-webkit-text-fill-color:white] dark:[&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_rgba(15,23,42,0.95)_inset] dark:[&:-webkit-autofill:hover]:[box-shadow:0_0_0px_1000px_rgba(15,23,42,0.95)_inset] dark:[&:-webkit-autofill:focus]:[box-shadow:0_0_0px_1000px_rgba(15,23,42,0.95)_inset]',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
