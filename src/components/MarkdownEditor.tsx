import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Link as LinkIcon, Image as ImageIcon,
  Code, Quote, Minus, Eye, Columns, PanelLeft,
  Maximize2, Minimize2
} from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your content in markdown or HTML...',
  className,
}) => {
  const [viewMode, setViewMode] = useState<'write' | 'split' | 'preview'>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Parse markdown to HTML
  const parseMarkdown = (text: string): string => {
    // If text contains HTML tags, render as-is
    if (/<[a-z][\s\S]*>/i.test(text)) {
      return text;
    }

    let html = text;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

    // Code blocks
    html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
    html = html.replace(/^\- (.+)$/gim, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.+)$/gim, '<li>$2</li>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr />');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br />');

    // Wrap in paragraphs
    html = `<p>${html}</p>`;

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');

    return html;
  };

  // Insert markdown syntax
  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Update iframe preview
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    const parsedContent = parseMarkdown(value);

    // Base styles for the iframe
    const styles = `
    <style>
      body { 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        padding: 2rem;
        margin: 0;
        max-width: 100%;
      }
      h1, h2, h3, h4, h5, h6 {
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
        font-weight: 600;
      }
      h1 { font-size: 2.25rem; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
      h2 { font-size: 1.5rem; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
      h3 { font-size: 1.25rem; }
      p { margin-bottom: 1rem; }
      a { color: #0366d6; text-decoration: none; }
      a:hover { text-decoration: underline; }
      code {
        background-color: rgba(27,31,35,0.05);
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
        font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 85%;
      }
      pre {
        background-color: #f6f8fa;
        padding: 1rem;
        border-radius: 6px;
        overflow-x: auto;
        margin: 1rem 0;
      }
      pre code {
        background-color: transparent;
        padding: 0;
        font-size: 100%;
      }
      blockquote {
        margin: 0;
        padding: 0 1em;
        color: #6a737d;
        border-left: 0.25em solid #dfe2e1;
      }
      ul, ol {
        padding-left: 2em;
        margin-bottom: 1rem;
      }
      li {
        margin-bottom: 0.25rem;
      }
      hr {
        height: 0.25em;
        padding: 0;
        margin: 24px 0;
        background-color: #e1e4e8;
        border: 0;
      }
      img {
        max-width: 100%;
        height: auto;
        border-radius: 0.5rem;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 1rem 0;
      }
      th, td {
        border: 1px solid #dfe2e5;
        padding: 6px 13px;
      }
      tr:nth-child(2n) {
        background-color: #f6f8fa;
      }
      th {
        background-color: #f8fafc;
        font-weight: 600;
      }
      @media (prefers-color-scheme: dark) {
        body { background-color: #0d1117; color: #c9d1d9; }
        a { color: #58a6ff; }
        blockquote { border-color: #30363d; color: #8b949e; }
        code { background-color: rgba(110,118,129,0.4); color: #c9d1d9; }
        pre { background-color: #161b22; }
        th, td { border-color: #30363d; }
        tr:nth-child(2n) { background-color: #161b22; }
        hr { background-color: #30363d; }
      }
    </style>
    <script src="https://cdn.tailwindcss.com"></script>
  `;

    const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${styles}
      </head>
      <body>
        ${parseMarkdown(value)}
      </body>
    </html>
  `;

    doc.open();
    doc.write(srcDoc);
    doc.close();
  }, [value]);

  return (
    <div className={cn(
      "flex flex-col border border-border rounded-lg overflow-hidden bg-background",
      isFullscreen && "fixed inset-0 z-50 rounded-none",
      className
    )}>
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30 p-2 gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => insertText('**', '**')} title="Bold">
            <Bold className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => insertText('*', '*')} title="Italic">
            <Italic className="w-4 h-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button variant="ghost" size="icon" onClick={() => insertText('# ')} title="Heading 1">
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => insertText('## ')} title="Heading 2">
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => insertText('### ')} title="Heading 3">
            <Heading3 className="w-4 h-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button variant="ghost" size="icon" onClick={() => insertText('- ')} title="Bullet List">
            <List className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => insertText('1. ')} title="Ordered List">
            <ListOrdered className="w-4 h-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button variant="ghost" size="icon" onClick={() => insertText('[', '](url)')} title="Link">
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => insertText('![alt text](', ')')} title="Image">
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => insertText('```\n', '\n```')} title="Code Block">
            <Code className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => insertText('> ')} title="Quote">
            <Quote className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => insertText('\n---\n')} title="Horizontal Rule">
            <Minus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <div className="flex bg-muted rounded-md p-0.5 border border-border">
            <Button
              variant={viewMode === 'write' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setViewMode('write')}
            >
              <PanelLeft className="w-3 h-3 mr-1" /> Write
            </Button>
            <Button
              variant={viewMode === 'split' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setViewMode('split')}
            >
              <Columns className="w-3 h-3 mr-1" /> Split
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setViewMode('preview')}
            >
              <Eye className="w-3 h-3 mr-1" /> Preview
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden relative min-h-[500px]">
        {viewMode === 'split' ? (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50} minSize={20}>
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-full p-4 resize-none border-0 focus-visible:ring-0 font-mono text-sm rounded-none"
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50} minSize={20}>
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0 bg-white dark:bg-slate-950"
                title="Preview"
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : viewMode === 'write' ? (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full p-4 resize-none border-0 focus-visible:ring-0 font-mono text-sm rounded-none"
          />
        ) : (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0 bg-white dark:bg-slate-950"
            title="Preview"
          />
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-muted/30 p-2 text-xs text-muted-foreground flex justify-between">
        <span>Markdown & HTML supported</span>
        <span>{value.length} chars</span>
      </div>
    </div>
  );
};