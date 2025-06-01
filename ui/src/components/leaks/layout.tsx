import { Link, Outlet, useNavigate, useLocation } from "react-router";
import { Button } from "../ui/button";
import { ConnectWallet } from "../zk-login/widget";
import { ThemeToggle } from "../theme-toggle";
import { Shield } from "lucide-react";

const navItems = [
  { name: "Leaks", link: "/leaks" },
  { name: "Submit Leak", link: "/leaks/submit" },
  { name: "DAO", link: "/dao" },
];

const LeaksLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveIndex = () => {
    const currentPath = location.pathname;
    if (currentPath.startsWith("/dao")) return 2;
    if (currentPath === "/leaks/submit") return 1;
    if (currentPath.startsWith("/leaks")) return 0;
    return -1;
  };

  const activeIndex = getActiveIndex();
  return (
    <div className="container mx-auto">
      <header className="flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 border-b border-border/40 sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-foreground">ZeroLeaks</span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item, index) => (
              <Button
                key={index}
                className="bg-transparent hover:bg-accent/50 text-foreground hover:text-accent-foreground transition-colors"
                effect={activeIndex === index ? "underline" : "hoverUnderline"}
                onClick={() => {
                  navigate(item.link);
                }}
              >
                {item.name}
              </Button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ConnectWallet />
        </div>
      </header>
      <Outlet />
    </div>
  );
};

export { LeaksLayout };
