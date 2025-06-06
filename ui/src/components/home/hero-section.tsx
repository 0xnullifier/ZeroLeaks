import { Shield, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { ConnectWallet } from "../zk-login/widget";
import { ThemeToggle } from "../theme-toggle";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useNavigate } from "react-router";

export function HeroSection() {
  const account = useCurrentAccount()
  const navigate = useNavigate();
  return (
    <section className="relative h-screen flex items-center">
      {/* Theme Toggle - Fixed position in top right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-[10%] left-[5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.5, once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 rounded-full border-b-2 border border-b-primary bg-muted/30 backdrop-blur-sm mb-8"
          >
            <Shield className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-muted-foreground">
              Zero-knowledge whistleblowing platform on <span className="text-primary italic">Sui</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.5, once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Expose the Truth.
            <span className="text-primary block mt-2">Stay Invisible.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.5, once: true }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
          >
            The world's first cryptographically secure whistleblowing platform.
            Share sensitive information with mathematical certainty that your
            identity remains protected—even from us.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.5, once: true }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            {account ? (
              <Button
                className="flex items-center gap-2"
                onClick={() => navigate('/leaks')}
              >Explore More Now</Button>
            ) : (
              <ConnectWallet />
            )}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 1, y: 10 }}
        whileInView={{ opacity: 0, y: 0 }}
        viewport={{ margin: "-100px", once: true }}
        transition={{ duration: 0.2, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-xs text-muted-foreground mb-2">
          Scroll to explore
        </span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-muted-foreground/30 to-transparent"></div>
      </motion.div>
    </section>
  );
}
