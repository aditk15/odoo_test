"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Bold, Italic, Strikethrough, List, ListOrdered, Link, ImageIcon, Smile } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const emojis = ["😀", "😂", "😍", "🤔", "👍", "👎", "❤️", "🔥", "💯", "🎉", "🚀", "💡"]

  const insertText = (before: string, after = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const insertLink = () => {
    const url = prompt("Enter URL:")
    if (url) {
      const text = prompt("Enter link text:") || url
      insertText(`[${text}](${url})`)
    }
  }

  const insertImage = () => {
    const url = prompt("Enter image URL:")
    if (url) {
      const alt = prompt("Enter alt text:") || "Image"
      insertText(`![${alt}](${url})`)
    }
  }

  const insertEmoji = (emoji: string) => {
    insertText(emoji)
    setShowEmojiPicker(false)
  }

  return (
    <div className="border rounded-lg">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
        <Button type="button" variant="ghost" size="sm" onClick={() => insertText("**", "**")} title="Bold">
          <Bold className="h-4 w-4" />
        </Button>

        <Button type="button" variant="ghost" size="sm" onClick={() => insertText("*", "*")} title="Italic">
          <Italic className="h-4 w-4" />
        </Button>

        <Button type="button" variant="ghost" size="sm" onClick={() => insertText("~~", "~~")} title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button type="button" variant="ghost" size="sm" onClick={() => insertText("\n- ")} title="Bullet List">
          <List className="h-4 w-4" />
        </Button>

        <Button type="button" variant="ghost" size="sm" onClick={() => insertText("\n1. ")} title="Numbered List">
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button type="button" variant="ghost" size="sm" onClick={insertLink} title="Insert Link">
          <Link className="h-4 w-4" />
        </Button>

        <Button type="button" variant="ghost" size="sm" onClick={insertImage} title="Insert Image">
          <ImageIcon className="h-4 w-4" />
        </Button>

        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Insert Emoji"
          >
            <Smile className="h-4 w-4" />
          </Button>

          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-lg shadow-lg z-10">
              <div className="grid grid-cols-6 gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="p-1 hover:bg-gray-100 rounded text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[200px] border-0 focus-visible:ring-0 resize-none"
      />
    </div>
  )
}
