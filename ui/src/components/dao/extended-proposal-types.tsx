import { Settings, AlertTriangle, Users } from "lucide-react";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, DAO_OBJECT_ID } from "@/lib/constant";
import type { ProposalTypeConfig } from "./create-proposal-sheet";

// Example of how to extend proposal types
export const extendedProposalTypes: ProposalTypeConfig[] = [
    {
        key: "GovernanceParameterChange",
        title: "Change Governance Parameters",
        description: "Propose changes to DAO governance settings like voting thresholds or periods",
        icon: Settings,
        color: "border-purple-500 bg-purple-50 dark:bg-purple-950/20",
        fields: [
            { name: "title", label: "Proposal Title", type: "text", required: true, placeholder: "e.g., Increase voting threshold to 2500 tokens" },
            { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Explain the reasons for this governance change..." },
            {
                name: "parameterType",
                label: "Parameter to Change",
                type: "select",
                required: true,
                options: [
                    { value: "voting_threshold", label: "Voting Threshold" },
                    { value: "voting_period", label: "Voting Period" },
                    { value: "proposal_threshold", label: "Proposal Creation Threshold" },
                    { value: "quorum", label: "Quorum Requirement" }
                ]
            },
            { name: "newValue", label: "New Value", type: "number", required: true, placeholder: "Enter the new parameter value" },
            { name: "justification", label: "Justification", type: "textarea", required: true, placeholder: "Provide detailed justification for this change..." }
        ],
        validation: (data) => {
            if (!data.title || !data.description || !data.parameterType || !data.newValue || !data.justification) {
                return "All required fields must be filled";
            }
            if (isNaN(Number(data.newValue)) || Number(data.newValue) <= 0) {
                return "New value must be a positive number";
            }
            return null;
        },
        onSubmit: async (data, { signAndExecuteTransaction, onSuccess, onError }) => {
            try {
                // This would call a hypothetical governance parameter change function
                const tx = new Transaction();
                tx.moveCall({
                    target: `${PACKAGE_ID}::zl_dao::create_governance_proposal`,
                    arguments: [
                        tx.pure.string(data.title),
                        tx.pure.string(data.description),
                        tx.pure.string(data.parameterType),
                        tx.pure.u64(Number(data.newValue)),
                        tx.pure.string(data.justification),
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
        key: "TreasuryProposal",
        title: "Treasury Action",
        description: "Propose spending from DAO treasury or treasury management actions",
        icon: AlertTriangle,
        color: "border-orange-500 bg-orange-50 dark:bg-orange-950/20",
        fields: [
            { name: "title", label: "Proposal Title", type: "text", required: true, placeholder: "e.g., Fund security audit for platform" },
            { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Describe the treasury action in detail..." },
            {
                name: "actionType",
                label: "Action Type",
                type: "select",
                required: true,
                options: [
                    { value: "spend", label: "Spend Funds" },
                    { value: "invest", label: "Investment" },
                    { value: "grant", label: "Grant Funding" },
                    { value: "buyback", label: "Token Buyback" }
                ]
            },
            { name: "amount", label: "Amount (SUI)", type: "number", required: true, placeholder: "Amount in SUI tokens" },
            { name: "recipient", label: "Recipient Address", type: "text", required: true, placeholder: "0x..." },
            { name: "milestone", label: "Milestones/Conditions", type: "textarea", required: false, placeholder: "Describe any milestones or conditions for fund release..." }
        ],
        validation: (data) => {
            if (!data.title || !data.description || !data.actionType || !data.amount || !data.recipient) {
                return "All required fields must be filled";
            }
            if (isNaN(Number(data.amount)) || Number(data.amount) <= 0) {
                return "Amount must be a positive number";
            }
            if (!data.recipient.startsWith("0x") || data.recipient.length < 10) {
                return "Please enter a valid recipient address";
            }
            return null;
        },
        onSubmit: async (data, { signAndExecuteTransaction, onSuccess, onError }) => {
            try {
                // This would call a hypothetical treasury management function
                const tx = new Transaction();
                tx.moveCall({
                    target: `${PACKAGE_ID}::zl_dao::create_treasury_proposal`,
                    arguments: [
                        tx.pure.string(data.title),
                        tx.pure.string(data.description),
                        tx.pure.string(data.actionType),
                        tx.pure.u64(Number(data.amount) * 1000000000), // Convert to mist
                        tx.pure.address(data.recipient),
                        tx.pure.string(data.milestone || ""),
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
        key: "MembershipProposal",
        title: "Membership Management",
        description: "Propose adding or removing DAO members or changing membership tiers",
        icon: Users,
        color: "border-teal-500 bg-teal-50 dark:bg-teal-950/20",
        fields: [
            { name: "title", label: "Proposal Title", type: "text", required: true, placeholder: "e.g., Add core contributor membership" },
            { name: "description", label: "Description", type: "textarea", required: true, placeholder: "Describe the membership change..." },
            {
                name: "actionType",
                label: "Action Type",
                type: "select",
                required: true,
                options: [
                    { value: "add_member", label: "Add Member" },
                    { value: "remove_member", label: "Remove Member" },
                    { value: "change_tier", label: "Change Member Tier" },
                    { value: "create_tier", label: "Create New Tier" }
                ]
            },
            { name: "memberAddress", label: "Member Address", type: "text", required: true, placeholder: "0x..." },
            {
                name: "memberTier",
                label: "Member Tier",
                type: "select",
                required: true,
                options: [
                    { value: "contributor", label: "Contributor" },
                    { value: "core", label: "Core Member" },
                    { value: "admin", label: "Admin" },
                    { value: "founder", label: "Founder" }
                ]
            },
            { name: "justification", label: "Justification", type: "textarea", required: true, placeholder: "Explain why this membership change is needed..." }
        ],
        validation: (data) => {
            if (!data.title || !data.description || !data.actionType || !data.memberAddress || !data.memberTier || !data.justification) {
                return "All required fields must be filled";
            }
            if (!data.memberAddress.startsWith("0x") || data.memberAddress.length < 10) {
                return "Please enter a valid member address";
            }
            return null;
        },
        onSubmit: async (data, { signAndExecuteTransaction, onSuccess, onError }) => {
            try {
                // This would call a hypothetical membership management function
                const tx = new Transaction();
                tx.moveCall({
                    target: `${PACKAGE_ID}::zl_dao::create_membership_proposal`,
                    arguments: [
                        tx.pure.string(data.title),
                        tx.pure.string(data.description),
                        tx.pure.string(data.actionType),
                        tx.pure.address(data.memberAddress),
                        tx.pure.string(data.memberTier),
                        tx.pure.string(data.justification),
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
    }
];

// Example of how to use extended proposal types:
// In your DAO page component, you can pass these extended types:
// <CreateProposalSheet 
//   isOpen={isCreateDialogOpen}
//   onClose={() => setIsCreateDialogOpen(false)}
//   proposalTypes={[...defaultProposalTypes, ...extendedProposalTypes]}
//   refetchDao={refetchDao}
// />
