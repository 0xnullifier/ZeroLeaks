import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, AlertCircle } from "lucide-react";
import type { UIProposal } from "@/lib/proposal-store";

interface CreateProposalDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateProposal: (proposal: Omit<UIProposal, "id" | "votesFor" | "votesAgainst" | "totalVotes" | "createdAt" | "forVotes" | "againstVotes">) => void;
}

export function CreateProposalDialog({ isOpen, onClose, onCreateProposal }: CreateProposalDialogProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<string>("");
    const [votingDuration, setVotingDuration] = useState("7");
    const [isLoading, setIsLoading] = useState(false);

    // Official info for access grant proposals
    const [officialName, setOfficialName] = useState("");
    const [department, setDepartment] = useState("");
    const [position, setPosition] = useState("");
    const [clearanceLevel, setClearanceLevel] = useState("");
    const [requestedDocuments, setRequestedDocuments] = useState<string[]>([""]);

    const handleAddDocument = () => {
        setRequestedDocuments([...requestedDocuments, ""]);
    };

    const handleRemoveDocument = (index: number) => {
        setRequestedDocuments(requestedDocuments.filter((_, i) => i !== index));
    };

    const handleDocumentChange = (index: number, value: string) => {
        const updated = [...requestedDocuments];
        updated[index] = value;
        setRequestedDocuments(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const endTime = Date.now() + parseInt(votingDuration) * 24 * 60 * 60 * 1000;

            const proposalData: Omit<UIProposal, "id" | "votesFor" | "votesAgainst" | "totalVotes" | "createdAt" | "forVotes" | "againstVotes"> = {
                title,
                description,
                action: category === "access_grant" ? "AddAddressToAllowlist" : "AddAddressToAllowlist", // Default to AddAddressToAllowlist for now
                status: "InProgress",
                deadline: endTime,
                endTime,
                category,
                proposer: "0x1234...current_user", // This would be the actual connected wallet address
                allowlistIdx: category === "access_grant" ? 0 : undefined,
                targetAddress: category === "access_grant" ? "0x0000...target" : undefined,
                proposalInfo: category === "access_grant" ? {
                    name: officialName,
                    agency: department,
                    position: position,
                } : undefined,
                ...(category === "access_grant" && {
                    officialInfo: {
                        name: officialName,
                        department,
                        position,
                        requestedDocuments: requestedDocuments.filter(doc => doc.trim() !== "")
                    }
                })
            };

            onCreateProposal(proposalData);
            handleReset();
            onClose();
        } catch (error) {
            console.error("Error creating proposal:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setTitle("");
        setDescription("");
        setCategory("");
        setVotingDuration("7");
        setOfficialName("");
        setDepartment("");
        setPosition("");
        setClearanceLevel("");
        setRequestedDocuments([""]);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const isFormValid = title && description && category && votingDuration &&
        (category !== "access_grant" || (officialName && department && position));

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto ultra-slim-scrollbar">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Create New Proposal</DialogTitle>
                    <DialogDescription>
                        Submit a proposal for the DAO community to vote on. All proposals require a minimum threshold of votes to pass.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="title">Proposal Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="Enter a clear, descriptive title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Provide detailed information about your proposal, including justification and expected outcomes"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="category">Category *</Label>
                                <Select value={category} onValueChange={setCategory} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select proposal category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="access_grant">Document Access Grant</SelectItem>
                                        <SelectItem value="governance">DAO Governance</SelectItem>
                                        <SelectItem value="treasury">Treasury Management</SelectItem>
                                        <SelectItem value="protocol">Protocol Upgrade</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Official Information - Only for access grant proposals */}
                    {category === "access_grant" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-amber-500" />
                                    Official Information
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Required for document access grant requests
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="officialName">Official Name *</Label>
                                        <Input
                                            id="officialName"
                                            placeholder="Full name of requesting official"
                                            value={officialName}
                                            onChange={(e) => setOfficialName(e.target.value)}
                                            required={category === "access_grant"}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="department">Department/Agency *</Label>
                                        <Input
                                            id="department"
                                            placeholder="e.g., Department of Justice"
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            required={category === "access_grant"}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="position">Position/Title *</Label>
                                        <Input
                                            id="position"
                                            placeholder="e.g., Senior Analyst"
                                            value={position}
                                            onChange={(e) => setPosition(e.target.value)}
                                            required={category === "access_grant"}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="clearanceLevel">Security Clearance *</Label>
                                        <Select value={clearanceLevel} onValueChange={setClearanceLevel} required={category === "access_grant"}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select clearance level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Confidential">Confidential</SelectItem>
                                                <SelectItem value="Secret">Secret</SelectItem>
                                                <SelectItem value="Top Secret">Top Secret</SelectItem>
                                                <SelectItem value="Top Secret/SCI">Top Secret/SCI</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label className="flex items-center justify-between">
                                        <span>Requested Documents</span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddDocument}
                                            className="h-8"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add
                                        </Button>
                                    </Label>
                                    <div className="space-y-2 mt-2">
                                        {requestedDocuments.map((doc, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Input
                                                    placeholder={`Document ${index + 1}`}
                                                    value={doc}
                                                    onChange={(e) => handleDocumentChange(index, e.target.value)}
                                                />
                                                {requestedDocuments.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRemoveDocument(index)}
                                                        className="px-3"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Voting Parameters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Voting Parameters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="votingDuration">Voting Duration (days) *</Label>
                                    <Select value={votingDuration} onValueChange={setVotingDuration} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select duration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="3">3 days</SelectItem>
                                            <SelectItem value="7">7 days</SelectItem>
                                            <SelectItem value="14">14 days</SelectItem>
                                            <SelectItem value="30">30 days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                            </div>

                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                                            Important Notice
                                        </p>
                                        <p className="text-amber-700 dark:text-amber-300">
                                            Once submitted, proposals cannot be edited or deleted. Please review all information carefully before creating your proposal.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isFormValid || isLoading}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isLoading ? "Creating..." : "Create Proposal"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
