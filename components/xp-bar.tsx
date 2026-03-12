"use client"

import { useGamificationStatus } from "@/hooks/use-gamification"
import { Progress } from "@/components/ui/progress"
import { Star, Flame } from "lucide-react"
import Link from "next/link"

export function XPBar() {
  const { data: status } = useGamificationStatus()

  if (!status) return null

  return (
    <Link href="/achievements" className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold">{status.level}</span>
        </div>
        <div className="flex-1">
          <Progress value={status.progressPercent} className="h-2" />
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Flame className="w-3 h-3 text-orange-500" />
          <span>{status.currentStreak}</span>
        </div>
      </div>
    </Link>
  )
}
