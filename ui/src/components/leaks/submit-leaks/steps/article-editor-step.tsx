import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ArticleEditor } from "@/components/article-editor";
import { useSubmitLeakStore } from "@/lib/submit-leak-store";
import { useStepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

export function ArticleEditorStep({ categories }: { categories: string[] }) {

  const { title, setTitle, summary, setSummary, category, setCategory, tags, setTags, content, setContent } = useSubmitLeakStore();
  const stepper = useStepper();
  return (
    <Card className="bg-card border-border/70">
      <CardHeader>
        <CardTitle>Article Editor</CardTitle>
        <CardDescription>
          Compose the article that will be associated with your leak. This will be publicly visible.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="article-title">Article Title</Label>
          <Input
            id="article-title"
            placeholder="Enter a clear, descriptive title"
            className="bg-secondary border-border/60 focus-visible:ring-primary"
            defaultValue={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="article-summary">Summary</Label>
          <Textarea
            id="article-summary"
            placeholder="Provide a brief summary of the leak (max 200 words)"
            className="bg-secondary border-border/60 focus-visible:ring-primary"
            defaultValue={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            defaultValue={category}
            onValueChange={(value) => setCategory(value)}
          >
            <SelectTrigger className="bg-secondary border-border/60 focus:ring-primary">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border/70">
              {categories.map((category) => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="article-tags">Tags</Label>
          <Input
            id="article-tags"
            placeholder="Enter tags separated by commas (e.g., corruption, finance, government)"
            className="bg-secondary border-border/60 focus-visible:ring-primary"
            defaultValue={tags.join(", ")}
            onChange={(e) => setTags(e.target.value.split(", "))}
          />
        </div>
        <Separator className="bg-secondary" />
        <div className="space-y-2">
          <Label>Article Content</Label>
          <ArticleEditor />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button onClick={() => stepper.prevStep()} variant="ghost">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={() => stepper.nextStep()} className="w-32 bg-primary hover:bg-primary/90">
          Save <Save className="w-4 h-4" />
        </Button>
      </CardFooter>
      </Card>
  );
} 