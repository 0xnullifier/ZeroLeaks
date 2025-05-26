import { ConnectWallet } from "@/components/zk-login/widget";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";

export function CallToActionSection() {
  const navigate = useNavigate();
  return (
    <section className="py-36 bg-background relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[50%] transform -translate-x-1/2 w-[70%] h-[70%] bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.5, once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            Ready to Reveal the Truth?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.5, once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10"
          >
            Your courage can change the world. Our platform ensures your safety
            through mathematical guarantees and cutting-edge cryptography.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.5, once: true }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Button variant={"ghost"} onClick={() => navigate('/leaks/submit')}>Submit A Leak</Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
