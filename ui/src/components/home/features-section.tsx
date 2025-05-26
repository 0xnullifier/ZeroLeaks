import { motion } from "framer-motion";
import { Shield, Lock, Database, DollarSign } from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Cryptographic Verification",
    description:
      "Our platform uses zero-knowledge proof protocol Groth16 to verify the authenticity of leaks without revealing the identity of the whistleblower or any sensitive metadata.",
  },
  {
    icon: DollarSign,
    title: "Cost Effective",
    description:
      "We use Sui's native cryptographic primitives, making proof verification cost less than 1 cent. This makes it affordable for anyone to submit a leak without worrying about high transaction fees.",
  },
  {
    icon: Database,
    title: "Tamper-Proof Records",
    description:
      "All evidence and sensitive data is published on Walrus, ensuring records are immutable and verifiable by anyone at any time.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-32 bg-background relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-xl mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.5, once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Zero-Knowledge Security
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.5, once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-muted-foreground"
          >
            Our platform uses advanced cryptography to protect whistleblowers
            while ensuring information authenticity.
          </motion.p>
        </div>

        <motion.div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-50px", once: true }}
              transition={{
                duration: 0.2,
                delay: 0.6 + index * 0.2,
                type: "easeOut",
              }}
              className="group relative bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-sm border border-border/60 rounded-2xl p-8 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_30px_rgba(0,0,0,0.2)]"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="bg-background/80 backdrop-blur-sm border border-border/40 rounded-full p-3 w-14 h-14 flex items-center justify-center mb-6 group-hover:border-primary/30 transition-colors duration-300">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
