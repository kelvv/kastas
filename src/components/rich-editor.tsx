"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

export function RichEditor({ value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "min-h-[400px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  async function uploadImage(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const j = await res.json();
    if (j.url) {
      editor!.chain().focus().setImage({ src: j.url }).run();
    } else {
      alert("上传失败: " + (j.error || "未知错误"));
    }
  }

  function btn(active: boolean, label: string, onClick: () => void) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`px-2 py-1 text-sm rounded ${
          active ? "bg-primary text-white" : "hover:bg-slate-200"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="border border-border rounded">
      <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border-b border-border">
        {btn(editor.isActive("bold"), "B", () =>
          editor.chain().focus().toggleBold().run()
        )}
        {btn(editor.isActive("italic"), "I", () =>
          editor.chain().focus().toggleItalic().run()
        )}
        {btn(editor.isActive("strike"), "S", () =>
          editor.chain().focus().toggleStrike().run()
        )}
        <span className="border-r border-border mx-1" />
        {btn(editor.isActive("heading", { level: 2 }), "H2", () =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        )}
        {btn(editor.isActive("heading", { level: 3 }), "H3", () =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        )}
        {btn(editor.isActive("paragraph"), "正文", () =>
          editor.chain().focus().setParagraph().run()
        )}
        <span className="border-r border-border mx-1" />
        {btn(editor.isActive("bulletList"), "• 列表", () =>
          editor.chain().focus().toggleBulletList().run()
        )}
        {btn(editor.isActive("orderedList"), "1. 列表", () =>
          editor.chain().focus().toggleOrderedList().run()
        )}
        {btn(editor.isActive("blockquote"), "引用", () =>
          editor.chain().focus().toggleBlockquote().run()
        )}
        <span className="border-r border-border mx-1" />
        {btn(false, "🔗 链接", () => {
          const url = prompt("链接地址", "https://");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        })}
        {btn(false, "🖼 图片", () => fileRef.current?.click())}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadImage(f);
            e.target.value = "";
          }}
        />
        <span className="border-r border-border mx-1" />
        {btn(false, "↶", () => editor.chain().focus().undo().run())}
        {btn(false, "↷", () => editor.chain().focus().redo().run())}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
