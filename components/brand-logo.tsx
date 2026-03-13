import Image from "next/image"

import { cn } from "@/lib/utils"

interface BrandLogoProps {
  className?: string
  imageClassName?: string
  priority?: boolean
  size?: number
}

export function BrandLogo({ className, imageClassName, priority = false, size = 64 }: BrandLogoProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-anclora-impulso.png"
        alt="Anclora Impulso"
        fill
        priority={priority}
        sizes={`${size}px`}
        className={cn("object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.28)]", imageClassName)}
      />
    </div>
  )
}
