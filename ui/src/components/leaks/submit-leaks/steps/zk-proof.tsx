import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Lock, FileCheck, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStepper } from "@/components/ui/stepper";
import { useSubmitLeakStore } from "@/lib/submit-leak-store";
import { useState } from "react";

export function ZkProofStep() {
  const stepper = useStepper();
  const { zkProof, setZkProof } = useSubmitLeakStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateProof = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setZkProof(
        "0xasndkkfnkjfnejknhfeiqohrieufhiwsfjh39827493274298ryhfjwfb8ry7t2784ufb"
      );
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <Card className="bg-card border-border/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Zero-Knowledge Proof Verification
        </CardTitle>
        <CardDescription>
          Our system will generate a zero-knowledge proof to verify the
          authenticity of your leak.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-background rounded-lg p-4 border border-border/70">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-primary" />
            Automatic Proof Generation
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Our system will automatically generate a zero-knowledge proof based
            on your submission. This proof will:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 pl-5 list-disc">
            <li>Verify the authenticity of your documents</li>
            <li>Confirm the documents haven't been tampered with</li>
            <li>Establish a cryptographic chain of custody</li>
            <li>Protect your identity completely</li>
          </ul>
        </div>
        {zkProof ? (
          <div className="bg-background rounded-lg p-4 border border-border/70">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary" />
              Proof Generated
            </h3>
            <p className="text-sm text-muted-foreground mb-4 font-mono">
              {zkProof}
            </p>
          </div>
        ) : (
          <Button
            onClick={handleGenerateProof}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Proof"}{" "}
            <Check className="w-4 h-4" />
          </Button>
        )}
      </CardContent>
      {zkProof && (
        <CardFooter className="flex justify-end gap-4">
          <Button onClick={() => stepper.prevStep()} variant="ghost">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button onClick={() => stepper.nextStep()} className="w-32 bg-primary hover:bg-primary/90">
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
