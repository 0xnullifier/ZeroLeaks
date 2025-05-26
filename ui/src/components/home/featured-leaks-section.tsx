import { FeaturedLeaks } from "@/components/featured-leaks";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { ConnectButton } from "@mysten/dapp-kit";
import { ConnectWallet } from "../zk-login/widget";
import { useNavigate } from "react-router";

export function FeaturedLeaksSection() {
  const navigate = useNavigate();
  return (
    <section className="py-32 bg-background relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Featured Revelations
          </h2>
          <p className="text-muted-foreground">
            Explore verified leaks that have been cryptographically
            authenticated through our platform.
          </p>
        </div>

        <FeaturedLeaks />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-50px", once: true }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Button onClick={() => navigate('/leaks')}>Explore More</Button>
        </motion.div>
      </div>
    </section>
  );
}
