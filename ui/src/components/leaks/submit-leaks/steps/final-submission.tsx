import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Shield, AlertTriangle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSubmitLeakStore } from "@/lib/submit-leak-store";
import { uploadFile } from "@/lib/walrus";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCurrentAccount, useSignAndExecuteTransaction, useSignTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from '@mysten/sui/transactions';
import { ThankYouComponent } from "@/components/thank-you";
import { DAO_OBJECT_ID, LEAKS_OBJECT_ID, PACKAGE_ID, VK_OBJECT_ID } from "@/lib/constant";
import { serializeProof, serializePublicSignal } from "@/lib/serializer";
import { getAllowlistedKeyServers, SealClient } from "@mysten/seal"
import { toHex, fromHex } from "@mysten/sui/utils";
import { networkConfig, useNetworkVariable } from "@/lib/networkConfig";
import { bcs } from "@mysten/sui/bcs";
import { useRefetchAll } from "@/hooks/useRefetchAll";


export function FinalSubmissionStep() {
  const { title, summary, category, tags, content, zkProof, documentFiles, transactionDigest, emailContent, documentEncryptionSettings } = useSubmitLeakStore();
  const [loadingStage, setLoadingStage] = useState<"idle" | "walrus" | "onchain" | "done">("idle");

  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const sealClient = new SealClient({
    suiClient,
    serverConfigs: getAllowlistedKeyServers('testnet').map((id) => ({
      objectId: id,
      weight: 1,
    })),
    verifyKeyServers: false,
  });

  // Use centralized refetch hook
  const { refetchAll, daoData } = useRefetchAll();


  console.log("Daodata", daoData);
  useEffect(() => {
    if (!daoData) return;

    const data = daoData.data;
    ///@ts-ignore
    if (!data || !data.content || !data.content.fields) {
      toast("DAO object not found or invalid format.", {
        position: "top-right",
      });
      return;
    }

    ///@ts-ignore
    const fields = data.content.fields;
    if (fields.allowlist.length === undefined) {
      toast("Allowlist index not found in DAO object.", {
        position: "top-right",
      });
      return;
    }

    setAllowlistIndex(fields.allowlist.length);
  }, [daoData]);

  const [allowlistIndex, setAllowlistIndex] = useState<number | null>(null);
  const encryptFiles = async (file: File) => {
    console.log(allowlistIndex)
    if (allowlistIndex === null) {
      await refetchAll();
    }
    const indexBytes = bcs.u64().serialize(allowlistIndex!).toBytes();
    const id = toHex(indexBytes)
    const fileBuffer = await file.arrayBuffer();
    console.log("fileBuffer", fileBuffer);
    const encryptedContent = await sealClient.encrypt({
      threshold: 2,
      packageId: PACKAGE_ID,
      id,
      data: new Uint8Array(fileBuffer),
    });
    console.log("encryptedContent", encryptedContent);
    return encryptedContent.encryptedObject;
  }

  const handleSubmit = async () => {
    try {
      if (!account) {
        toast("Please login to submit your leak.", {
          position: "top-right",
        });
        return;
      }
      if (!zkProof || !zkProof.proof) {
        toast("Please generate a valid zk proof before submitting.", {
          position: "top-right",
        });
        return;
      }
      setLoadingStage("walrus");

      const _documentFilesToUpload = documentFiles.map(async (file) => {
        let fileBuffer: ArrayBufferLike;
        if (documentEncryptionSettings[file.name]) {
          const encryptedContent = await encryptFiles(file);
          fileBuffer = encryptedContent;
        } else {
          fileBuffer = await file.arrayBuffer();
        }
        const blobId = await uploadFile(fileBuffer);
        return {
          name: file.name,
          size: file.size,
          type: file.type,
          content: blobId,
          encryped: documentEncryptionSettings[file.name] || false,
        }
      })

      const documentFilesToUpload = await Promise.all(_documentFilesToUpload);

      const toStore = {
        date: new Date().toISOString(),
        title,
        summary,
        category,
        tags,
        content,
        zkProof,
        transactionDigest,
        documentFiles: documentFilesToUpload
      };

      const arrayBufferForJson = new TextEncoder().encode(JSON.stringify(toStore));
      const blobId = await uploadFile(arrayBufferForJson.buffer);

      const proofBuffer = serializeProof(zkProof.proof)
      const publicSignals = serializePublicSignal(zkProof.publicSignals);

      setLoadingStage("onchain");
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::verifier::new_leak`,
        arguments: [tx.pure.string(blobId), tx.pure.string(emailContent), tx.object(LEAKS_OBJECT_ID), tx.object(VK_OBJECT_ID), tx.pure.vector("u8", proofBuffer), tx.pure.vector("u8", publicSignals), tx.object(DAO_OBJECT_ID)],
      });


      tx.setGasBudget(100000000)
      const { digest } = await signAndExecuteTransaction({
        transaction: tx,
      });

      // Store the submission data in the backend
      try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/leaks/submissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            blobId,
            transactionDigest: digest,
            title,
            author: account.address,
            category,
            timestamp: new Date().toISOString()
          }),
        });
        console.log('Submission data stored successfully');
      } catch (storageError) {
        console.error('Failed to store submission data:', storageError);
        // Don't fail the entire process if storage fails
      }

      const redirectUrl = "https://suiscan.xyz/testnet/tx/" + digest;

      toast("Trasaction Sent Succesffuly", {
        position: "top-right",
        action: (
          <Button
            onClick={() => {
              window.open(redirectUrl, "_blank");
            }}
            className="bg-white"
          >
            <Send className="stroke-black" />{" "}
          </Button>
        ),
      });

      // Refetch all data after successful submission
      try {
        await refetchAll();
        console.log('All data refetched after leak submission');
      } catch (refetchError) {
        console.error('Failed to refetch data after submission:', refetchError);
        // Don't fail the submission process if refetch fails
      }

      setLoadingStage("done");
    } catch (error: any) {
      setLoadingStage("idle");
      console.error("Error during submission:", error);
      toast(error?.message || "An unexpected error occurred during submission.");
    }
  };


  const getButtonText = () => {
    switch (loadingStage) {
      case "walrus":
        return "Uploading to Walrus...";
      case "onchain":
        return "Uploading On Chain...";
      case "done":
        return "Submitted!";
      default:
        return "Submit Securely";
    }
  };

  if (loadingStage === "done") {
    return <ThankYouComponent
      title="Thank You for Your Submission!"
      subtitle="Your leak has been securely submitted is verified."
      redirectUrl="/leaks"
      redirectText="Taking you to the leaks dashboard"
      countdownSeconds={10}
    />;
  }

  return (
    <Card className="bg-card border-border/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Final Submission
        </CardTitle>
        <CardDescription>Please ensure the following</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-background rounded-lg p-4 border border-border/70">
          <h3 className="font-medium mb-2">Submission Checklist</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <input type="checkbox" id="check-1" className="mt-1 accent-primary" />
              <Label htmlFor="check-1" className="font-normal text-sm">
                I confirm that this information is accurate and in the public interest.
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <input type="checkbox" id="check-2" className="mt-1 accent-primary" />
              <Label htmlFor="check-2" className="font-normal text-sm">
                I understand that once submitted, the content cannot be retracted.
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <input type="checkbox" id="check-3" className="mt-1 accent-primary" />
              <Label htmlFor="check-3" className="font-normal text-sm">
                I have removed any personally identifying information from all documents.
              </Label>
            </div>

          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => handleSubmit()}
          className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
          size="default"
          disabled={loadingStage !== "idle"}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
}