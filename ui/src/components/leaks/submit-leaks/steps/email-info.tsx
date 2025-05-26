import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Check, Download, Mail, Send } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitLeakStore } from "@/lib/submit-leak-store";
import { Button } from "@/components/ui/button";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { generateEmailContentVerifierCircuitInputs } from "@/lib/helpers";
import { generateProof } from "@zk-email/helpers/dist/chunked-zkey";
import { serializeProof, serializePublicSignal } from "@/lib/serializer";
import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { PACKAGE_ID, VK_OBJECT_ID } from "@/lib/constant";
import { toast } from "sonner"


export function EmailInfoStep() {
  const account = useCurrentAccount()
  const { emlFile, emailContent, setEmlFile, setEmailContent } =
    useSubmitLeakStore();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const handleEmlFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEmlFile(file);
    }
  };

  const handleVerify = async () => {
    if (!emlFile || !emailContent || !account) {
      toast("Invalid Inputs or account not connected", {
        position: "top-right"
      })
      return;
    }
    const email = await emlFile.text()
    const emailContentInputs = await generateEmailContentVerifierCircuitInputs(
      email,
      account.address,
      emailContent
    );
    const { proof, publicSignals } = await generateProof(
      emailContentInputs,
      import.meta.env.VITE_ZKEY_DOWNLOAD_URL,
      "email_content"
    )
    const downloadProofJson = () => {
      const blob = new Blob([JSON.stringify(proof, null, 2)], {
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
    }

    toast("Proof Generated Successfully ✅", {
      position: "top-right",
      action: (
        <Button onClick={downloadProofJson} variant={"ghost"} >
          <Download className="w-4 h-4" />
        </Button>
      )
    })

    const proofUint8Array = serializeProof(proof);
    const publicSignalsUint8Array = serializePublicSignal(publicSignals)

    const transaction = new Transaction()

    transaction.moveCall({
      arguments: [transaction.object(VK_OBJECT_ID), transaction.pure.vector('u8', proofUint8Array), transaction.pure.vector('u8', publicSignalsUint8Array)],
      target: `${PACKAGE_ID}::verifier::verify_zeroleaks_proof`
    })


    const { digest } = await signAndExecuteTransaction({
      transaction
    })
    const redirectUrl = "https://suiscan.xyz/testnet/tx/" + digest;

    toast("Trasaction Sent Succesffuly", {
      position: "top-right",
      action: <Button variant={"ghost"} onClick={() => { window.location.href = redirectUrl }}><Send /> </Button>
    })

  };

  return (
    <Card className="bg-card border-border/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Email Information
        </CardTitle>
        <CardDescription>
          Provide the email details related to the leak. Your identity will
          remain protected.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="eml-file">Eml file to verify</Label>
          <Input
            id="eml-file"
            type="file"
            accept=".eml"
            onChange={handleEmlFileChange}
            defaultValue={emlFile ? emlFile.name : ""}
            placeholder="e.g., executive@company.com"
            className="bg-secondary border-border/60 focus-visible:ring-primary"
          />
          <p className="text-xs text-muted-foreground">
            The eml file to verify.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-content">Email Content</Label>
          <Textarea
            id="email-content"
            onChange={(e) => setEmailContent(e.target.value)}
            defaultValue={emailContent}
            placeholder="Paste the content of the email here for verification..."
            className="bg-secondary border-border/60 focus-visible:ring-primary min-h-[200px]"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={() => handleVerify()} className="w-32">
          Verify <Check className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
