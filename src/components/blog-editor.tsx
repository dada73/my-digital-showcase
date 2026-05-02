import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Typography from "@tiptap/extension-typography";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, Minus, Undo, Redo, Code2 } from "lucide-react";

const lowlight = createLowlight(common);

type Props = {
  content: object | null;
  onChange: (json: object, text: string) => void;
};

const slashCommands = [
  { id: "h1", label: "Heading 1", desc: "Big section heading", icon: Heading1, run: (e: Editor) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { id: "h2", label: "Heading 2", desc: "Medium heading", icon: Heading2, run: (e: Editor) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { id: "h3", label: "Heading 3", desc: "Small heading", icon: Heading3, run: (e: Editor) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { id: "ul", label: "Bullet list", desc: "Simple bullet list", icon: List, run: (e: Editor) => e.chain().focus().toggleBulletList().run() },
  { id: "ol", label: "Numbered list", desc: "Numbered list", icon: ListOrdered, run: (e: Editor) => e.chain().focus().toggleOrderedList().run() },
  { id: "quote", label: "Quote", desc: "Capture a quote", icon: Quote, run: (e: Editor) => e.chain().focus().toggleBlockquote().run() },
  { id: "code", label: "Code block", desc: "Syntax-highlighted code", icon: Code2, run: (e: Editor) => e.chain().focus().toggleCodeBlock().run() },
  { id: "hr", label: "Divider", desc: "Horizontal rule", icon: Minus, run: (e: Editor) => e.chain().focus().setHorizontalRule().run() },
  { id: "img", label: "Image", desc: "Insert by URL", icon: ImageIcon, run: (e: Editor) => {
      const url = prompt("Image URL?");
      if (url) e.chain().focus().setImage({ src: url }).run();
  } },
];

export function BlogEditor({ content, onChange }: Props) {
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: ({ node }) => node.type.name === "heading" ? "Heading…" : "Type '/' for commands, or just start writing…" }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-2xl my-6" } }),
      Typography,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: content ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose-editor focus:outline-none min-h-[60vh] py-8",
      },
      handleKeyDown(_view, event) {
        if (slashOpen) {
          const filtered = slashCommands.filter((c) => c.label.toLowerCase().includes(slashQuery.toLowerCase()));
          if (event.key === "ArrowDown") { event.preventDefault(); setSlashIndex((i) => (i + 1) % filtered.length); return true; }
          if (event.key === "ArrowUp") { event.preventDefault(); setSlashIndex((i) => (i - 1 + filtered.length) % filtered.length); return true; }
          if (event.key === "Enter") {
            event.preventDefault();
            const cmd = filtered[slashIndex];
            if (cmd && editor) {
              // remove the "/" + query
              const { from } = editor.state.selection;
              editor.chain().focus().deleteRange({ from: from - (slashQuery.length + 1), to: from }).run();
              cmd.run(editor);
            }
            setSlashOpen(false);
            setSlashQuery("");
            return true;
          }
          if (event.key === "Escape") { setSlashOpen(false); return true; }
        }
        return false;
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getJSON(), editor.getText());
      // detect "/" at cursor
      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(Math.max(0, from - 30), from, "\n", "\0");
      const match = /(?:^|\s)\/([\w]*)$/.exec(textBefore);
      if (match) {
        setSlashQuery(match[1]);
        setSlashIndex(0);
        if (!slashOpen) {
          setSlashOpen(true);
          // position
          try {
            const coords = editor.view.coordsAtPos(from);
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) setSlashPos({ top: coords.bottom - rect.top + 6, left: coords.left - rect.left });
          } catch { /* noop */ }
        }
      } else if (slashOpen) {
        setSlashOpen(false);
      }
    },
  });

  useEffect(() => {
    if (editor && content && JSON.stringify(editor.getJSON()) === "{}") {
      editor.commands.setContent(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) return null;

  const filtered = slashCommands.filter((c) => c.label.toLowerCase().includes(slashQuery.toLowerCase()));

  return (
    <div ref={containerRef} className="relative">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />

      {slashOpen && filtered.length > 0 && (
        <div
          style={{ top: slashPos.top, left: slashPos.left }}
          className="absolute z-20 w-72 rounded-2xl border border-border bg-popover shadow-glow overflow-hidden"
        >
          <div className="p-2 border-b border-border text-[10px] uppercase tracking-widest font-mono text-muted-foreground">Insert block</div>
          <ul className="max-h-72 overflow-y-auto py-1">
            {filtered.map((c, i) => {
              const Icon = c.icon;
              return (
                <li key={c.id}>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const { from } = editor.state.selection;
                      editor.chain().focus().deleteRange({ from: from - (slashQuery.length + 1), to: from }).run();
                      c.run(editor);
                      setSlashOpen(false);
                      setSlashQuery("");
                    }}
                    onMouseEnter={() => setSlashIndex(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm ${i === slashIndex ? "bg-secondary" : ""}`}
                  >
                    <span className="grid place-items-center w-8 h-8 rounded-lg bg-background border border-border">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium truncate">{c.label}</span>
                      <span className="block text-xs text-muted-foreground truncate">{c.desc}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <style>{`
        .prose-editor h1 { font-family: var(--font-display); font-weight: 700; font-size: 2.25rem; line-height: 1.1; letter-spacing: -0.02em; margin: 1.5em 0 0.5em; }
        .prose-editor h2 { font-family: var(--font-display); font-weight: 700; font-size: 1.75rem; line-height: 1.2; letter-spacing: -0.02em; margin: 1.4em 0 0.4em; }
        .prose-editor h3 { font-family: var(--font-display); font-weight: 600; font-size: 1.35rem; margin: 1.2em 0 0.3em; }
        .prose-editor p { font-size: 1.0625rem; line-height: 1.75; margin: 0.6em 0; }
        .prose-editor ul, .prose-editor ol { padding-left: 1.4em; margin: 0.5em 0; }
        .prose-editor ul { list-style: disc; }
        .prose-editor ol { list-style: decimal; }
        .prose-editor blockquote { border-left: 3px solid var(--primary); padding: 0.4em 1em; margin: 1em 0; color: var(--muted-foreground); font-style: italic; }
        .prose-editor code { font-family: var(--font-mono); background: var(--secondary); padding: 0.1em 0.4em; border-radius: 0.4em; font-size: 0.9em; }
        .prose-editor pre { font-family: var(--font-mono); background: oklch(0.13 0.02 280); color: oklch(0.95 0.01 95); padding: 1.25em 1.5em; border-radius: 1.25rem; overflow-x: auto; margin: 1em 0; font-size: 0.9rem; line-height: 1.6; }
        .prose-editor pre code { background: transparent; padding: 0; color: inherit; }
        .prose-editor hr { border: none; border-top: 1px solid var(--border); margin: 2em 0; }
        .prose-editor a { color: var(--primary); text-decoration: underline; }
        .prose-editor img { border-radius: 1.25rem; margin: 1.5em 0; max-width: 100%; }
        .prose-editor p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--muted-foreground);
          pointer-events: none;
          height: 0;
        }
        .hljs-keyword, .hljs-built_in { color: oklch(0.72 0.26 350); }
        .hljs-string { color: oklch(0.78 0.18 50); }
        .hljs-comment { color: oklch(0.5 0.02 280); font-style: italic; }
        .hljs-number, .hljs-literal { color: oklch(0.78 0.18 50); }
        .hljs-function, .hljs-title { color: oklch(0.72 0.2 250); }
        .hljs-attr { color: oklch(0.88 0.22 120); }
      `}</style>
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const btn = "p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors";
  const active = "bg-secondary text-foreground";
  return (
    <div className="sticky top-14 md:top-0 z-10 flex flex-wrap items-center gap-1 py-2 px-1 mb-2 border-b border-border bg-background/80 backdrop-blur-xl">
      <button className={`${btn} ${editor.isActive("bold") ? active : ""}`} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold className="w-4 h-4" /></button>
      <button className={`${btn} ${editor.isActive("italic") ? active : ""}`} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic className="w-4 h-4" /></button>
      <button className={`${btn} ${editor.isActive("strike") ? active : ""}`} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strike"><Strikethrough className="w-4 h-4" /></button>
      <button className={`${btn} ${editor.isActive("code") ? active : ""}`} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code"><Code className="w-4 h-4" /></button>
      <Sep />
      <button className={`${btn} ${editor.isActive("heading", { level: 1 }) ? active : ""}`} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="w-4 h-4" /></button>
      <button className={`${btn} ${editor.isActive("heading", { level: 2 }) ? active : ""}`} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="w-4 h-4" /></button>
      <button className={`${btn} ${editor.isActive("heading", { level: 3 }) ? active : ""}`} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="w-4 h-4" /></button>
      <Sep />
      <button className={`${btn} ${editor.isActive("bulletList") ? active : ""}`} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="w-4 h-4" /></button>
      <button className={`${btn} ${editor.isActive("orderedList") ? active : ""}`} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="w-4 h-4" /></button>
      <button className={`${btn} ${editor.isActive("blockquote") ? active : ""}`} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="w-4 h-4" /></button>
      <button className={`${btn} ${editor.isActive("codeBlock") ? active : ""}`} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code2 className="w-4 h-4" /></button>
      <Sep />
      <button className={btn} onClick={() => {
        const url = prompt("Link URL?", editor.getAttributes("link").href ?? "https://");
        if (url === null) return;
        if (url === "") editor.chain().focus().unsetLink().run();
        else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      }}><LinkIcon className="w-4 h-4" /></button>
      <button className={btn} onClick={() => {
        const url = prompt("Image URL?");
        if (url) editor.chain().focus().setImage({ src: url }).run();
      }}><ImageIcon className="w-4 h-4" /></button>
      <button className={btn} onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="w-4 h-4" /></button>
      <Sep />
      <button className={btn} onClick={() => editor.chain().focus().undo().run()}><Undo className="w-4 h-4" /></button>
      <button className={btn} onClick={() => editor.chain().focus().redo().run()}><Redo className="w-4 h-4" /></button>
    </div>
  );
}

function Sep() { return <span className="w-px h-5 bg-border mx-1" />; }
