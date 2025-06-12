import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";
import { Shield, Coins, Target, AlertTriangle, ArrowLeft, Send } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useBountyStore } from "@/lib/bounty-store";
import type { Bounty } from "@/lib/types";
import { toast } from "sonner";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, BOUNTIES_OBJECT_ID, VK_BYTES } from "@/lib/constant";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";

const categories = [
    "Government",
    "Corporate",
    "Military",
    "Finance",
    "Healthcare",
    "Environment",
    "Technology",
    "Other"
];

export function CreateBountyPage() {
    const navigate = useNavigate();
    const currentAccount = useCurrentAccount();
    const { addBounty } = useBountyStore();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "" as string,
        tags: [] as string[],
        reward: "",
        numberOfRewards: "1",
        deadline: null as Date | null,
        requiredInfo: "",
        verificationCriteria: "",
        vkBytes: "", // verification key bytes - would typically be generated/uploaded
    });

    const [tagInput, setTagInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleAddCategory = (category: string) => {
        setFormData(prev => ({
            ...prev,
            category: category
        }));
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentAccount) {
            toast.error("Please connect your wallet to create a bounty");
            return;
        }

        if (!formData.title || !formData.description || !formData.category || !formData.reward || !formData.deadline) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (formData.tags.length === 0) {
            toast.error("Please add at least one tag");
            return;
        }

        setIsSubmitting(true);

        try {
            // First create the blockchain transaction
            const tx = new Transaction();

            // Convert reward to MIST (1 SUI = 10^9 MIST)
            const rewardAmount = Math.floor(parseFloat(formData.reward) * 1_000_000_000);
            // add 5 minutes for testing
            const inputDate = formData.deadline;
            const now = new Date();
            inputDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
            const deadlineTimestamp = (inputDate.getTime() - Date.now()) + 5 * 60 * 1000;

            const coin = tx.splitCoins(tx.gas, [rewardAmount * parseInt(formData.numberOfRewards)])

            tx.moveCall({
                target: `${PACKAGE_ID}::bounties::create_bounty`,
                arguments: [
                    tx.pure.string(formData.title),
                    tx.pure.string(formData.description),
                    tx.pure.string(formData.requiredInfo),
                    tx.pure.string(formData.verificationCriteria),
                    tx.pure.string(formData.category),
                    tx.pure.vector("string", formData.tags),
                    tx.pure.u64(rewardAmount),
                    tx.pure.u64(deadlineTimestamp),
                    tx.pure.vector("u8", VK_BYTES),
                    tx.pure.u64(formData.numberOfRewards),
                    coin,
                    tx.object(SUI_CLOCK_OBJECT_ID),
                    tx.object(BOUNTIES_OBJECT_ID)
                ]
            })
            const { digest } = await signAndExecuteTransaction({
                transaction: tx
            })
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
            console.error("Error creating bounty:", error);
            toast.error("Failed to create bounty");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-background text-foreground min-h-screen">
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Button variant="ghost" asChild className="mb-4">
                            <Link to="/bounties">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Bounties
                            </Link>
                        </Button>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            Create Information Bounty
                        </h1>
                        <p className="text-muted-foreground max-w-2xl">
                            Set a reward for specific information you need. Community members can submit
                            zero-knowledge proofs of relevant emails or documents to claim the bounty.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="Brief, descriptive title for your bounty"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Detailed description of the information you're seeking"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="mt-1 min-h-[100px]"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => handleAddCategory(value)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="tags">Tags *</Label>
                                    <div className="mt-1 space-y-2">
                                        <div className="flex gap-2">
                                            <Input
                                                id="tags"
                                                placeholder="Add a tag"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                            />
                                            <Button type="button" onClick={handleAddTag} variant="outline">
                                                Add
                                            </Button>
                                        </div>
                                        {formData.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {formData.tags.map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        variant="secondary"
                                                        className="cursor-pointer"
                                                        onClick={() => handleRemoveTag(tag)}
                                                    >
                                                        {tag} ×
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reward and Deadline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Coins className="h-5 w-5" />
                                    Reward & Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="reward">Reward Amount (SUI) *</Label>
                                    <Input
                                        id="reward"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={formData.reward}
                                        onChange={(e) => setFormData(prev => ({ ...prev, reward: e.target.value }))}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="numberOfRewards">Number of Rewards *</Label>
                                    <Input
                                        id="numberOfRewards"
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        value={formData.numberOfRewards}
                                        onChange={(e) => setFormData(prev => ({ ...prev, numberOfRewards: e.target.value }))}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>Deadline *</Label>
                                    <div className="mt-1">
                                        <DatePicker
                                            date={formData.deadline || undefined}
                                            setDate={(date) => {
                                                if (typeof date === 'function') {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        deadline: date(prev.deadline || undefined) || null
                                                    }));
                                                } else {
                                                    setFormData(prev => ({ ...prev, deadline: date || null }));
                                                }
                                            }}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Verification Requirements */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Verification Requirements
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="requiredInfo">Required Information</Label>
                                    <Textarea
                                        id="requiredInfo"
                                        placeholder="Describe the specific type of information you need (e.g., emails from specific dates, document types, etc.)"
                                        value={formData.requiredInfo}
                                        onChange={(e) => setFormData(prev => ({ ...prev, requiredInfo: e.target.value }))}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="verificationCriteria">Verification Criteria</Label>
                                    <Textarea
                                        id="verificationCriteria"
                                        placeholder="How will submissions be verified? What proof is needed? (e.g., DKIM signatures, specific email headers, etc.)"
                                        value={formData.verificationCriteria}
                                        onChange={(e) => setFormData(prev => ({ ...prev, verificationCriteria: e.target.value }))}
                                        className="mt-1"
                                    />
                                </div>

                            </CardContent>
                        </Card>

                        {/* Important Notice */}
                        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                                            Important Notice
                                        </h4>
                                        <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                                            <li>• Bounty rewards are held in escrow until completion</li>
                                            <li>• All submissions must include valid zero-knowledge proofs</li>
                                            <li>• You can cancel active bounties before any submissions</li>
                                            <li>• Be specific about requirements to avoid disputes</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Separator />

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <Button variant="outline" asChild>
                                <Link to="/bounties">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create Bounty"}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
