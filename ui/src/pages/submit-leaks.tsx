import { Stepper, StepperProgress, Step, useStepper } from "@/components/ui/stepper";
import {
  EmailInfoStep,
  DocumentUploadStep,
  ZkProofStep,
  ArticleEditorStep,
  FinalSubmissionStep,
} from "@/components/leaks/submit-leaks/steps";
import { Button } from "@/components/ui/button";

const TOTAL_STEPS = 5;

function StepperNavigation() {
  const { currentStep, totalSteps, nextStep, prevStep } = useStepper();
  return (
    <div className="flex justify-between mt-8 gap-4">
      <Button
        variant="outline"
        onClick={prevStep}
        disabled={currentStep === 0}
        className="w-32"
      >
        Back
      </Button>
      {currentStep < totalSteps - 1 ? (
        <Button onClick={nextStep} className="w-32 bg-primary hover:bg-primary/90">
          Next
        </Button>
      ) : (
        <Button type="submit" className="w-32 bg-primary hover:bg-primary/90">
          Submit
        </Button>
      )}
    </div>
  );
}

export function SubmitLeaksPage() {

  const categories = [
    "Government",
    "Corporate",
    "Military",
    "Finance",
    "Healthcare",
    "Environment",
    "Technology",
    "Other",
  ];

  return (
    <div className="bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Submit a Secure Leak
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your identity is protected through zero-knowledge cryptography.
              All submissions are encrypted and verified without revealing your
              identity.
            </p>
          </div>

          <Stepper totalSteps={TOTAL_STEPS} initialStep={0}>
            <StepperProgress className="mb-8" />
            <Step index={0}>
              <EmailInfoStep />
            </Step>
            <Step index={1}>
              <DocumentUploadStep />
            </Step>
            <Step index={2}>
              <ZkProofStep />
            </Step>
            <Step index={3}>
              <ArticleEditorStep categories={categories} />
            </Step>
            <Step index={4}>
              <FinalSubmissionStep />
            </Step>
          </Stepper>
        </div>
      </main>
    </div>
  );
}
