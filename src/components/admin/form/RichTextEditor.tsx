"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Underline from "@tiptap/extension-underline";

import styles from "@/styles/admin/form/RichTextEditor.module.css";

type Props = {
  value: string; // HTML string
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

function safeHtml(v: unknown) {
  return String(v ?? "").trim();
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 140 }: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [lastHtml, setLastHtml] = useState<string>(safeHtml(value));

  const editor = useEditor({
    // ✅ FIX SSR hydration mismatch for Next.js
    immediatelyRender: false,

    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Write something…",
      }),
    ],

    content: safeHtml(value) || "",

    editorProps: {
      attributes: {
        class: styles.editor,
        style: `min-height:${minHeight}px`,
      },
    },

    onUpdate({ editor }) {
      const html = editor.getHTML();
      setLastHtml(html);
      onChange(html);
    },
  });

  // Sync external value -> editor (when openEdit/setForm)
  useEffect(() => {
    if (!editor) return;

    const next = safeHtml(value);
    const current = editor.getHTML();

    if (next === current) return;
    if (next === safeHtml(lastHtml)) return;

    editor.commands.setContent(next || "", { emitUpdate: false });
    setLastHtml(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  const can = useMemo(() => {
    if (!editor) return { undo: false, redo: false };
    return {
      undo: editor.can().chain().focus().undo().run(),
      redo: editor.can().chain().focus().redo().run(),
    };
  }, [editor]);

  function promptLink() {
    if (!editor) return;
    const prev = (editor.getAttributes("link") as any)?.href as string | undefined;
    const url = window.prompt("Enter link URL", prev || "https://");
    if (url === null) return;

    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: trimmed }).run();
  }

  function insertEmoji() {
    if (!editor) return;
    const emoji = window.prompt("Emoji (e.g. 😊🔥✅)", "😊");
    if (!emoji) return;
    editor.chain().focus().insertContent(emoji).run();
  }

  function insertImageByUrl() {
    if (!editor) return;
    const url = window.prompt("Image URL", "https://");
    if (!url) return;
    editor.chain().focus().setImage({ src: url.trim() }).run();
  }

  async function insertImageFromFile(file: File) {
    if (!editor) return;
    if (!file.type.startsWith("image/")) return;
    const src = URL.createObjectURL(file);
    editor.chain().focus().setImage({ src }).run();
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.toolBtn} onClick={() => editor?.chain().focus().toggleBold().run()} data-active={editor?.isActive("bold") ? "1" : "0"} title="Bold">
          <i className="bi bi-type-bold" />
        </button>

        <button type="button" className={styles.toolBtn} onClick={() => editor?.chain().focus().toggleItalic().run()} data-active={editor?.isActive("italic") ? "1" : "0"} title="Italic">
          <i className="bi bi-type-italic" />
        </button>

        <button type="button" className={styles.toolBtn} onClick={() => editor?.chain().focus().toggleUnderline().run()} data-active={editor?.isActive("underline") ? "1" : "0"} title="Underline">
          <i className="bi bi-type-underline" />
        </button>

        <span className={styles.sep} />

        <button type="button" className={styles.toolBtn} onClick={() => editor?.chain().focus().toggleBulletList().run()} data-active={editor?.isActive("bulletList") ? "1" : "0"} title="Bullet list">
          <i className="bi bi-list-ul" />
        </button>

        <button
          type="button"
          className={styles.toolBtn}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          data-active={editor?.isActive("orderedList") ? "1" : "0"}
          title="Numbered list">
          <i className="bi bi-list-ol" />
        </button>

        <button type="button" className={styles.toolBtn} onClick={() => editor?.chain().focus().toggleBlockquote().run()} data-active={editor?.isActive("blockquote") ? "1" : "0"} title="Quote">
          <i className="bi bi-chat-left-quote" />
        </button>

        <span className={styles.sep} />

        <label className={styles.colorPick} title="Text color">
          <i className="bi bi-palette" />
          <input
            type="color"
            onChange={(e) => {
              const c = e.target.value;
              editor?.chain().focus().setColor(c).run();
            }}
          />
        </label>

        <button type="button" className={styles.toolBtn} onClick={() => editor?.chain().focus().unsetColor().run()} title="Clear color">
          <i className="bi bi-eraser" />
        </button>

        <span className={styles.sep} />

        <button type="button" className={styles.toolBtn} onClick={promptLink} data-active={editor?.isActive("link") ? "1" : "0"} title="Link">
          <i className="bi bi-link-45deg" />
        </button>

        <button type="button" className={styles.toolBtn} onClick={insertEmoji} title="Emoji">
          <i className="bi bi-emoji-smile" />
        </button>

        <button type="button" className={styles.toolBtn} onClick={insertImageByUrl} title="Insert image by URL">
          <i className="bi bi-image" />
        </button>

        <button type="button" className={styles.toolBtn} onClick={() => fileRef.current?.click()} title="Upload image (local)">
          <i className="bi bi-cloud-arrow-up" />
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className={styles.fileHidden}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) insertImageFromFile(f);
            e.currentTarget.value = "";
          }}
        />

        <span className={styles.spacer} />

        <button type="button" className={styles.toolBtn} onClick={() => editor?.chain().focus().undo().run()} disabled={!can.undo} title="Undo">
          <i className="bi bi-arrow-counterclockwise" />
        </button>

        <button type="button" className={styles.toolBtn} onClick={() => editor?.chain().focus().redo().run()} disabled={!can.redo} title="Redo">
          <i className="bi bi-arrow-clockwise" />
        </button>
      </div>

      <div className={styles.content}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
