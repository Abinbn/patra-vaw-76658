import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Link as LinkIcon, Image as ImageIcon,
  Code, Quote, Minus, Eye, Columns, PanelLeft,
  Maximize2, Minimize2, Type
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
  const [viewMode, setViewMode] = useState<'write' | 'preview' | 'split'>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Helper to insert text at cursor position
  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  // Robust Markdown Parser
  const parseMarkdown = (text: string) => {
    if (!text) return '';

    let html = text;

    // Protect Code Blocks first to prevent other regex from messing them up
    const codeBlocks: string[] = [];
    html = html.replace(/```(\w*)([\s\S]*?)```/g, (match, lang, code) => {
      codeBlocks.push(`<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto my-4"><code class="language-${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
      return `__CODEBLOCK_${codeBlocks.length - 1}__`;
    });

    // Protect Inline Code
    const inlineCode: string[] = [];
    html = html.replace(/`([^`]+)`/g, (match, code) => {
      inlineCode.push(`<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-500">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`);
      return `__INLINECODE_${inlineCode.length - 1}__`;
    });

    // Headers
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4 pb-2 border-b">$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-5 mb-2">$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-lg font-semibold mt-4 mb-2">$1</h4>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">$1</blockquote>');

    // Horizontal Rule
    html = html.replace(/^---$/gim, '<hr class="my-6 border-t" />');

    // Lists (Unordered)
    html = html.replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc">$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>');
    // Wrap consecutive li in ul
    html = html.replace(/((<li class="ml-4 list-disc">.*<\/li>\n?)+)/g, '<ul class="list-disc pl-5 my-4 space-y-1">$1</ul>');

    // Lists (Ordered)
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>');
    // Wrap consecutive li in ol
    html = html.replace(/((<li class="ml-4 list-decimal">.*<\/li>\n?)+)/g, '<ol class="list-decimal pl-5 my-4 space-y-1">$1</ol>');

    // Bold & Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
    html = html.replace(/_(.*?)_/gim, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-medium">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4 shadow-sm" />');

    // Tables (Simple support)
    // This is tricky with regex, doing a basic pass for | col | col |
    html = html.replace(/^\|(.+)\|$/gim, (match, content) => {
      const cells = content.split('|').map((c: string) => `<td class="border px-4 py-2">${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    });
    html = html.replace(/((<tr>.*<\/tr>\n?)+)/g, '<div class="overflow-x-auto my-4"><table class="w-full border-collapse border"><tbody>$1</tbody></table></div>');

    // Paragraphs (handle newlines)
    // We need to be careful not to wrap HTML blocks in P tags
    const blocks = html.split(/\n\n+/);
    html = blocks.map(block => {
      if (block.trim().startsWith('<')) return block; // Assume HTML block
      if (block.trim().startsWith('__CODEBLOCK')) return block;
      return `<p class="mb-4 leading-relaxed">${block.replace(/\n/g, '<br/>')}</p>`;
    }).join('\n');

    // Restore Code Blocks
    codeBlocks.forEach((code, index) => {
      html = html.replace(`__CODEBLOCK_${index}__`, code);
    });

    // Restore Inline Code
    inlineCode.forEach((code, index) => {
      html = html.replace(`__INLINECODE_${index}__`, code);
    });

    return html;
  };

  // Update iframe content
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
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
        @media (prefers-color-scheme: dark) {
          body { background-color: #020817; color: #f8fafc; }
          a { color: #3b82f6; }
          blockquote { border-color: #1e293b; color: #94a3b8; }
          code { background-color: #1e293b; color: #e2e8f0; }
          pre { background-color: #0f172a; }
          th, td { border-color: #1e293b; }
        }
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        /* Typography Resets */
        img { max-width: 100%; height: auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #e2e8f0; padding: 0.5rem; text-align: left; }
        
        /* User provided CSS will override this */
      </style>
      <!-- Tailwind CDN for utility classes if user writes raw HTML with tailwind -->
      <script src="https://cdn.tailwindcss.com"></script>
    `;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          ${styles}
        </head>
        <body>
          ${parsedContent}
        </body>
      </html>
    `);
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
