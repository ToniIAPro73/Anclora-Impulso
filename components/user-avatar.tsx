"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/contexts/auth-context"
import { getUserInitials } from "@/lib/user-profile"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  className?: string
  fallbackClassName?: string
}

export function UserAvatar({ className, fallbackClassName }: UserAvatarProps) {
  const { user, profile } = useAuth()
  const initials = getUserInitials(user?.fullName, user?.email)

  return (
    <Avatar className={cn("border border-orange-300/70 shadow-sm", className)}>
      {profile.avatarDataUrl ? <AvatarImage src={profile.avatarDataUrl} alt={user?.fullName || "Usuario"} className="object-cover" /> : null}
      <AvatarFallback
        className={cn(
          "bg-gradient-to-br from-orange-500 via-red-500 to-rose-500 text-sm font-semibold text-white",
          fallbackClassName,
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
