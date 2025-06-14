import { Link, Outlet, useNavigate, useLocation } from "react-router";
import { Button } from "../ui/button";
import { ConnectWallet } from "../zk-login/widget";
import { ThemeToggle } from "../theme-toggle";
import { Shield, ExternalLink, Coins } from "lucide-react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Badge } from "../ui/badge";
import { useRefetchAll } from "@/hooks/useRefetchAll";

const navItems = [
  { name: "Leaks", link: "/leaks" },
  { name: "Submit Leak", link: "/leaks/submit" },
  { name: "Bounties", link: "/bounties" },
  { name: "DAO", link: "/dao" },
];

const LeaksLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentAccount = useCurrentAccount();

  // Use centralized refetch hook to get balance data
  const { zlTokenBalance, suiBalance } = useRefetchAll();

  const getActiveIndex = () => {
    const currentPath = location.pathname;
    if (currentPath.startsWith("/dao")) return 3;
    if (currentPath.startsWith("/bounties")) return 2;
    if (currentPath === "/leaks/submit") return 1;
    if (currentPath.startsWith("/leaks")) return 0;
    return -1;
  };

  const formatBalance = (balance: string) => {
    const num = parseInt(balance) / 1000000000; // Convert from smallest unit (9 decimals)
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(4);
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
          {/* SUI Balance Display */}
          {currentAccount && suiBalance && (
            <Badge variant="outline" className="hidden sm:flex items-center gap-1 px-3 py-1 border-blue-500/20 text-blue-600 dark:text-blue-400">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <span className="font-medium">{formatBalance(suiBalance.totalBalance)} SUI</span>
            </Badge>
          )}

          {/* ZL Token Balance Display */}
          {currentAccount && zlTokenBalance && (
            <Badge variant="outline" className="hidden sm:flex items-center gap-1 px-3 py-1 border-primary/20 text-primary">
              <Coins className="w-3 h-3" />
              <span className="font-medium">{formatBalance(zlTokenBalance.totalBalance)} ZL</span>
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2 border-primary/20 text-primary hover:bg-primary/10 hover:text-primary"
            onClick={() => window.open("https://faucet.sui.io/", "_blank")}
          >
            Buy <p className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">SUI</p>
            <ExternalLink className="w-3 h-3" />
          </Button>
          <ThemeToggle />
          <ConnectWallet />
        </div>
      </header>
      <Outlet />
    </div>
  );
};

export { LeaksLayout };
