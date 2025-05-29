import { Download } from "lucide-react";

import { useSubmitLeakStore } from "@/lib/submit-leak-store";
import { Button } from "@/components/ui/button";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { generateEmailContentVerifierCircuitInputs } from "@/lib/helpers";
import { generateProof } from "@zk-email/helpers/dist/chunked-zkey";
import { toast } from "sonner"
import React from "react";
import ProofVerificationComponent, { type GenerateProofsInBrowserArgs, type ProofResponseJSON } from "../../email_info";
import { useStepper } from "@/components/ui/stepper";

export default function EmailInfoStep() {
  const account = useCurrentAccount();
  const { nextStep } = useStepper();
  const { emlFile, emailContent, setEmlFile, setEmailContent, setZkProof } =
    useSubmitLeakStore();
  const handleFileSelect = (file: File) => {
    setEmlFile(file);
  }
  const handleEmailContentChange = (content: string) => {
    setEmailContent(content);
  };


  const generateProofsInBrowser = async ({ file, emailContent, setCurrentStage, setProgressStages }: GenerateProofsInBrowserArgs) => {
    if (!account) {
      toast("Please login to generate proof", {
        position: "top-right",
      });
      return;
    }

    try {
      setCurrentStage(0)
      const email = await file.text();
      const emailContentInputs = await generateEmailContentVerifierCircuitInputs(
        email,
        account.address,
        emailContent
      );

      setProgressStages((prev) => prev.map((stage, index) => (index === 0 ? { ...stage, completed: true } : stage)))
      setCurrentStage(1);
      const { proof, publicSignals } = await generateProof(
        emailContentInputs,
        import.meta.env.VITE_ZKEY_DOWNLOAD_URL,
        "email_content"
      );

      const downloadProofJson = () => {
        const blob = new Blob([JSON.stringify({ proof, publicSignals }, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "proof.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      toast("Proof Generated Successfully ✅", {
        position: "top-right",
        action: (
          <Button onClick={downloadProofJson} variant={"ghost"}>
            <Download className="w-4 h-4" />
          </Button>
        ),
      });

      setProgressStages((prev) => prev.map((stage, index) => (index === 1 ? { ...stage, completed: true } : stage)))

      // Store the proof for later use in the final transaction step
      setZkProof({ proof, publicSignals });

      nextStep();
    } catch (error) {
      console.error("Error generating proofs:", error);
      toast("Failed to generate proofs", {
        position: "top-right",
      });
    }
  }

  const handleUploadProof = async (proofFile: File, setIsProofValid: React.Dispatch<React.SetStateAction<boolean>>): Promise<ProofResponseJSON | null> => {
    try {
      const text = await proofFile.text();
      const proofResponse = JSON.parse(text);

      if (!proofResponse.proof || !proofResponse.publicSignals) {
        toast("Invalid proof.json format", { position: "top-right" });
        return null
      }

      toast("Proof JSON uploaded successfully", { position: "top-right" });
      setIsProofValid(true);

      // Store the proof for later use in the final transaction step
      setZkProof(proofResponse);

      return proofResponse;
    } catch (error) {
      toast("Failed to read the .json file", { position: "top-right" });
      return null;
    }
  };

  const handleSubmitProof = () => {
    if (!emailContent.trim()) {
      toast("Please fill in the email content field", { position: "top-right" });
      return;
    }
    nextStep();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <ProofVerificationComponent
          onFileSelect={handleFileSelect}
          onEmailContentChange={handleEmailContentChange}
          generateProofsInBrowser={generateProofsInBrowser}
          proofGenerateYourself={handleUploadProof}
          onSubmitProof={handleSubmitProof}
          verifyOnChain={() => Promise.resolve()} // No-op function since verification is moved to final step
        />
      </div>
    </div>
  );
}


