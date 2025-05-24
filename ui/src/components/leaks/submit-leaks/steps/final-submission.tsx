import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSubmitLeakStore } from "@/lib/submit-leak-store";

export function FinalSubmissionStep() {
  const { title, summary, category, tags, content, zkProof } = useSubmitLeakStore();

  const handleSubmit = () => {
    console.log(title, summary, category, tags, content, zkProof);
  };

  return (
    <Card className="bg-card border-border/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Final Submission
        </CardTitle>
        <CardDescription>Review your submission and confirm that all information is accurate.</CardDescription>
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
            <div className="flex items-start gap-2">
              <input type="checkbox" id="check-4" className="mt-1 accent-primary" />
              <Label htmlFor="check-4" className="font-normal text-sm">
                I consent to the generation of a zero-knowledge proof to verify this submission.
              </Label>
            </div>
          </div>
        </div>
        <div className="bg-warning/20 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-muted-foreground text-sm">
            After submission, you will receive a unique secure key. Save this key in a safe place as it will be
            your only way to securely communicate with our team regarding this leak.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => handleSubmit()} className="w-full bg-primary hover:bg-primary/90 text-lg py-6" size="lg">
          Submit Securely
        </Button>
      </CardFooter>
    </Card>
  );
} 