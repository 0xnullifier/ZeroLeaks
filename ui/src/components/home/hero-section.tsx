import { Shield, Lock } from "lucide-react";
import { ZkLoginWidget } from "@/components/zk-login/widget";

export function HeroSection() {
  return (
    <section className="relative h-screen flex items-center">
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-[10%] left-[5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 rounded-full border-b-2 border border-b-primary bg-muted/30 backdrop-blur-sm mb-8">
            <Shield className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-muted-foreground">
              Zero-knowledge whistleblowing platform
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Expose the Truth.
            <span className="text-primary block mt-2">Stay Invisible.</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            The world's first cryptographically secure whistleblowing platform.
            Share sensitive information with mathematical certainty that your
            identity remains protected—even from us.
          </p>

          <ZkLoginWidget
            loggedOutTrigger={
              <>
                {" "}
                <Lock className="h-4 w-4 mr-1" /> ZkLogin with Google
              </>
            }
          />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <span className="text-xs text-muted-foreground mb-2">
          Scroll to explore
        </span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-muted-foreground/30 to-transparent"></div>
      </div>
    </section>
  );
}
