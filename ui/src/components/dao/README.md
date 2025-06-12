# DAO Proposal System

This document explains how to use and extend the DAO proposal system with the new `CreateProposalSheet` component.

## Overview

The proposal system has been redesigned to be:

- **Extensible**: Easy to add new proposal types
- **Type-safe**: Full TypeScript support
- **User-friendly**: Modern drawer/sheet interface
- **Modular**: Clean separation of concerns

## Basic Usage

```tsx
import { CreateProposalSheet } from "@/components/dao";

<CreateProposalSheet 
  isOpen={isCreateDialogOpen}
  onClose={() => setIsCreateDialogOpen(false)}
  refetchDao={refetchDao} // Optional: refetch DAO data after proposal creation
/>
```

## Default Proposal Types

The system comes with two default proposal types:

1. **Add to Allowlist** - Grant access to leak documents
2. **Start Bounty Tally** - Begin voting phase for bounties

## Adding Custom Proposal Types

To add new proposal types, create a `ProposalTypeConfig` array:

```tsx
import { CreateProposalSheet, type ProposalTypeConfig } from "@/components/dao";
import { extendedProposalTypes } from "@/components/dao/extended-proposal-types";

const customProposalTypes: ProposalTypeConfig[] = [
  {
    key: "MyCustomProposal",
    title: "Custom Action",
    description: "Describe what this proposal type does",
    icon: MyIcon, // Lucide React icon
    color: "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
    fields: [
      {
        name: "title",
        label: "Proposal Title",
        type: "text",
        required: true,
        placeholder: "Enter title..."
      },
      {
        name: "amount",
        label: "Amount",
        type: "number",
        required: true
      },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: [
          { value: "urgent", label: "Urgent" },
          { value: "normal", label: "Normal" }
        ]
      },
      {
        name: "customField",
        label: "Custom Selection",
        type: "custom" // For complex UI components
      }
    ],
    validation: (data) => {
      if (!data.title || !data.amount) {
        return "Required fields missing";
      }
      return null; // No validation errors
    },
    onSubmit: async (data, { signAndExecuteTransaction, onSuccess, onError }) => {
      try {
        const tx = new Transaction();
        // Add your Move calls here
        tx.moveCall({
          target: `${PACKAGE_ID}::my_module::my_function`,
          arguments: [/* your arguments */],
        });
        
        const { digest } = await signAndExecuteTransaction({ transaction: tx });
        onSuccess(digest);
      } catch (error) {
        onError(error);
      }
    }
  }
];

// Use with custom types
<CreateProposalSheet 
  isOpen={isCreateDialogOpen}
  onClose={() => setIsCreateDialogOpen(false)}
  proposalTypes={customProposalTypes} // Use only custom types
  // OR combine with defaults:
  // proposalTypes={[...defaultProposalTypes, ...customProposalTypes]}
  refetchDao={refetchDao}
/>
```

## Field Types

The system supports various field types:

- `text` - Standard text input
- `textarea` - Multi-line text input  
- `number` - Numeric input
- `select` - Dropdown with predefined options
- `custom` - Custom components (implement in `renderCustomField`)

## Custom Field Components

For complex UI needs, use the `custom` field type and implement the logic in `renderCustomField`:

```tsx
// In the CreateProposalSheet component, extend renderCustomField:
if (field.name === "myCustomField") {
  return (
    <div className="space-y-3">
      <Label>My Custom Component</Label>
      {/* Your custom UI here */}
      <MyCustomComponent 
        value={formData.myCustomField}
        onChange={(value) => handleFieldChange("myCustomField", value)}
      />
    </div>
  );
}
```

## Example Extensions

See `extended-proposal-types.tsx` for examples of:

- **Governance Parameter Changes**
- **Treasury Management**
- **Membership Management**

## Integration with DAO Page

The component automatically:

- Handles form validation
- Manages loading states
- Shows success/error toasts
- Calls refetch functions
- Resets form on completion

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls sheet visibility |
| `onClose` | function | Yes | Called when sheet should close |
| `proposalTypes` | ProposalTypeConfig[] | No | Custom proposal types (defaults provided) |
| `refetchDao` | function | No | Called after successful proposal creation |

## Best Practices

1. **Validation**: Always provide validation functions for data integrity
2. **Error Handling**: Use the provided onError callback for consistent error display
3. **Gas Budgets**: Set appropriate gas budgets for your transactions
4. **User Feedback**: Use meaningful success messages with transaction links
5. **Type Safety**: Leverage TypeScript for field definitions and validation

## Migration from Old Dialog

The new system replaces the old `CreateProposalDialog`. Key changes:

- No need for `onCreateProposal` callback - handled internally
- Proposal types are configurable
- Better UI with drawer/sheet design
- Direct transaction handling
- Extensible architecture

The old dialog is still available but deprecated in favor of the new sheet system.
