import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useStepper } from "@/components/ui/stepper";
import { ArticleEditor } from "@/components/article-editor";

export function ArticleWriteStep() {
    const { nextStep, prevStep } = useStepper();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Write Article
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ArticleEditor />
                <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => prevStep()}>
                        Back
                    </Button>
                    <Button onClick={() => nextStep()}>
                        Next
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
