import { Lock } from "lucide-react";
import { ZkLoginWidget } from "@/components/zk-login/widget";

export function CallToActionSection() {
  return (
    <section className="py-36 bg-background relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[50%] transform -translate-x-1/2 w-[70%] h-[70%] bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Reveal the Truth?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
            Your courage can change the world. Our platform ensures your safety
            through mathematical guarantees and cutting-edge cryptography.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
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
      </div>
    </section>
  );
}
