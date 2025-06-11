import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useStepper } from "@/components/ui/stepper";
import EmailInfoStep from "@/components/leaks/submit-leaks/steps/email-info";

export function EmailUploadStep() {
    const { nextStep } = useStepper();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Email File
                </CardTitle>
            </CardHeader>
            <CardContent>
                <EmailInfoStep />
                <div className="flex justify-end mt-6">
                    <Button onClick={() => nextStep()}>
                        Next: Write Article
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
