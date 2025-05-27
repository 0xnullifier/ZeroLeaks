import type React from "react"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Upload, FileText, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Proof } from "@/lib/serializer"
import { toast } from "sonner"
export interface ProofResponseJSON {
    proof: Proof;
    publicSignals: string[];
}

export interface ProgressStage {
    label: string
    completed: boolean
}

export interface GenerateProofsInBrowserArgs {
    file: File
    emailContent: string
    setProgressStages: React.Dispatch<React.SetStateAction<ProgressStage[]>>
    setCurrentStage: React.Dispatch<React.SetStateAction<number>>
}


interface ProofVerificationProps {
    onFileSelect?: (file: File) => void
    onEmailContentChange?: (content: string) => void
    generateProofsInBrowser: (args: GenerateProofsInBrowserArgs) => Promise<void>
    proofGenerateYourself: (proofFile: File, setIsProofValid: React.Dispatch<React.SetStateAction<boolean>>) => Promise<ProofResponseJSON | null>,
    verifyOnChain: (proof: ProofResponseJSON) => Promise<void>
    generationSteps?: string[]
    codeBlocks?: { title: string; code: string; language: string }[]
}
export default function ProofVerificationComponent({
    onFileSelect,
    onEmailContentChange,
    generateProofsInBrowser,
    proofGenerateYourself,
    verifyOnChain,
    generationSteps = ["Preparing circuit inputs", "Generating proof", "verifying onchain"],
    codeBlocks = [
        {
            title: "Get the source code from the repository.",
            code: `
run the following command:\n\cd circuits/dizkus-scripts && ./gen_proof_e2e.sh\n`,
            language: "bash",
        },

    ],
}: ProofVerificationProps) {
    const [section1Expanded, setSection1Expanded] = useState(false)
    const [section2Expanded, setSection2Expanded] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [emailContent, setEmailContent] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [progressStages, setProgressStages] = useState<ProgressStage[]>(
        generationSteps.map((step) => ({ label: step, completed: false })),
    )
    const [currentStage, setCurrentStage] = useState(0)
    const [proofFile, setProofFile] = useState<File | null>(null)
    const [isProofValid, setIsProofValid] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const proofInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            onFileSelect?.(file)
        }
    }

    const handleEmailContentChange = (value: string) => {
        if (value.length <= 250) {
            setEmailContent(value)
            onEmailContentChange?.(value)
        }
    }

    const handleGenerateProofs = async () => {
        if (!selectedFile || !emailContent.trim()) return

        setIsGenerating(true)

        setProgressStages((prev) => prev.map((stage) => ({ ...stage, completed: false })))
        setCurrentStage(0)

        try {

            await generateProofsInBrowser({ file: selectedFile, emailContent, setProgressStages, setCurrentStage })
        } catch (error) {
            console.error("Error generating proofs:", error)
        } finally {
            setIsGenerating(false)
        }
    }



    const [proofResponse, setProofResponse] = useState<ProofResponseJSON | null>(null)
    const handleProofUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file && file.name.endsWith(".json")) {
            setProofFile(file)

            try {
                const proofResp = (await proofGenerateYourself?.(file, setIsProofValid))
                setProofResponse(proofResp)
            } catch (error) {
                console.error("Error validating proof:", error)
                setIsProofValid(false)
            }
        }
    }


    const handleVerifyOnChain = async () => {
        setIsVerifying(true)
        if (!proofResponse) {
            toast("Something went wrong, please try again later")
            setIsVerifying(false)
            return
        }
        try {
            await verifyOnChain(proofResponse)
        } catch (error) {
            console.error("Error verifying on chain:", error)
        } finally {
            setIsVerifying(false)
        }
    }

    const sectionVariants = {
        expanded: { height: "auto", opacity: 1 },
        collapsed: { height: 0, opacity: 0 },
    }

    const progressPercentage = (progressStages.filter((stage) => stage.completed).length / progressStages.length) * 100

    return (
        <div className="w-full max-w-4xl mx-auto space-y-4">
            {/* Section 1: File Selection and Email Content */}
            <Card>
                <CardHeader className="cursor-pointer" onClick={() => { setSection1Expanded(!section1Expanded), setSection2Expanded(false) }}>
                    <CardTitle className="text-lg flex items-center justify-between">
                        <span>Generate Proof in Browser</span>
                        {section1Expanded ? <ChevronUp /> : <ChevronDown />}
                    </CardTitle>
                </CardHeader>
                <AnimatePresence>
                    {section1Expanded && (
                        <motion.div
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            variants={sectionVariants}
                            transition={{ duration: 0.3 }}
                        >
                            <CardContent className="space-y-6">
                                {/* File Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="file-upload" className="text-muted-foreground">Upload the .eml file</Label>
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-2"
                                        >
                                            <Upload className="w-4 h-4" />
                                            Choose File
                                        </Button>
                                        {selectedFile && (
                                            <Badge variant="secondary" className="flex items-center gap-2">
                                                <FileText className="w-3 h-3" />
                                                {selectedFile.name}
                                            </Badge>
                                        )}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept=".eml,.msg,.txt"
                                    />
                                </div>

                                {/* Email Content Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="email-content" className="text-muted-foreground">Content to Verify</Label>
                                    <Textarea
                                        id="email-content"
                                        placeholder="Enter the content of the email you want to verify..."
                                        value={emailContent}
                                        onChange={(e) => handleEmailContentChange(e.target.value)}
                                        className="min-h-[120px] resize-none"
                                    />
                                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                                        <span>Character limit: 250</span>
                                        <span className={emailContent.length > 240 ? "text-orange-500" : ""}>
                                            {emailContent.length}/250
                                        </span>
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <Button
                                    onClick={handleGenerateProofs}
                                    disabled={!selectedFile || !emailContent.trim() || isGenerating}
                                    className="w-full"
                                    size="lg"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        "Generate Proofs and Verify on Chain"
                                    )}
                                </Button>

                                {/* Progress Indicator */}
                                <AnimatePresence>
                                    {isGenerating && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="space-y-4"
                                        >
                                            <Progress value={progressPercentage} className="w-full" />
                                            <div className="space-y-2">
                                                {progressStages.map((stage, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        {stage.completed ? (
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                        ) : index === currentStage ? (
                                                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                                        ) : (
                                                            <div className="w-4 h-4 rounded-full border-2 border-muted" />
                                                        )}
                                                        <span
                                                            className={`text-sm ${stage.completed ? "text-green-600" : index === currentStage ? "text-blue-600" : "text-muted-foreground"}`}
                                                        >
                                                            {stage.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>

            {/* Section 2: Proof Generation and Verification */}
            <Card>
                <CardHeader className="cursor-pointer" onClick={() => { setSection2Expanded(!section2Expanded); setSection1Expanded(false) }}>
                    <CardTitle className="text-lg flex items-center justify-between">
                        <span>Generate Proof Yourself</span>
                        {section2Expanded ? <ChevronUp /> : <ChevronDown />}
                    </CardTitle>
                </CardHeader>
                <AnimatePresence>
                    {section2Expanded && (
                        <motion.div
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            variants={sectionVariants}
                            transition={{ duration: 0.3 }}
                        >
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    {codeBlocks.map((block, index) => (
                                        <div key={index} className="space-y-2">
                                            <Label className="text-sm font-medium">{block.title}</Label>
                                            <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                                                <pre className="text-sm">
                                                    <code>{block.code}</code>
                                                </pre>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Proof Upload */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => proofInputRef.current?.click()}
                                            disabled={isVerifying}
                                            className="flex items-center gap-2"
                                        >
                                            <Upload className="w-4 h-4" />
                                            {proofFile ? "Change Proof File" : "Upload Proof.json"}
                                        </Button>
                                        {proofFile && (
                                            <Badge variant={isProofValid ? "default" : "destructive"} className="flex items-center gap-2">
                                                <FileText className="w-3 h-3" />
                                                {proofFile.name}
                                                {isProofValid && <CheckCircle className="w-3 h-3" />}
                                            </Badge>
                                        )}
                                    </div>
                                    <input
                                        ref={proofInputRef}
                                        type="file"
                                        onChange={handleProofUpload}
                                        className="hidden"
                                        accept=".json"
                                    />

                                    {proofFile && !isProofValid && (
                                        <Alert variant="destructive">
                                            <AlertDescription>
                                                Invalid proof file. Please ensure the JSON structure is correct.
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {proofFile && isProofValid && (
                                        <Button onClick={handleVerifyOnChain} disabled={isVerifying} className="w-full" size="lg">
                                            {isVerifying ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                "Verify on Chain"
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </div>
    )
}
