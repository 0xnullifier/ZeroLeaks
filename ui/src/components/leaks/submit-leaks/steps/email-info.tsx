import { Download, Send } from "lucide-react";

import { useSubmitLeakStore } from "@/lib/submit-leak-store";
import { Button } from "@/components/ui/button";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { generateEmailContentVerifierCircuitInputs } from "@/lib/helpers";
import { generateProof } from "@zk-email/helpers/dist/chunked-zkey";
import { serializeProof, serializePublicSignal, type Proof } from "@/lib/serializer";
import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { PACKAGE_ID, VK_OBJECT_ID } from "@/lib/constant";
import { toast } from "sonner"
import React from "react";
import ProofVerificationComponent, { type GenerateProofsInBrowserArgs, type ProofResponseJSON } from "../../test";
import { useStepper } from "@/components/ui/stepper";

export default function EmailInfoStep() {
  const account = useCurrentAccount();
  const { nextStep } = useStepper();
  const { emlFile, emailContent, setEmlFile, setEmailContent, setZkProof, setTransactionDigest } =
    useSubmitLeakStore();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const handleFileSelect = (file: File) => {
    setEmlFile(file);
  }
  const handleEmailContentChange = (content: string) => {
    setEmailContent(content);
  };


  const generateProofsInBrowser = async ({ file, emailContent, setCurrentStage, setProgressStages }: GenerateProofsInBrowserArgs) => {
    if (!account) {
      toast("Please login to verify on chain", {
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
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setProgressStages((prev) => prev.map((stage, index) => (index === 1 ? { ...stage, completed: true } : stage)))
      setCurrentStage(2);
      verifyOnChain({ proof, publicSignals });
      setProgressStages((prev) => prev.map((stage, index) => (index === 2 ? { ...stage, completed: true } : stage)))
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
      return proofResponse;
    } catch (error) {
      toast("Failed to read the .json file", { position: "top-right" });
      return null;
    }
  };

  const verifyOnChain = async ({ proof, publicSignals }: ProofResponseJSON) => {
    if (!account) {
      toast("Please login to verify on chain", {
        position: "top-right",
      });
      return;
    }

    try {
      const proofUint8Array = serializeProof(proof);
      const publicSignalsUint8Array = serializePublicSignal(publicSignals);

      const transaction = new Transaction();

      transaction.moveCall({
        arguments: [
          transaction.object(VK_OBJECT_ID),
          transaction.pure.vector("u8", proofUint8Array),
          transaction.pure.vector("u8", publicSignalsUint8Array),
        ],
        target: `${PACKAGE_ID}::verifier::verify_zeroleaks_proof`,
      });

      const { digest } = await signAndExecuteTransaction({
        transaction,
      });
      const redirectUrl = "https://suiscan.xyz/testnet/tx/" + digest;

      toast("Trasaction Sent Succesffuly", {
        position: "top-right",
        action: (
          <Button
            variant={"outline"}
            onClick={() => {
              window.open(redirectUrl, "_blank");
            }}
            className="bg-white"
          >
            <Send className="stroke-black" />{" "}
          </Button>
        ),
      });
      setZkProof({ proof, publicSignals });
      setTransactionDigest(digest)
      nextStep();
    } catch (error) {
      console.error("Error verifying on chain:", error);
      toast("Failed to verify on chain", { position: "top-right" });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Email Proof Verification System</h1>
          <p className="text-muted-foreground">
            Generate cryptographic proofs for email content and verify them on-chain
          </p>
        </div>
        <ProofVerificationComponent
          onFileSelect={handleFileSelect}
          onEmailContentChange={handleEmailContentChange}
          generateProofsInBrowser={generateProofsInBrowser}
          proofGenerateYourself={handleUploadProof}
          verifyOnChain={verifyOnChain}
        />
      </div>
    </div>
  );
}


