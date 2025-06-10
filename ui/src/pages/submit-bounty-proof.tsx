import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Upload, Shield, AlertTriangle, Send } from "lucide-react";
import { useBountyStore } from "@/lib/bounty-store";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { toast } from "sonner";
import { Stepper, StepperProgress, Step } from "@/components/ui/stepper";
import EmailInfoStep from "@/components/leaks/submit-leaks/steps/email-info";
import { ZkProofStep } from "@/components/leaks/submit-leaks/steps";

export function SubmitBountyProofPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentAccount = useCurrentAccount();
    const { getBountyById } = useBountyStore();

    const [bounty, setBounty] = useState(() => getBountyById(id || ""));
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!bounty) {
            const foundBounty = getBountyById(id || "");
            setBounty(foundBounty);
        }
    }, [id, getBountyById, bounty]);

    useEffect(() => {
        if (!currentAccount) {
            toast.error("Please connect your wallet to submit a proof");
            navigate(`/bounties/${id}`);
            return;
        }

        if (!bounty) {
            toast.error("Bounty not found");
            navigate("/bounties");
            return;
        }

        if (bounty.status !== "active") {
            toast.error("This bounty is no longer active");
            navigate(`/bounties/${id}`);
            return;
        }

        if (currentAccount.address === bounty.creator) {
            toast.error("You cannot submit to your own bounty");
            navigate(`/bounties/${id}`);
            return;
        }
    }, [currentAccount, bounty, id, navigate]);

    const handleSubmitProof = async () => {
        if (!currentAccount || !bounty) return;

        setIsSubmitting(true);
        try {
            // Here you would integrate with the actual ZK proof submission system
            // For now, we'll simulate a successful submission

            toast.success("Proof submitted successfully! It will be reviewed for verification.");
            navigate(`/bounties/${bounty.id}`);
        } catch (error) {
            console.error("Error submitting proof:", error);
            toast.error("Failed to submit proof");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!bounty) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Bounty not found</h1>
                    <Button asChild>
                        <Link to="/bounties">Back to Bounties</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground min-h-screen">
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Button variant="ghost" asChild className="mb-4">
                            <Link to={`/bounties/${bounty.id}`}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Bounty
                            </Link>
                        </Button>

                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            Submit ZK Proof
                        </h1>
                        <p className="text-muted-foreground max-w-2xl mb-6">
                            Submit a zero-knowledge proof that you have the information requested
                            in this bounty. Your identity will remain protected while proving
                            you possess the relevant emails or documents.
                        </p>

                        {/* Bounty Summary */}
                        <Card className="bg-muted/30">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className="bg-primary">
                                                {bounty.category}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                Reward: {bounty.reward} SUI
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">{bounty.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {bounty.description}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Important Notice */}
                    <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 mb-8">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                                        Submission Requirements
                                    </h4>
                                    <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                                        <li>• Upload the .eml file containing the relevant information</li>
                                        <li>• Generate a zero-knowledge proof of email authenticity</li>
                                        <li>• Ensure your proof matches the bounty's verification criteria</li>
                                        <li>• Submissions are final and cannot be modified after submission</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Verification Criteria Reminder */}
                    {bounty.verificationCriteria && (
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Verification Criteria
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    {bounty.verificationCriteria}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Stepper for Proof Submission */}
                    <Stepper totalSteps={3} initialStep={currentStep}>
                        <StepperProgress className="mb-8" />

                        <Step index={0}>
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
                                        <Button onClick={() => setCurrentStep(1)}>
                                            Next: Generate Proof
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </Step>

                        <Step index={1}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Generate ZK Proof
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ZkProofStep />
                                    <div className="flex justify-between mt-6">
                                        <Button variant="outline" onClick={() => setCurrentStep(0)}>
                                            Back
                                        </Button>
                                        <Button onClick={() => setCurrentStep(2)}>
                                            Next: Review & Submit
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </Step>

                        <Step index={2}>
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
                                                <li>• Email file uploaded and processed</li>
                                                <li>• Zero-knowledge proof generated</li>
                                                <li>• Proof validates email authenticity</li>
                                                <li>• Ready for blockchain submission</li>
                                            </ul>
                                        </div>

                                        <Separator />

                                        <div className="text-sm text-muted-foreground">
                                            <p className="mb-2">
                                                By submitting this proof, you confirm that:
                                            </p>
                                            <ul className="space-y-1 ml-4">
                                                <li>• The information meets the bounty requirements</li>
                                                <li>• Your proof is authentic and verifiable</li>
                                                <li>• You understand the submission is final</li>
                                            </ul>
                                        </div>

                                        <div className="flex justify-between">
                                            <Button variant="outline" onClick={() => setCurrentStep(1)}>
                                                Back
                                            </Button>
                                            <Button onClick={handleSubmitProof} disabled={isSubmitting}>
                                                {isSubmitting ? "Submitting..." : "Submit Proof"}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Step>
                    </Stepper>
                </div>
            </main>
        </div>
    );
}
