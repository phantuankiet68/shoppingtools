"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./RichEditor.module.css";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

const TOOLS = [
  { icon: "bi bi-type-bold", command: "bold" },
  { icon: "bi bi-type-italic", command: "italic" },
  { icon: "bi bi-type-underline", command: "underline" },
  { icon: "bi bi-list-ul", command: "insertUnorderedList" },
  { icon: "bi bi-list-ol", command: "insertOrderedList" },
  { icon: "bi bi-text-left", command: "justifyLeft" },
  { icon: "bi bi-text-center", command: "justifyCenter" },
  { icon: "bi bi-text-right", command: "justifyRight" },
];

export default function RichEditor({ value, onChange, placeholder, disabled }: Props) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [activeCommands, setActiveCommands] = useState<string[]>([]);

  useEffect(() => {
    if (!editorRef.current) return;

    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (command: string) => {
    editorRef.current?.focus();

    document.execCommand(command, false);

    onChange(editorRef.current?.innerHTML || "");
  };

  const applyColor = (color: string) => {
    document.execCommand("foreColor", false, color);

    onChange(editorRef.current?.innerHTML || "");
  };

  const applyBgColor = (color: string) => {
    document.execCommand("hiliteColor", false, color);

    onChange(editorRef.current?.innerHTML || "");
  };

  const applyHeading = (tag: string) => {
    document.execCommand("formatBlock", false, tag);

    onChange(editorRef.current?.innerHTML || "");
  };

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML || "");
  };

  const updateActiveStates = () => {
    const commands = TOOLS.filter((tool) => document.queryCommandState(tool.command)).map((tool) => tool.command);

    setActiveCommands(commands);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <select className={styles.select} onChange={(e) => applyHeading(e.target.value)} defaultValue="">
          <option value="">Text</option>
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
          <option value="p">P</option>
        </select>
        {TOOLS.map((tool) => (
          <button
            key={tool.command}
            type="button"
            className={`${styles.toolBtn} ${activeCommands.includes(tool.command) ? styles.toolBtnActive : ""}`}
            onClick={() => exec(tool.command)}
            disabled={disabled}
          >
            <i className={tool.icon} />
          </button>
        ))}

        <button
          type="button"
          className={styles.toolBtn}
          onClick={() => {
            const url = prompt("Image URL");

            if (!url) return;

            document.execCommand("insertImage", false, url);

            onChange(editorRef.current?.innerHTML || "");
          }}
        >
          <i className="bi bi-image" />
        </button>

        <button
          type="button"
          className={styles.toolBtn}
          onClick={() => {
            const url = prompt("Video URL");
            if (!url) return;
            const iframe = `
              <iframe
                src="${url}"
                frameborder="0"
                allowfullscreen
                style="width:100%;height:400px;border:none;border-radius:12px;"
              ></iframe>
            `;
            document.execCommand("insertHTML", false, iframe);
            onChange(editorRef.current?.innerHTML || "");
          }}
        >
          <i className="bi bi-camera-video" />
        </button>
        <input
          type="color"
          className={styles.colorPicker}
          title="Text color"
          onChange={(e) => applyColor(e.target.value)}
        />

        <input
          type="color"
          className={styles.colorPicker}
          title="Background color"
          onChange={(e) => applyBgColor(e.target.value)}
        />
      </div>

      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable={!disabled}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        onKeyUp={updateActiveStates}
        onMouseUp={updateActiveStates}
        onFocus={updateActiveStates}
      />
    </div>
  );
}
