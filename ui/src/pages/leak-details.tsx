import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar,
  Clock,
  Download,
  FileCheck,
  Share2,
  Tag,
  Verified,
  AlertTriangle,
  Send,
  Loader2,
  Lock,
  Info,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { markdownToHtml } from "@/lib/markdown";
import { useLeaksStore } from "@/lib/leaks-store";
import { useEffect, useState } from "react";
import { serializeProof, serializePublicSignal } from "@/lib/serializer";
import { Transaction } from "@mysten/sui/transactions";
import { DAO_OBJECT_ID, PACKAGE_ID, VK_OBJECT_ID } from "@/lib/constant";
import { useCurrentAccount, useSignAndExecuteTransaction, useSignPersonalMessage, useSuiClient } from "@mysten/dapp-kit";
import { toast } from "sonner";
import type { ProofResponseJSON } from "@/components/leaks/email_info";
import { get } from "@/lib/walrus";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { LeakDetailsSkeleton } from "@/components/ui/leak-details-skeleton";
import type { Leak } from "@/lib/types";
import { getAllowlistedKeyServers, SealClient, SessionKey, type SessionKeyType } from "@mysten/seal";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import localforage from "localforage";
import { toHex } from "@mysten/sui/utils";
import { bcs } from "@mysten/sui/bcs";
import { useRefetchAll } from "@/hooks/useRefetchAll";
export function LeakDetailsPage() {
  const { id } = useParams();
  const { getLeakById, fetchLeaks, leaks } = useLeaksStore();
  const account = useCurrentAccount()
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const { mutate: signPersonalMessage } = useSignPersonalMessage()
  const [leak, setLeak] = useState<Leak | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [downloadingDocs, setDownloadingDocs] = useState<{ [key: string]: boolean }>({});

  const suiClient = useSuiClient();

  const client = new SealClient({
    suiClient,
    serverConfigs: getAllowlistedKeyServers('testnet').map((id) => ({
      objectId: id,
      weight: 1,
    })),
    verifyKeyServers: true,
  });

  // Use centralized refetch hook
  const { leaksData, refetchAll } = useRefetchAll();

  useEffect(() => {
    const fetchLeak = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        if (leaks.length === 0) {
          const leaks = await fetchLeaks(leaksData);
          const foundLeak = leaks?.find((l) => l.id === id);
          if (foundLeak) {
            setLeak(foundLeak);
            return;
          }
        }
        const foundLeak = getLeakById(id);
        if (foundLeak) {
          setLeak(foundLeak);
        }
      } catch (error) {
        console.error("Error fetching leak:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeak();
  }, [leaksData, id, fetchLeaks]);

  const createSession = async (): Promise<SessionKey | undefined> => {
    if (!account) {
      toast("Encrypted document. Please login to decrypt documents", {
        position: "top-right",
      });
      return;
    }
    if (await localforage.getItem("sessionKey")) {
      const sessionKey = await localforage.getItem<SessionKeyType>(`sessionKey${account.address}`);
      if (sessionKey) {
        const currentSessionKey = SessionKey.import(sessionKey, new SuiClient({
          url: getFullnodeUrl('testnet'),
        }))
        if (!currentSessionKey.isExpired) {
          return currentSessionKey;
        }
      }
    }

    const sessionKey = await SessionKey.create({
      address: account.address,
      packageId: PACKAGE_ID,
      ttlMin: 10, // TTL of 10 minutes
      suiClient,
    });
    const message = sessionKey.getPersonalMessage();
    console.log
    const signResult = await new Promise((resolve, reject) => {
      signPersonalMessage(
        { message: message },
        {
          onSuccess: (result) => resolve(result),
          onError: (error) => reject(error)
        }
      );
    });
    console.log("Sign result:", signResult);
    ///@ts-ignore
    sessionKey.setPersonalMessageSignature(signResult.signature); // Initialization complete
    localforage.setItem(`sessionKey${account.address}`, sessionKey.export());
    return sessionKey
  }

  const decryptFiles = async (encryptedBytes: ArrayBuffer): Promise<ArrayBuffer | undefined> => {
    if (leak === null) {
      toast("Leak data is not available. This is an invalid leak", {
        position: "top-right",
      });
      return;
    }
    const sessionKey = await createSession();
    console.log("Decrypting files for leak:", sessionKey);
    if (leak.allowlistIdx === undefined) {
      toast("This should not be called, please report this issue", {
        position: "top-right",
      });
      return;
    }
    if (!sessionKey) {
      toast("Failed to create session key. Please try again later", {
        position: "top-right",
      });
      return;
    }
    const tx = new Transaction();
    const allowlistIndex = Number(leak!.allowlistIdx);
    const indexBytes = new Uint8Array(8);
    new DataView(indexBytes.buffer).setBigUint64(0, BigInt(allowlistIndex), false);
    console.log("Allowlist index bytes:", indexBytes);
    tx.moveCall({
      target: `${PACKAGE_ID}::zl_dao::seal_approve`,
      arguments: [
        tx.pure.vector("u8", indexBytes.reverse()),
        tx.pure.u64(allowlistIndex),
        tx.object(DAO_OBJECT_ID)
      ]
    });
    tx.setGasBudget(100000000000)
    console.log(tx)
    const txBytes = await tx.build({ client: suiClient, onlyTransactionKind: true })
    console.log(txBytes)
    try {
      const decryptedBytes = await client.decrypt({
        data: new Uint8Array(encryptedBytes),
        sessionKey,
        txBytes,
      });
      console.log("Decrypted bytes:", decryptedBytes);
      return decryptedBytes
    } catch (error) {
      ///@ts-ignore
      const errorMessage = error.toString();
      if (errorMessage.includes("User does not have access to one or more of the requested keys")) {
        toast("You are trying to download an encrypted file but you are not allowed. If this document is required please go to the dao and make a proposal", {
          position: "top-right",
        });
        return;
      }
      toast("Failed to decrypt files. Please ensure you are in the allowlist" + error, {
        position: "top-right",
      });
    }
  }

  const downloadProof = () => {
    const proof = leak?.proof;
    if (proof) {
      const blob = new Blob([JSON.stringify(proof)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${leak.title}-proof.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }


  const verifyOnChain = async ({ proof, publicSignals }: ProofResponseJSON) => {
    if (!account) {
      toast("Please login to verify on chain", {
        position: "top-right",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const proofUint8Array = serializeProof(proof);
      const publicSignalsUint8Array = serializePublicSignal(publicSignals);

      const transaction = new Transaction();

      transaction.moveCall({
        arguments: [
          transaction.object(VK_OBJECT_ID),
          transaction.pure.vector("u8", proofUint8Array),
          transaction.pure.vector("u8", publicSignalsUint8Array),
        ],
        target: `${PACKAGE_ID}::verifier::verify_zeroleaks_proof`,
      });

      const { digest } = await signAndExecuteTransaction({
        transaction,
      });
      const redirectUrl = "https://suiscan.xyz/testnet/tx/" + digest;

      toast("Trasaction Sent Succesffuly", {
        position: "top-right",
        action: (
          <Button
            variant={"outline"}
            onClick={() => {
              window.open(redirectUrl, "_blank");
            }}
            className="bg-white"
          >
            <Send className="stroke-black" />{" "}
          </Button>
        ),
      });

      // Refetch all data after successful verification
      await refetchAll();
    } catch (error) {
      console.error("Error verifying on chain:", error);
      toast("Failed to verify on chain", { position: "top-right" });
    } finally {
      setIsVerifying(false);
    }
  };
  const verifyOnSui = () => {
    if (!leak?.proof) {
      return
    }
    verifyOnChain(leak?.proof)
  }

  if (isLoading) {
    return <LeakDetailsSkeleton />;
  }

  if (!leak) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Leak not found</h1>
          <p className="text-muted-foreground mb-6">
            The leak you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/leaks"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Back to Leaks
          </Link>
        </div>
      </div>
    );
  }

  const donwloadFiles = async (doc: any) => {
    try {
      const downloadArrayBuffer = (buffer: ArrayBuffer, filename: string) => {
        const blob = new Blob([buffer]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };
      const buffer = await get(doc.content)
      if (doc.encrypted) {
        const decryptedBuffer = await decryptFiles(buffer);
        if (!decryptedBuffer) {
          return;
        }
        downloadArrayBuffer(decryptedBuffer, doc.name);
        return;
      }
      downloadArrayBuffer(buffer, doc.name)
    } catch (error) {
      throw error
    }

  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main content */}
          <div className="w-full md:w-2/3">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Link
                  to="/leaks"
                  className="hover:text-primary/80 transition-colors"
                >
                  Leaks
                </Link>
                <span>/</span>
                <span>{leak.category}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {leak.title}
              </h1>
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge className="bg-primary hover:bg-primary/90">
                  {leak.category}
                </Badge>
                {leak.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-border/70 text-muted-foreground"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <time dateTime={leak.date}>
                    {formatDateTime(new Date(leak.date).getTime())}
                  </time>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{leak.date}</span>
                </div>
              </div>
              <div className="prose dark:prose-invert">
                <div
                  dangerouslySetInnerHTML={{
                    __html: markdownToHtml(leak.content),
                  }}
                />
              </div>
              1
              <Separator className="my-8 border-border" />
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Related Documents</h2>
                <div className="space-y-3">
                  {leak.relatedDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-card rounded-lg p-3 border border-border/70"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{doc.name}</span>
                        {doc.encrypted && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Badge
                                variant="secondary"
                                className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 cursor-pointer"
                              >
                                Encrypted
                              </Badge>
                            </PopoverTrigger>
                            <PopoverContent className="max-w-xs text-sm">
                              This document is encrypted. Only users who are allowlisted can decrypt and access its contents. If you want access to this document visit the dao page and crete a proposal
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border/70 hover:bg-muted"
                        disabled={downloadingDocs[doc.content]}
                        onClick={async () => await donwloadFiles(doc)}
                      >
                        {downloadingDocs[doc.content] ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        {downloadingDocs[doc.content] ? "Downloading..." : "Download"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 justify-between items-center">
                <Button
                  variant="outline"
                  className="border-border/70 hover:bg-muted"
                  asChild
                >
                  <Link to="/leaks">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 mr-2"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back to Leaks
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-border/70 hover:bg-muted"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-1/3 space-y-6">
            {/* Blockchain Verification */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Verified className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  OnChain Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This leak is cryptographically verified and immutably recorded on the Sui blockchain.
                </p>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Transaction Hash</h4>
                  <a
                    href={`https://suiscan.xyz/testnet/tx/${leak.verificationDigest}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                        {leak.verificationDigest.slice(0, 8)}...{leak.verificationDigest.slice(-6)}
                      </span>
                      <svg className="h-3 w-3 text-blue-500 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Source Information */}
            <Card className="bg-card border-border/70">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Source Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <h4 className="text-sm font-medium">Email Source</h4>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
                    <code className="text-xs break-all text-muted-foreground">
                      {leak.fromLeakedEmail}
                    </code>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h4 className="text-sm font-medium">Verified Claim</h4>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                    <code className="text-xs break-all text-blue-700 dark:text-blue-300">
                      {leak.verifiedClaim}
                    </code>
                  </div>
                </div>

                <Separator className="my-4 bg-border/70" />

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Actions</h4>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full justify-start" size="sm" onClick={downloadProof}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Proof
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      size="sm"
                      onClick={verifyOnSui}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileCheck className="h-4 w-4 mr-2" />
                      )}
                      {isVerifying ? "Verifying..." : "Verify on"} <span className="bg-gradient-to-r from-blue-900 via-blue-500 to-blue-200 bg-clip-text text-transparent font-semibold ml-1">SUI</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <CommentsSection leak={leak} />
        </div>
      </main >
    </div >
  );
}