export function HowItWorksSection() {
  return (
    <section className="py-32 bg-background relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[5%] left-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[5%] right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">How It Works</h2>
          <p className="text-muted-foreground">
            Our platform ensures your security through a carefully designed process.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute left-8 top-0 h-full w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent"></div>
            <div className="space-y-16">
              <div className="relative pl-20">
                <div className="absolute left-0 top-0 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border border-primary/30 rounded-full h-16 w-16 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.1)]">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Secure Access</h3>
                <p className="text-muted-foreground">
                  Access our platform through the Tor network for maximum anonymity. Our .onion address ensures your
                  connection remains private and untraceable.
                </p>
              </div>

              <div className="relative pl-20">
                <div className="absolute left-0 top-0 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border border-primary/30 rounded-full h-16 w-16 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.1)]">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Submit Your Leak</h3>
                <p className="text-muted-foreground">
                  Upload your documents and information. Our system automatically generates a zero-knowledge proof
                  that verifies authenticity without revealing your identity.
                </p>
              </div>

              <div className="relative pl-20">
                <div className="absolute left-0 top-0 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border border-primary/30 rounded-full h-16 w-16 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.1)]">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Verification Process</h3>
                <p className="text-muted-foreground">
                  Our team verifies the information while the zero-knowledge proof ensures that the data hasn't been
                  tampered with since submission.
                </p>
              </div>

              <div className="relative pl-20">
                <div className="absolute left-0 top-0 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border border-primary/30 rounded-full h-16 w-16 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.1)]">
                  <span className="text-xl font-bold text-primary">4</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Public Disclosure</h3>
                <p className="text-muted-foreground">
                  Once verified, the information is published with its accompanying proof, allowing anyone to verify
                  its authenticity while your identity remains protected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 