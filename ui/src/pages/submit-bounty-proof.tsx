import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, AlertTriangle, Send } from "lucide-react";
import { useBountyStore } from "@/lib/bounty-store";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, BOUNTIES_OBJECT_ID } from "@/lib/constant";
import { toast } from "sonner";
import { Stepper, StepperProgress, Step } from "@/components/ui/stepper";
import { useSubmitLeakStore } from "@/lib/submit-leak-store";
import { serializeProof, serializePublicSignal } from "@/lib/serializer";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";
import { EmailUploadStep, ArticleWriteStep, ReviewSubmitStep } from "@/components/bounty";

export function SubmitBountyProofPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentAccount = useCurrentAccount();
    const { getBountyById } = useBountyStore();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const { zkProof, emailContent, title, content } = useSubmitLeakStore();

    const [bounty, setBounty] = useState(() => getBountyById(id || ""));
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

        if (bounty.status !== "Open") {
            toast.error("This bounty is no longer accepting submissions");
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

        if (!zkProof) {
            toast.error("Please generate a proof first");
            return;
        }

        if (!emailContent.trim()) {
            toast.error("Please provide email content");
            return;
        }

        if (!content.trim()) {
            toast.error("Please write the article content");
            return;
        }

        setIsSubmitting(true);
        try {
            // Serialize the proof data
            const proofBuffer = serializeProof(zkProof.proof);
            const publicSignals = serializePublicSignal(zkProof.publicSignals);

            const tx = new Transaction();

            tx.moveCall({
                target: `${PACKAGE_ID}::bounties::submit_for_bounty`,
                arguments: [
                    tx.pure.string(emailContent),
                    tx.pure.string(content),
                    tx.pure.u64(bounty.id),
                    tx.pure.vector("u8", proofBuffer),
                    tx.pure.vector("u8", publicSignals),
                    tx.object(SUI_CLOCK_OBJECT_ID),
                    tx.object(BOUNTIES_OBJECT_ID)
                ],
            });

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
                            Submit Bounty Response
                        </h1>
                        <p className="text-muted-foreground max-w-2xl mb-6">
                            Submit a comprehensive response to this bounty including a detailed article
                            and zero-knowledge proof that validates your information. Your identity will
                            remain protected while proving you possess the relevant emails or documents,
                            and your article will provide valuable insights to the community.
                        </p>

                        {/* Bounty Summary */}
                        <Card className="bg-muted/30">
                            <CardContent className="pt-6">                        <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className="bg-primary">
                                            {bounty.category[0] || "General"}
                                        </Badge>
                                        {bounty.category.length > 1 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{bounty.category.length - 1} more
                                            </Badge>
                                        )}
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
                                        <li>• Write a detailed article explaining your findings and context</li>
                                        <li>• Generate a zero-knowledge proof of email authenticity</li>
                                        <li>• Ensure your proof matches the bounty's verification criteria</li>
                                        <li>• Submissions are final and cannot be modified after submission</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Verification Key Information */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Verification Requirements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Your zero-knowledge proof must be generated using the verification key specified for this bounty.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Stepper for Proof Submission */}
                    <Stepper totalSteps={3} initialStep={0}>
                        <StepperProgress className="mb-8" />

                        <Step index={0}>
                            <EmailUploadStep />
                        </Step>

                        <Step index={1}>
                            <ArticleWriteStep />
                        </Step>

                        <Step index={2}>
                            <ReviewSubmitStep
                                onSubmit={handleSubmitProof}
                                isSubmitting={isSubmitting}
                            />
                        </Step>
                    </Stepper>
                </div>
            </main>
        </div>
    );
}
