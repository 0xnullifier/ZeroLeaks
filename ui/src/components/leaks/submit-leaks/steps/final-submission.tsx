import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Shield, AlertTriangle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSubmitLeakStore } from "@/lib/submit-leak-store";
import { uploadFile } from "@/lib/walrus";
import { useState } from "react";
import { toast } from "sonner";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from '@mysten/sui/transactions';
import { ThankYouComponent } from "@/components/thank-you";
import { LEAKS_OBJECT_ID, PACKAGE_ID } from "@/lib/constant";


export function FinalSubmissionStep() {
  const { title, summary, category, tags, content, zkProof, documentFiles, transactionDigest } = useSubmitLeakStore();
  const [loadingStage, setLoadingStage] = useState<"idle" | "walrus" | "onchain" | "done">("idle");

  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const handleSubmit = async () => {
    try {
      if (!account) {
        toast("Please login to submit your leak.", {
          position: "top-right",
        });
        return;
      }
      const _documentFilesToUpload = documentFiles.map(async (file) => {
        const fileBuffer = await uploadFile(await file.arrayBuffer());
        return {
          name: file.name,
          size: file.size,
          type: file.type,
          content: fileBuffer,
        }
      })
      const documentFilesToUpload = await Promise.all(_documentFilesToUpload);
      setLoadingStage("walrus");
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
      console.log(toStore);

      const arrayBufferForJson = new TextEncoder().encode(JSON.stringify(toStore));
      console.log("Submitting data:", toStore);
      console.log("buffer size", arrayBufferForJson.byteLength);
      const blobId = await uploadFile(arrayBufferForJson.buffer);
      console.log("Blob ID:", blobId);

      setLoadingStage("onchain");
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::verifier::new_leak`,
        arguments: [tx.pure.string(blobId), tx.object(LEAKS_OBJECT_ID)]
      });


      tx.setGasBudget(100000000)
      const { digest } = await signAndExecuteTransaction({
        transaction: tx,
      });


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

  // if (loadingStage === "done") {
  //   return <ThankYouComponent
  //     title="Thank You for Your Submission!"
  //     subtitle="Your leak has been securely submitted and will be verified."
  //     redirectUrl="/leaks"
  //     redirectText="Taking you to the leaks dashboard"
  //     countdownSeconds={10}
  //   />;
  // }

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
        {/* <div className="bg-warning/20 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-muted-foreground text-sm">
            After submission, you will receive a unique secure key. Save this key in a safe place as it will be
            your only way to securely communicate with our team regarding this leak.
          </p>
        </div> */}
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