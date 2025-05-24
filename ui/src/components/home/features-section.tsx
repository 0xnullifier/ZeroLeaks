import { Shield, Lock, Database } from "lucide-react"

const features = [
  {
    icon: Lock,
    title: "Cryptographic Verification",
    description: "Our platform uses zero-knowledge proofs to verify the authenticity of leaks without revealing the identity of the whistleblower or any sensitive metadata."
  },
  {
    icon: Shield,
    title: "Mathematical Anonymity", 
    description: "Your identity is protected by mathematical guarantees, not just promises. Zero-knowledge proofs allow verification without revealing any identifying information."
  },
  {
    icon: Database,
    title: "Tamper-Proof Records",
    description: "All leaks are cryptographically sealed and stored in a way that prevents tampering, ensuring the integrity of the information from submission to publication."
  }
]

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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Zero-Knowledge Security</h2>
          <p className="text-muted-foreground">
            Our platform uses advanced cryptography to protect whistleblowers while ensuring information authenticity.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group relative bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-sm border border-border/60 rounded-2xl p-8 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_30px_rgba(0,0,0,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="bg-background/80 backdrop-blur-sm border border-border/40 rounded-full p-3 w-14 h-14 flex items-center justify-center mb-6 group-hover:border-primary/30 transition-colors duration-300">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 