import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Check, Mail } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStepper } from "@/components/ui/stepper";
import { useSubmitLeakStore } from "@/lib/submit-leak-store";
import { Button } from "@/components/ui/button";

export function EmailInfoStep() {
  const stepper = useStepper();
  const { emlFile, emailContent, setEmlFile, setEmailContent } =
    useSubmitLeakStore();

  const handleEmlFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEmlFile(file);
    }
  };

  const handleVerify = () => {
    // TODO: Verify the eml file
    stepper.nextStep();
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
