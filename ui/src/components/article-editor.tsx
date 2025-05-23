import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Bold, Italic, List, ListOrdered, LinkIcon, ImageIcon, Code, Eye } from "lucide-react"
import { useSubmitLeakStore } from "@/lib/submit-leak-store";

export function ArticleEditor() {
  const { content, setContent } = useSubmitLeakStore();
  const [activeTab, setActiveTab] = useState("write")

  const handleInsertFormatting = (format: string) => {
    const textarea = document.getElementById("article-content") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    let formattedText = ""

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        break
      case "italic":
        formattedText = `*${selectedText}*`
        break
      case "list":
        formattedText = `\n- ${selectedText}`
        break
      case "ordered-list":
        formattedText = `\n1. ${selectedText}`
        break
      case "link":
        formattedText = `[${selectedText}](url)`
        break
      case "image":
        formattedText = `![${selectedText}](image-url)`
        break
      case "code":
        formattedText = `\`${selectedText}\``
        break
      default:
        formattedText = selectedText
    }

    const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end)
    setContent(newContent)
    textarea.focus()
  }

  // Simple Markdown to HTML converter for preview
  const markdownToHtml = (markdown: string) => {
    let html = markdown
      // Convert headers
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      // Convert bold and italic
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      // Convert links
      .replace(/\[(.*?)\]$$(.*?)$$/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Convert images
      .replace(/!\[(.*?)\]$$(.*?)$$/gim, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg" />')
      // Convert lists
      .replace(/^- (.*$)/gim, "<li>$1</li>")
      .replace(/^\d\. (.*$)/gim, "<li>$1</li>")
      // Convert paragraphs
      .replace(/^(?!<h|<li|<ul|<ol|<p|<img)(.*$)/gim, "<p>$1</p>")
      // Convert code
      .replace(/`(.*?)`/gim, "<code>$1</code>")

    // Wrap lists
    html = html.replace(/<li>.*?<\/li>/gs, (match) => {
      if (match.includes("1. ")) {
        return `<ol>${match}</ol>`
      }
      return `<ul>${match}</ul>`
    })

    return html
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="border border-border/70 rounded-lg overflow-hidden">
      <div className="bg-card p-2 border-b border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            onClick={() => handleInsertFormatting("bold")}
          >
            <Bold className="h-4 w-4" />
            <span className="sr-only">Bold</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            onClick={() => handleInsertFormatting("italic")}
          >
            <Italic className="h-4 w-4" />
            <span className="sr-only">Italic</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            onClick={() => handleInsertFormatting("list")}
          >
            <List className="h-4 w-4" />
            <span className="sr-only">Bullet List</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            onClick={() => handleInsertFormatting("ordered-list")}
          >
            <ListOrdered className="h-4 w-4" />
            <span className="sr-only">Numbered List</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            onClick={() => handleInsertFormatting("link")}
          >
            <LinkIcon className="h-4 w-4" />
            <span className="sr-only">Link</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            onClick={() => handleInsertFormatting("image")}
          >
            <ImageIcon className="h-4 w-4" />
            <span className="sr-only">Image</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            onClick={() => handleInsertFormatting("code")}
          >
            <Code className="h-4 w-4" />
            <span className="sr-only">Code</span>
          </Button>
        </div>

        <TabsList className="bg-secondary">
          <TabsTrigger value="write" className="data-[state=active]:bg-secondary/80">
            Write
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-secondary/80">
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="write" className="mt-0">
        <Textarea
          id="article-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your article content here using Markdown formatting..."
          className="min-h-[400px] rounded-none border-0 bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
        />
      </TabsContent>

      <TabsContent value="preview" className="mt-0">
        <div
          className="min-h-[400px] p-4 bg-secondary prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
        />
      </TabsContent>

      <div className="bg-card p-2 border-t border-border/70 flex justify-between items-center text-xs text-muted-foreground">
        <div>Markdown formatting supported</div>
        <div>{content.length} characters</div>
      </div>
    </Tabs>
  )
}
