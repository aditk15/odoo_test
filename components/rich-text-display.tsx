"use client"

interface RichTextDisplayProps {
  content: string
}

export function RichTextDisplay({ content }: RichTextDisplayProps) {
  // Simple markdown-like rendering
  const formatText = (text: string) => {
    return (
      text
        // Bold
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Italic
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        // Strikethrough
        .replace(/~~(.*?)~~/g, "<del>$1</del>")
        // Links
        .replace(
          /\[([^\]]+)\]$$([^)]+)$$/g,
          '<a href="$2" class="text-orange-600 hover:text-orange-700 underline" target="_blank" rel="noopener noreferrer">$1</a>',
        )
        // Images
        .replace(/!\[([^\]]*)\]$$([^)]+)$$/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-2" />')
        // Line breaks
        .replace(/\n/g, "<br />")
    )
  }

  return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formatText(content) }} />
}
