import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, Vote, Shield, AlertCircle } from "lucide-react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, DAO_OBJECT_ID, BOUNTIES_OBJECT_ID } from "@/lib/constant";
import { toast } from "sonner";
import { useLeaksStore } from "@/lib/leaks-store";
import { useBountyStore } from "@/lib/bounty-store";
import { useRefetchAll } from "@/hooks/useRefetchAll";

// Define proposal type configurations
export interface ProposalTypeConfig {
    key: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    fields: Array<{
        name: string;
        label: string;
        type: 'text' | 'textarea' | 'number' | 'select' | 'custom';
        required?: boolean;
        placeholder?: string;
        options?: Array<{ value: string; label: string }>;
        customComponent?: React.ComponentType<any>;
    }>;
    validation?: (data: any) => string | null;
    onSubmit: (data: any, helpers: ProposalSubmitHelpers) => Promise<void>;
}

export interface ProposalSubmitHelpers {
    signAndExecuteTransaction: any;
    currentAccount: any;
    leaks: any[];
    bounties: any[];
    onSuccess: (digest: string) => void;
    onError: (error: any) => void;
}

// Default proposal types
const defaultProposalTypes: ProposalTypeConfig[] = [
    {
        key: "AddAddressToAllowlist",
        title: "Add to Allowlist",
        description: "Propose adding an address to a leak document allowlist",
        icon: Shield,
        color: "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
        fields: [
            { name: "title", label: "Proposal Title", type: "text", required: true, placeholder: "e.g., Grant access to government official" },
            { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Provide detailed reasoning for this proposal..." },
            { name: "allowlistIdx", label: "Allowlist Selection", type: "custom", required: true },
            { name: "applicantName", label: "Applicant Full Name", type: "text", required: true, placeholder: "e.g., John Doe" },
            { name: "applicantPosition", label: "Position/Title", type: "text", required: true, placeholder: "e.g., Senior Investigator" },
            { name: "applicantAgency", label: "Organization/Agency", type: "text", required: true, placeholder: "e.g., Federal Bureau of Investigation" },
        ],
        validation: (data) => {
            if (!data.title || !data.description || !data.applicantName || !data.applicantPosition || !data.applicantAgency) {
                return "All required fields must be filled";
            }
            return null;
        },
        onSubmit: async (data, { signAndExecuteTransaction, onSuccess, onError }) => {
            try {
                const tx = new Transaction();
                tx.moveCall({
                    target: `${PACKAGE_ID}::zl_dao::create_add_allowlist_proposal`,
                    arguments: [
                        tx.pure.string(data.applicantName),
                        tx.pure.string(data.title),
                        tx.pure.string(data.applicantAgency),
                        tx.pure.string(data.applicantPosition),
                        tx.pure.u64(parseInt(data.allowlistIdx)),
                        tx.pure.string(data.description),
                        tx.object("0x6"), // Clock object
                        tx.object(DAO_OBJECT_ID),
                    ],
                });
                tx.setGasBudget(10000000);
                const { digest } = await signAndExecuteTransaction({ transaction: tx });
                onSuccess(digest);
            } catch (error) {
                onError(error);
            }
        }
    },
    {
        key: "StartBountyTally",
        title: "Start Bounty Tally",
        description: "Propose starting the voting phase for a bounty",
        icon: Vote,
        color: "border-green-500 bg-green-50 dark:bg-green-950/20",
        fields: [
            { name: "title", label: "Proposal Title", type: "text", required: true, placeholder: "e.g., Start voting for bug bounty submissions" },
            { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Provide detailed reasoning for this proposal..." },
            { name: "bountyIdx", label: "Bounty Selection", type: "custom", required: true },
        ],
        validation: (data) => {
            if (!data.title || !data.description || !data.bountyIdx) {
                return "All required fields must be filled";
            }
            return null;
        },
        onSubmit: async (data, { signAndExecuteTransaction, onSuccess, onError }) => {
            try {
                const tx = new Transaction();
                tx.moveCall({
                    target: `${PACKAGE_ID}::zl_dao::create_bounty_tally_proposal`,
                    arguments: [
                        tx.pure.string(data.title),
                        tx.pure.u64(parseInt(data.bountyIdx)),
                        tx.pure.string(data.description),
                        tx.object("0x6"), // Clock object
                        tx.object(BOUNTIES_OBJECT_ID),
                        tx.object(DAO_OBJECT_ID),
                    ],
                });
                tx.setGasBudget(10000000);
                const { digest } = await signAndExecuteTransaction({ transaction: tx });
                onSuccess(digest);
            } catch (error) {
                onError(error);
            }
        }
    }
];

interface CreateProposalSheetProps {
    isOpen: boolean;
    onClose: () => void;
    proposalTypes?: ProposalTypeConfig[];
}

export function CreateProposalSheet({
    isOpen,
    onClose,
    proposalTypes = defaultProposalTypes
}: CreateProposalSheetProps) {
    const currentAccount = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const { leaks } = useLeaksStore();
    const { bounties } = useBountyStore();
    const { refetchAll } = useRefetchAll();

    const [selectedType, setSelectedType] = useState<string>("");
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(false);

    const selectedConfig = proposalTypes.find(type => type.key === selectedType);

    const handleFieldChange = (fieldName: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleSubmit = async () => {
        if (!selectedConfig || !currentAccount) {
            toast.error("Please select a proposal type and connect your wallet");
            return;
        }

        // Validate form
        const validationError = selectedConfig.validation?.(formData);
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setIsLoading(true);

        const helpers: ProposalSubmitHelpers = {
            signAndExecuteTransaction,
            currentAccount,
            leaks,
            bounties,
            onSuccess: (digest: string) => {
                toast.success("Proposal created successfully!", {
                    action: {
                        label: "View Transaction",
                        onClick: () => window.open(`https://suiscan.xyz/testnet/tx/${digest}`, "_blank"),
                    },
                });
                handleReset();
                onClose();
                // Refetch all data after proposal creation
                refetchAll().catch(console.error);
            },
            onError: (error: any) => {
                console.error("Error creating proposal:", error);
                toast.error(error?.message || "Failed to create proposal");
            }
        };

        try {
            await selectedConfig.onSubmit(formData, helpers);
        } catch (error: any) {
            helpers.onError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedType("");
        setFormData({});
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const renderCustomField = (field: any) => {
        if (field.name === "allowlistIdx") {
            const availableLeaks = leaks.filter((leak) => leak.allowlistIdx !== undefined);

            return (
                <div className="space-y-3">
                    <Label className="text-base font-medium">Select Leak Document *</Label>
                    <p className="text-sm text-muted-foreground">
                        Choose which leak document allowlist to add the address to
                    </p>
                    <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                        {availableLeaks.length > 0 ? (
                            availableLeaks.map((leak, index) => (
                                <div
                                    key={index}
                                    className={`p-3 border rounded-lg cursor-pointer transition-all ${formData.allowlistIdx === leak.allowlistIdx?.toString()
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                        }`}
                                    onClick={() => {
                                        const currentValue = formData.allowlistIdx;
                                        const newValue = leak.allowlistIdx?.toString();
                                        // Toggle selection - if already selected, deselect it
                                        handleFieldChange("allowlistIdx", currentValue === newValue ? "" : newValue);
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-4 h-4 rounded-full border-2 mt-1 ${formData.allowlistIdx === leak.allowlistIdx?.toString()
                                            ? "border-primary bg-primary"
                                            : "border-border"
                                            }`} />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-sm">{leak.title}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">{leak.summary}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{leak.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
                                <h4 className="font-medium text-muted-foreground mb-1">No leak documents available</h4>
                                <p className="text-sm text-muted-foreground">
                                    There are no leak documents with allowlists to select from.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (field.name === "bountyIdx") {
            const availableBounties = bounties.filter(bounty => bounty.creator === currentAccount?.address &&
                (bounty.status === "Claimed" || bounty.status === "Open"));
            console.log("Available Bounties:", availableBounties);
            return (
                <div className="space-y-3">
                    <Label className="text-base font-medium">Select Bounty *</Label>
                    <p className="text-sm text-muted-foreground">
                        Choose which bounty to start the voting phase for (only bounties you created)
                    </p>
                    <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                        {availableBounties.length > 0 ? (
                            availableBounties.map((bounty) => (
                                <div
                                    key={bounty.id}
                                    className={`p-3 border rounded-lg cursor-pointer transition-all ${formData.bountyIdx === bounty.id
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                        }`}
                                    onClick={() => {
                                        const currentValue = formData.bountyIdx;
                                        const newValue = bounty.id;
                                        // Toggle selection - if already selected, deselect it
                                        handleFieldChange("bountyIdx", currentValue === newValue ? "" : newValue);
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-4 h-4 rounded-full border-2 mt-1 ${formData.bountyIdx === bounty.id
                                            ? "border-primary bg-primary"
                                            : "border-border"
                                            }`} />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-sm">{bounty.title}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">{bounty.description}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs bg-muted px-2 py-1 rounded">{bounty.reward} SUI</span>
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    {bounty.submissions.length} submissions
                                                </span>
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                    {bounty.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
                                <h4 className="font-medium text-muted-foreground mb-1">No bounties to select from</h4>
                                <p className="text-sm text-muted-foreground">
                                    You haven't created any bounties that are available for voting.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return null;
    };

    const renderField = (field: any) => {
        if (field.type === "custom") {
            return renderCustomField(field);
        }

        const value = formData[field.name] || "";

        switch (field.type) {
            case "textarea":
                return (
                    <div className="space-y-2">
                        <Label htmlFor={field.name}>
                            {field.label} {field.required && "*"}
                        </Label>
                        <Textarea
                            id={field.name}
                            placeholder={field.placeholder}
                            rows={4}
                            value={value}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        />
                    </div>
                );
            case "number":
                return (
                    <div className="space-y-2">
                        <Label htmlFor={field.name}>
                            {field.label} {field.required && "*"}
                        </Label>
                        <Input
                            id={field.name}
                            type="number"
                            placeholder={field.placeholder}
                            value={value}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        />
                    </div>
                );
            case "select":
                return (
                    <div className="space-y-2">
                        <Label htmlFor={field.name}>
                            {field.label} {field.required && "*"}
                        </Label>
                        <select
                            id={field.name}
                            value={value}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        >
                            <option value="">Select...</option>
                            {field.options?.map((option: { value: string; label: string }) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            default:
                return (
                    <div className="space-y-2">
                        <Label htmlFor={field.name}>
                            {field.label} {field.required && "*"}
                        </Label>
                        <Input
                            id={field.name}
                            type="text"
                            placeholder={field.placeholder}
                            value={value}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        />
                    </div>
                );
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={handleClose}>
            <SheetContent side="right" className="w-full sm:max-w-4xl lg:max-w-5xl overflow-y-auto p-0">
                <div className="px-8 py-6">
                    <SheetHeader className="mb-8 pl-2">
                        <SheetTitle className="text-2xl mb-2">Create New Proposal</SheetTitle>
                        <SheetDescription className="text-base">
                            Choose the type of proposal and fill in the required details
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-8 pl-2">
                        {/* Proposal Type Selection */}
                        <div className="space-y-6">
                            <div>
                                <Label className="text-lg font-semibold mb-4 block">Proposal Type *</Label>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Select the type of action you want to propose
                                </p>
                                <div className="grid grid-cols-1 gap-4">
                                    {proposalTypes.map((type) => {
                                        const Icon = type.icon;
                                        return (
                                            <div
                                                key={type.key}
                                                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${selectedType === type.key
                                                    ? type.color + " border-primary"
                                                    : "border-border hover:border-primary/50"
                                                    }`}
                                                onClick={() => setSelectedType(type.key)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-5 h-5 rounded-full border-2 ${selectedType === type.key
                                                        ? "border-primary bg-primary"
                                                        : "border-border"
                                                        }`} />
                                                    <Icon className="h-6 w-6 text-primary" />
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-base">{type.title}</h4>
                                                        <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Form Fields */}
                        {selectedConfig && (
                            <div className="space-y-6 border-t pt-8">
                                <h3 className="text-lg font-semibold mb-6">Proposal Details</h3>
                                {selectedConfig.fields.map((field) => (
                                    <div key={field.name}>
                                        {renderField(field)}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4 border-t pt-8">
                            <Button variant="outline" onClick={handleClose} className="px-6">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!selectedType || isLoading}
                                className="min-w-40 px-6"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Proposal
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
