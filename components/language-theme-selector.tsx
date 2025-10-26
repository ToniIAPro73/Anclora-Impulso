"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/lib/contexts/language-context"
import { useTheme } from "@/lib/contexts/theme-context"
import { Globe, Moon, Sun, Monitor } from "lucide-react"

export function LanguageThemeSelector() {
  const { language, setLanguage, t } = useLanguage()
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-2">
      {/* Language Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
            <Globe className="h-4 w-4" />
            <span className="sr-only">{t.settings.language}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setLanguage("es")}>
            <span className={language === "es" ? "font-semibold" : ""}>{t.settings.spanish}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLanguage("en")}>
            <span className={language === "en" ? "font-semibold" : ""}>{t.settings.english}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">{t.settings.theme}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <Sun className="mr-2 h-4 w-4" />
            <span className={theme === "light" ? "font-semibold" : ""}>{t.settings.light}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Moon className="mr-2 h-4 w-4" />
            <span className={theme === "dark" ? "font-semibold" : ""}>{t.settings.dark}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <Monitor className="mr-2 h-4 w-4" />
            <span className={theme === "system" ? "font-semibold" : ""}>{t.settings.system}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
