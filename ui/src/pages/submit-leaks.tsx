import { Stepper, StepperProgress, Step, useStepper } from "@/components/ui/stepper";
import {
  DocumentUploadStep,
  ZkProofStep,
  ArticleEditorStep,
  FinalSubmissionStep,
} from "@/components/leaks/submit-leaks/steps";
import EmailInfoStep from "@/components/leaks/submit-leaks/steps/email-info";
import { useEffect, useState } from "react";
import { downloadProofFiles } from '@zk-email/helpers/dist/chunked-zkey'
const TOTAL_STEPS = 4;


export function SubmitLeaksPage() {
  const [downloadProgress, setDownloadProgress] = useState(0)
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

  useEffect(() => {
    const func = async () => {
      console.time("Downloading Zkey file");
      await downloadProofFiles(
        import.meta.env.VITE_ZKEY_DOWNLOAD_URL,
        "email_content",
        () => setDownloadProgress((prev) => prev + 1)
      )
      console.timeEnd("Downloading Zkey file");
    }
    func()
  }, [])

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
            {/* <Step index={2}>
              <ZkProofStep />
            </Step> */}
            <Step index={2}>
              <ArticleEditorStep categories={categories} />
            </Step>
            <Step index={3}>
              <FinalSubmissionStep />
            </Step>
          </Stepper>
        </div>
      </main>
    </div>
  );
}
