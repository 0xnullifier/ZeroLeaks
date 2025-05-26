import { motion } from "framer-motion";

export function HowItWorksSection() {
  const steps = [
    {
      title: "Submit Your Leak",
      description:
        "Upload your documents and information. We then genearate a ZKP in the browser using snarkjs ensuring your data does not leave your browser",
    },
    {
      title: "Verification Process",
      description:
        "The verification of the leak is done on chain using Sui's native cryptographic primitives.",
    },
    {
      title: "Public Disclosure",
      description:
        "Once verified, the information is published with its accompanying proof and evidence on walrus, allowing anyone to verify its authenticity while your identity remains protected.",
    },
  ];

  return (
    <section className="py-32 bg-background relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[5%] left-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[5%] right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-xl mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.5, once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.5, once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-muted-foreground"
          >
            Our platform ensures your security through a carefully designed
            process.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.5, once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="absolute left-8 top-0 h-full w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent"
            ></motion.div>
            <div className="space-y-16">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.5, once: true }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.2 }}
                  className="relative pl-20"
                >
                  <div className="absolute left-0 top-0 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border border-primary/30 rounded-full h-16 w-16 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.1)]">
                    <span className="text-xl font-bold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ amount: 0.5, once: true }}
                    transition={{ duration: 0.4, delay: 0.8 + index * 0.2 }}
                    className="text-xl font-bold mb-3"
                  >
                    {step.title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ amount: 0.5, once: true }}
                    transition={{ duration: 0.4, delay: 1 + index * 0.2 }}
                    className="text-muted-foreground"
                  >
                    {step.description}
                  </motion.p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
