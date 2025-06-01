import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ArrowLeft, Save, Upload, Shield, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { Switch } from "@/components/ui/switch";
import { useSubmitLeakStore } from "@/lib/submit-leak-store";
import { useStepper } from "@/components/ui/stepper";

export function DocumentUploadStep() {
  const {
    documentFiles,
    setDocumentFiles,
    documentEncryptionSettings,
    setDocumentEncryption,
  } = useSubmitLeakStore();
  const stepper = useStepper();

  const handleFilesChange = (files: File[]) => {
    setDocumentFiles([...documentFiles, ...files]);
  };

  const removeFile = (index: number) => {
    const newFiles = documentFiles.filter((_, i) => i !== index);
    setDocumentFiles(newFiles);
  };

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
          onChange={handleFilesChange}
          defaultFiles={[]}
        />

        {documentFiles.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Uploaded Documents</h3>
            {documentFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <Label htmlFor={`encrypt-${index}`} className="text-xs">
                      Encrypt
                    </Label>
                    <Switch
                      id={`encrypt-${index}`}
                      checked={documentEncryptionSettings[file.name] || false}
                      onCheckedChange={(checked) => setDocumentEncryption(file.name, checked)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
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
