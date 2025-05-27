import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { useSubmitLeakStore } from "@/lib/submit-leak-store";
import { useStepper } from "@/components/ui/stepper";

export function DocumentUploadStep() {
  const {
    documentFiles,
    setDocumentFiles,
  } = useSubmitLeakStore();
  const stepper = useStepper();
  return (
    <Card className="bg-card border-border/70">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Document Upload
        </CardTitle>
        <CardDescription>
          Upload documents related to the leak. All files will be securely
          processed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FileUpload
          onChange={(files) => {
            setDocumentFiles(files);
          }}
          defaultFiles={documentFiles}
        />
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button onClick={() => stepper.prevStep()} variant="ghost">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={() => stepper.nextStep()}
          className="w-32 bg-primary hover:bg-primary/90"
        >
          Save <Save className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
