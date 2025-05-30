import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    const handleToggle = () => {
        if (theme === "light") {
            setTheme("dark")
        } else {
            setTheme("light")
        }
    }

    const getIcon = () => {
        if (theme === "light") {
            return <Sun className="h-[1.2rem] w-[1.2rem]" />
        } else {
            return <Moon className="h-[1.2rem] w-[1.2rem]" />
        }
    }

    const getTooltip = () => {
        if (theme === "light") {
            return "Switch to dark mode"
        } else {
            return "Switch to light mode"
        }
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={handleToggle}
            title={getTooltip()}
            className="border-border/40 hover:bg-accent"
        >
            {getIcon()}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
