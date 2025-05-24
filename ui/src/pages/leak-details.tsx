import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  Download,
  FileCheck,
  Lock,
  Share2,
  Tag,
  Verified,
  AlertTriangle,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { markdownToHtml } from "@/lib/markdown";
import { LEAKS } from "@/lib/data/leaks";

export function LeakDetailsPage() {
  const { id } = useParams();
  const leak = LEAKS.find((leak) => leak.id === id);

  if (!leak) {
    return <div>Leak not found</div>;
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
                    {new Date(leak.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{leak.date}</span>
                </div>
              </div>
              <div className="bg-primary/20 border border-primary/30 rounded-lg p-4 mb-8 flex items-start gap-3">
                <div className="bg-primary/40 rounded-full p-2 mt-1">
                  <Verified className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-primary/90 mb-1">
                    Verified with Zero-Knowledge Proof
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    This leak has been cryptographically verified using
                    zero-knowledge proofs. The authenticity of the content has
                    been confirmed without revealing the identity of the source.
                  </p>
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
                  {leak.relatedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between bg-card rounded-lg p-3 border border-border/70"
                    >
                      <span className="text-muted-foreground">{doc.name}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border/70 hover:bg-muted"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
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
            <Card className="bg-card border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  Zero-Knowledge Proof
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  This leak includes a cryptographic proof that verifies the
                  authenticity of the documents without revealing the identity
                  of the source.
                </p>
                <div className="bg-background rounded-lg p-3 border border-border/70 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Proof File
                    </span>
                    <Badge className="bg-primary">Verified</Badge>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground break-all">
                    zk-proof-{leak.id}-{leak.date.replace(/-/g, "")}.zkp
                  </div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Lock className="h-4 w-4 mr-1 text-primary" />
                  <span>Cryptographically sealed on {leak.date}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <Download className="h-4 w-4 mr-2" />
                  Download Proof File
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-card border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Source Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Whistleblower Email
                  </h3>
                  <div className="bg-background rounded-lg p-2 border border-border/70 font-mono text-sm break-all">
                    {leak.sourceEmail}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Original Email
                  </h3>
                  <div className="bg-background rounded-lg p-2 border border-border/70 font-mono text-sm break-all">
                    {leak.originalEmail}
                  </div>
                </div>
                <div className="bg-warning/20 border border-warning/30 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground text-sm">
                    The identity of the whistleblower is protected through
                    zero-knowledge cryptography. Do not attempt to identify the
                    source.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/70">
              <CardHeader>
                <CardTitle>Verification Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Content Integrity
                    </span>
                    <Badge className="bg-primary">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Source Authentication
                    </span>
                    <Badge className="bg-primary">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Metadata Consistency
                    </span>
                    <Badge className="bg-primary">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Timestamp Verification
                    </span>
                    <Badge className="bg-primary">Verified</Badge>
                  </div>
                  <Separator className="bg-border/70" />
                  <div className="pt-2">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Verification Hash
                    </h3>
                    <div className="bg-background rounded-lg p-2 border border-border/70 font-mono text-xs break-all">
                      e7c8a9f6b3d2e1c0a9f8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
