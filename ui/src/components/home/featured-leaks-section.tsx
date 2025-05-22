import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { FeaturedLeaks } from "@/components/featured-leaks";
import { ZkLoginWidget } from "../zk-login/widget";

export function FeaturedLeaksSection() {
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

        <div className="text-center mt-12">
          <ZkLoginWidget
            loggedOutTrigger={
              <>
                {" "}
                View More <ChevronRight className="h-4 w-4" />
              </>
            }
          />
        </div>
      </div>
    </section>
  );
}
