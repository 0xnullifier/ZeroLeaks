import { Link, Outlet, useNavigate } from "react-router";
import { Button } from "../ui/button";
import { ZkLoginWidget } from "../zk-login/widget";
import { useState } from "react";
import { Lock, Shield } from "lucide-react";

const navItems = [
  { name: "Leaks", link: "/leaks" },
  { name: "Submit Leak", link: "/leaks/submit" },
];

const LeaksLayout = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  return (
    <div className="container mx-auto">
      <header className="flex items-center justify-between bg-background py-2 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">ZeroLeaks</span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item, index) => (
              <Button
                key={index}
                className="bg-background hover:bg-background"
                effect={activeIndex === index ? "underline" : "hoverUnderline"}
                onClick={() => {
                  setActiveIndex(index);
                  navigate(item.link);
                }}
              >
                {item.name}
              </Button>
            ))}
          </nav>
        </div>
        <ZkLoginWidget
          size="sm"
          loggedOutTrigger={
            <>
            {" "}
            <Lock className="h-4 w-4 mr-1" /> ZkLogin with Google
          </>
          }
        />
      </header>
      <Outlet />
    </div>
  );
};

export { LeaksLayout };
