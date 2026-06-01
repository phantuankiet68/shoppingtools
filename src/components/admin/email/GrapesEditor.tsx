"use client";

import { useEffect, useRef } from "react";

import grapesjs from "grapesjs";
import type { Editor } from "grapesjs";

import newsletter from "grapesjs-preset-newsletter";

import "grapesjs/dist/css/grapes.min.css";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

export default function GrapesEditor({ value, onChange }: Props) {
  const editorRef = useRef<Editor | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    if (editorRef.current) {
      return;
    }

    const editor = grapesjs.init({
      container: containerRef.current,

      height: "100%",

      width: "100%",

      storageManager: false,

      fromElement: false,

      selectorManager: {
        componentFirst: true,
      },

      plugins: [newsletter],

      canvas: {
        styles: [],
      },

      assetManager: {
        upload: false,

        uploadFile: async (event: Event) => {
          try {
            const target = event.target as HTMLInputElement;

            const files = target.files;

            if (!files || files.length === 0) {
              return;
            }

            const formData = new FormData();

            formData.append("file", files[0]);

            const response = await fetch("/api/admin/email/upload", {
              method: "POST",
              body: formData,
            });

            const data = await response.json();

            if (data.success && data.url) {
              editor.AssetManager.add({
                src: data.url,
              });

              const selected = editor.getSelected();

              if (selected && selected.is("image")) {
                selected.addAttributes({
                  src: data.url,
                });
              }
            }
          } catch (error) {
            console.error(error);
          }
        },
      },

      styleManager: {
        sectors: [
          {
            name: "Typography",

            open: true,

            properties: [
              "font-family",
              "font-size",
              "font-weight",
              "letter-spacing",
              "line-height",
              "color",
              "text-align",
              "text-decoration",
            ],
          },

          {
            name: "Dimension",

            open: false,

            properties: ["width", "height", "padding", "margin"],
          },

          {
            name: "Decorations",

            open: false,

            properties: ["background-color", "border-radius", "border", "box-shadow"],
          },
        ],
      },
    });

    editorRef.current = editor;

    /*
     * BLOCKS
     */

    const bm = editor.BlockManager;

    bm.add("text-block", {
      label: "Text",

      category: "Basic",

      content: '<div style="padding:10px;">Double click to edit text</div>',
    });

    bm.add("image-block", {
      label: "Image",

      category: "Basic",

      content: '<img src="https://placehold.co/600x300" style="width:100%;display:block;" />',
    });

    bm.add("button-block", {
      label: "Button",

      category: "Basic",

      content:
        '<a href="#" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#ffffff;border-radius:8px;text-decoration:none;">Click Here</a>',
    });

    bm.add("divider-block", {
      label: "Divider",

      category: "Basic",

      content: '<hr style="border:none;border-top:1px solid #d1d5db;margin:20px 0;" />',
    });

    /*
     * LOAD INITIAL TEMPLATE
     */

    if (value) {
      const bodyMatch = value.match(/<body[^>]*>([\s\S]*)<\/body>/i);

      const bodyHtml = bodyMatch?.[1] ?? value;

      editor.setComponents(bodyHtml);
    }

    /*
     * UPDATE HTML
     */

    editor.on("update", () => {
      const html = editor.getHtml();

      const css = editor.getCss();

      const fullHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
${css}
</style>
</head>
<body>
${html}
</body>
</html>
`;

      onChange(fullHtml);
    });

    return () => {
      editor.destroy();

      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    if (!value) {
      return;
    }

    const bodyMatch = value.match(/<body[^>]*>([\s\S]*)<\/body>/i);

    const bodyHtml = bodyMatch?.[1] ?? value;

    const currentHtml = editor.getHtml();

    if (currentHtml.trim() === bodyHtml.trim()) {
      return;
    }

    editor.setComponents(bodyHtml);
  }, [value]);

  return (
    <div
      style={{
        height: "100%",
        background: "#fff",
      }}
    >
      <div
        ref={containerRef}
        style={{
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
}
