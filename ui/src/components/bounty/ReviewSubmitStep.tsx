import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Send } from "lucide-react";
import { useStepper } from "@/components/ui/stepper";
import { useSubmitLeakStore } from "@/lib/submit-leak-store";

interface ReviewSubmitStepProps {
    onSubmit: () => void;
    isSubmitting: boolean;
}

export function ReviewSubmitStep({ onSubmit, isSubmitting }: ReviewSubmitStepProps) {
    const { prevStep } = useStepper();
    const { zkProof, emailContent, title, content } = useSubmitLeakStore();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Review & Submit
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Submission Summary</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li className={emailContent ? "• Email content provided ✓" : "• Email content required"}>
                                {emailContent ? "• Email content provided ✓" : "• Email content required"}
                            </li>
                            <li className={title && content ? "• Article written ✓" : "• Article required"}>
                                {title && content ? "• Article written ✓" : "• Article required"}
                            </li>
                            <li className={zkProof ? "• Zero-knowledge proof generated ✓" : "• Zero-knowledge proof required"}>
                                {zkProof ? "• Zero-knowledge proof generated ✓" : "• Zero-knowledge proof required"}
                            </li>
                            <li className={zkProof ? "• Proof validates email authenticity ✓" : "• Proof validation pending"}>
                                {zkProof ? "• Proof validates email authenticity ✓" : "• Proof validation pending"}
                            </li>
                            <li className={zkProof && emailContent && title && content ? "• Ready for blockchain submission ✓" : "• Complete all steps to submit"}>
                                {zkProof && emailContent && title && content ? "• Ready for blockchain submission ✓" : "• Complete all steps to submit"}
                            </li>
                        </ul>
                    </div>

                    <Separator />

                    <div className="text-sm text-muted-foreground">
                        <p className="mb-2">
                            By submitting this response, you confirm that:
                        </p>
                        <ul className="space-y-1 ml-4">
                            <li>• Your article provides valuable information that meets the bounty requirements</li>
                            <li>• Your proof is authentic and verifiable</li>
                            <li>• The content is original and properly researched</li>
                            <li>• You understand the submission is final</li>
                        </ul>
                    </div>

                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => prevStep()}>
                            Back
                        </Button>
                        <Button
                            onClick={onSubmit}
                            disabled={!zkProof || !emailContent.trim() || !content.trim()}
                        >
                            {isSubmitting ? "Submitting..." : "Submit Response"}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
