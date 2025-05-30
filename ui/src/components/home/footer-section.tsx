import { Link } from "react-router"
import { Shield } from "lucide-react"

export function FooterSection() {
  return (
    <footer className="bg-primary/5 border-t border-border/20 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ZeroLeaks</span>
          </div>

          <div className="flex flex-wrap gap-8">
            <Link to="/leaks" className="text-muted-foreground hover:text-primary/80 transition-colors">
              Browse Leaks
            </Link>
            <Link to="/upload" className="text-muted-foreground hover:text-primary/80 transition-colors">
              Submit Leak
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-primary/80 transition-colors">
              Docs
            </Link>

          </div>
        </div>

        <div className="border-t border-border/20 mt-8 pt-8 text-center text-sm text-muted-foreground/70">
          <p>© {new Date().getFullYear()} ZeroLeaks. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 