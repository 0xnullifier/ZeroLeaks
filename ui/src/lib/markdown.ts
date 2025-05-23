// Simple Markdown to HTML converter for preview and leak rendering
export function markdownToHtml(markdown: string) {
  let html = markdown
    // Convert headers
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    // Convert bold and italic
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    // Convert links
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Convert images
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg" />')
    // Convert lists
    .replace(/^- (.*$)/gim, "<li>$1</li>")
    .replace(/^\d\. (.*$)/gim, "<li>$1</li>")
    // Convert paragraphs
    .replace(/^(?!<h|<li|<ul|<ol|<p|<img)(.*$)/gim, "<p>$1</p>")
    // Convert code
    .replace(/`(.*?)`/gim, "<code>$1</code>");

  // Wrap lists
  html = html.replace(/(<li>.*?<\/li>)/gs, (match) => {
    if (match.includes("1. ")) {
      return `<ol>${match}</ol>`;
    }
    return `<ul>${match}</ul>`;
  });

  return html;
} 