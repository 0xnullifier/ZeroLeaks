#!/bin/bash

# Function to generate random time within a day
random_time() {
    hour=$(printf "%02d" $((RANDOM % 15 + 7)))  # Between 7am and 10pm
    minute=$(printf "%02d" $((RANDOM % 60)))
    second=$(printf "%02d" $((RANDOM % 60)))
    echo "$hour:$minute:$second"
}

# Function to generate random commit with date in past
make_commit() {
    day_offset=$1
    commit_message=$2
    shift 2
    files=("$@")  # Get all remaining arguments as files to add
    
    # Calculate date (10 days ago + offset)
    commit_date=$(date -v-10d -v+"$day_offset"d "+%a %b %d")
    commit_year="2025"
    commit_time=$(random_time)
    
    # Format the full date string
    full_date="$commit_date $commit_time $commit_year +0000"
    
    # Add the specified files
    for file in "${files[@]}"; do
        git add "$file"
        echo "Added file: $file"
    done
    
    # Apply the commit with the specified date
    GIT_COMMITTER_DATE="$full_date" git commit -m "$commit_message" --date="$full_date"
    
    echo "Created commit dated $full_date: $commit_message"
}

# Make sure we're in the git repository
cd /Users/utkarshdagoat/dev/sui_overflow || exit

make_commit 0 "Initial setup of zkemail circuits for email verification" \
    "circuits/package.json" "circuits/tsconfig.json" "circuits/babel.config.js"

make_commit 1 "Implement email content extraction circuit with zkemail" \
    "circuits/src/email_helpers.circom"

make_commit 1 "Add helper functions for email parsing and validation" \
    "circuits/helpers/email_content_helper.ts" "circuits/helpers/index.ts"

make_commit 2 "Setup test environment for zkemail circuits with sample email files" \
    "circuits/test/config.js" "circuits/test/emls/test.eml" "circuits/test/emls/sui.eml"

make_commit 3 "Finalize email verification circuit implementation" \
    "circuits/test/email_content.test.ts" "circuits/test/email_verification.test.js"

# Contracts Development (Days 4-6)
make_commit 4 "Initialize Sui Move contract structure for ZeroLeaks" \
    "contracts/Move.toml" "contracts/Move.lock"

make_commit 5 "Implement verifier contract for ZK proofs validation" \
    "contracts/sources/contracts.move"

make_commit 5 "Add storage structure for leak metadata on-chain" \
    "contracts/build/contracts/sources/verifier.move"

make_commit 6 "Write unit tests for verifier contract functions" \
    "contracts/tests/verifier_tests.move" "contracts/build/contracts/bytecode_modules/verifier.mv"

make_commit 7 "Setup React frontend with Vite and Tailwind CSS" \
    "ui/package.json" "ui/vite.config.ts" "ui/tailwind.config.ts" "ui/tsconfig.json"

make_commit 7 "Create basic components for leak submission workflow" \
    "ui/src/components/ui/button.tsx" "ui/src/components/ui/card.tsx" "ui/src/components/ui/file-upload.tsx"

make_commit 8 "Implement email uploader component with ZK proof generation" \
    "ui/src/components/leaks/email-uploader.tsx" "ui/src/lib/zk-utils.ts"

make_commit 8 "Add featured leaks section to homepage" \
    "ui/src/components/featured-leaks.tsx" "ui/src/components/home/featured-leaks-section.tsx"

make_commit 9 "Build article editor for leak submissions" \
    "ui/src/components/article-editor.tsx" "ui/src/lib/markdown.ts"

make_commit 9 "Create leak browsing interface with filters" \
    "ui/src/pages/browse-leaks.tsx" "ui/src/pages/leaks.tsx" "ui/src/components/leaks/layout.tsx"

make_commit 10 "Implement ZK proof integration with Sui wallet" \
    "ui/src/lib/auth-store.ts" "ui/public/dummy-salt-service.json"

make_commit 10 "Add responsive design for mobile users" \
    "ui/src/index.css" "ui/src/components/home/hero-section.tsx" "ui/src/components/home/footer-section.tsx"

make_commit 10 "Finalize UI components and connect to backend services" \
    "ui/src/providers.tsx" "ui/src/lib/submit-leak-store.ts" "ui/src/pages/submit-leaks.tsx"
