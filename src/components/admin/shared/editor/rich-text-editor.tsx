'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    BackgroundColor,
    Color,
    FontFamily,
    FontSize,
    TextStyle,
} from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import styles from './rich-text-editor.module.css';

export type RichTextEditorField = 'description' | 'content';

export interface RichTextEditorProps {
    field: RichTextEditorField;
    value: string;
    onChange: (value: string) => void;
    siteId: string;
    placeholder?: string;
    disabled?: boolean;
    minHeight?: number;
    maxHeight?: number;
    showCharacterCount?: boolean;
    maxLength?: number;
    className?: string;
}

type ToolbarButtonProps = {
    label: string;
    icon: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
};

type ToolbarGroupProps = {
    children: ReactNode;
};

const FONT_FAMILIES = [
    { label: 'Inter', value: 'Inter, sans-serif' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: '"Times New Roman", serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Courier New', value: '"Courier New", monospace' },
];

const FONT_SIZES = [
    { label: '12', value: '12px' },
    { label: '14', value: '14px' },
    { label: '16', value: '16px' },
    { label: '18', value: '18px' },
    { label: '20', value: '20px' },
    { label: '24', value: '24px' },
    { label: '28', value: '28px' },
    { label: '32', value: '32px' },
    { label: '40', value: '40px' },
];

const TEXT_COLORS = [
    '#111827',
    '#374151',
    '#6B7280',
    '#DC2626',
    '#EA580C',
    '#D97706',
    '#16A34A',
    '#0891B2',
    '#2563EB',
    '#4F46E5',
    '#7C3AED',
    '#DB2777',
];

const HIGHLIGHT_COLORS = [
    '#FEF3C7',
    '#FDE68A',
    '#DCFCE7',
    '#D1FAE5',
    '#CFFAFE',
    '#DBEAFE',
    '#E0E7FF',
    '#EDE9FE',
    '#FCE7F3',
    '#FEE2E2',
];

const ACCEPTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function ToolbarGroup({ children }: ToolbarGroupProps) {
    return <div className={styles.toolbarGroup}>{children}</div>;
}

function ToolbarButton({
    label,
    icon,
    active = false,
    disabled = false,
    onClick,
}: ToolbarButtonProps) {
    return (
        <button
            className={`${styles.toolbarButton} ${active ? styles.toolbarButtonActive : ''}`}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            onClick={onClick}
        >
            <i className={`bi ${icon}`} aria-hidden="true" />
        </button>
    );
}

export default function RichTextEditor({
    field,
    value,
    onChange,
    siteId,
    placeholder,
    disabled = false,
    minHeight,
    maxHeight,
    showCharacterCount = true,
    maxLength,
    className = '',
}: RichTextEditorProps) {
    const imageInputRef = useRef<HTMLInputElement>(null);

    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    const [showImageInput, setShowImageInput] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const [showTextColor, setShowTextColor] = useState(false);
    const [showHighlight, setShowHighlight] = useState(false);
    const [showFontFamily, setShowFontFamily] = useState(false);
    const [showFontSize, setShowFontSize] = useState(false);

    const editorPlaceholder = useMemo(() => {
        if (placeholder) {
            return placeholder;
        }

        return field === 'content'
            ? 'Start writing your article content...'
            : 'Write a short description...';
    }, [field, placeholder]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
                link: {
                    openOnClick: false,
                    autolink: true,
                    linkOnPaste: true,
                    HTMLAttributes: {
                        class: styles.editorLink,
                        rel: 'noopener noreferrer nofollow',
                        target: '_blank',
                    },
                },
            }),
            TextStyle,
            FontFamily.configure({
                types: ['textStyle'],
            }),
            FontSize.configure({
                types: ['textStyle'],
            }),
            Color.configure({
                types: ['textStyle'],
            }),
            BackgroundColor.configure({
                types: ['textStyle'],
            }),
            Highlight.configure({
                multicolor: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
                defaultAlignment: 'left',
            }),
            Image.configure({
                inline: false,
                allowBase64: false,
                HTMLAttributes: {
                    class: styles.editorImage,
                },
            }),
            Placeholder.configure({
                placeholder: editorPlaceholder,
            }),
        ],
        content: value || '',
        immediatelyRender: false,
        editable: !disabled,
        onUpdate: ({ editor: currentEditor }) => {
            const html = currentEditor.getHTML();

            if (maxLength) {
                const textLength = currentEditor.getText().length;

                if (textLength > maxLength) {
                    return;
                }
            }

            onChange(html);
        },
    });

    useEffect(() => {
        if (!editor) {
            return;
        }

        const currentContent = editor.getHTML();
        const nextContent = value || '';

        if (currentContent !== nextContent) {
            editor.commands.setContent(nextContent, {
                emitUpdate: false,
            });
        }
    }, [editor, value]);

    useEffect(() => {
        if (!editor) {
            return;
        }

        editor.setEditable(!disabled);
    }, [editor, disabled]);

    const characterCount = editor?.getText().length ?? 0;
    const currentFontFamily = editor?.getAttributes('textStyle').fontFamily;
    const currentFontSize = editor?.getAttributes('textStyle').fontSize;
    const currentTextColor = editor?.getAttributes('textStyle').color;
    const currentBackgroundColor = editor?.getAttributes('textStyle').backgroundColor;

    const handleAddLink = useCallback(() => {
        if (!editor) {
            return;
        }

        const url = linkUrl.trim();

        if (!url) {
            editor.chain().focus().unsetLink().run();
            setShowLinkInput(false);
            setLinkUrl('');
            return;
        }

        editor.chain().focus().setLink({ href: url }).run();
        setShowLinkInput(false);
        setLinkUrl('');
    }, [editor, linkUrl]);

    const handleOpenImagePicker = useCallback(() => {
        if (disabled || isUploadingImage) {
            return;
        }

        setUploadError('');
        setShowImageInput(true);

        requestAnimationFrame(() => {
            imageInputRef.current?.click();
        });
    }, [disabled, isUploadingImage]);

    const handleImageUpload = useCallback(
        async (file: File) => {
            if (!editor) {
                return;
            }

            if (!siteId) {
                setUploadError('Site ID is required.');
                return;
            }

            if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                setUploadError('Unsupported image type. Please use JPG, PNG, WEBP, GIF or SVG.');
                return;
            }

            if (file.size <= 0) {
                setUploadError('The selected image is empty.');
                return;
            }

            if (file.size > MAX_IMAGE_SIZE) {
                setUploadError('Image size cannot exceed 5MB.');
                return;
            }

            setIsUploadingImage(true);
            setUploadError('');

            try {
                const formData = new FormData();

                formData.append('file', file);
                formData.append('siteId', siteId);
                formData.append('folder', 'media');

                const response = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();

                if (!response.ok || !result.success || !result.file?.url) {
                    throw new Error(result.message || 'Image upload failed.');
                }

                editor
                    .chain()
                    .focus()
                    .setImage({
                        src: result.file.url,
                        alt: result.file.originalName || file.name,
                    })
                    .run();

                setShowImageInput(false);
                setUploadError('');
            } catch (error) {
                console.error('RichTextEditor image upload error:', error);

                setUploadError(
                    error instanceof Error
                        ? error.message
                        : 'Image upload failed. Please try again.',
                );
            } finally {
                setIsUploadingImage(false);

                if (imageInputRef.current) {
                    imageInputRef.current.value = '';
                }
            }
        },
        [editor, siteId],
    );

    const handleImageInputChange = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];

            if (!file) {
                return;
            }

            await handleImageUpload(file);
        },
        [handleImageUpload],
    );

    const handleFontFamily = useCallback(
        (fontFamily: string) => {
            if (!editor) {
                return;
            }

            editor.chain().focus().setFontFamily(fontFamily).run();
            setShowFontFamily(false);
        },
        [editor],
    );

    const handleFontSize = useCallback(
        (fontSize: string) => {
            if (!editor) {
                return;
            }

            editor.chain().focus().setFontSize(fontSize).run();
            setShowFontSize(false);
        },
        [editor],
    );

    const handleTextColor = useCallback(
        (color: string) => {
            if (!editor) {
                return;
            }

            editor.chain().focus().setColor(color).run();
            setShowTextColor(false);
        },
        [editor],
    );

    const handleHighlight = useCallback(
        (color: string) => {
            if (!editor) {
                return;
            }

            editor.chain().focus().toggleHighlight({ color }).run();
            setShowHighlight(false);
        },
        [editor],
    );

    const handleClearFormatting = useCallback(() => {
        if (!editor) {
            return;
        }

        editor
            .chain()
            .focus()
            .clearNodes()
            .unsetAllMarks()
            .unsetFontFamily()
            .unsetFontSize()
            .unsetColor()
            .unsetBackgroundColor()
            .unsetTextAlign()
            .run();
    }, [editor]);

    const closeFloatingMenus = useCallback(() => {
        setShowFontFamily(false);
        setShowFontSize(false);
        setShowTextColor(false);
        setShowHighlight(false);
    }, []);

    if (!editor) {
        return (
            <div className={`${styles.editor} ${className}`}>
                <div className={styles.loadingState}>
                    <span className={styles.loadingSpinner} />
                    <span>Loading editor...</span>
                </div>
            </div>
        );
    }

    const editorStyle = {
        '--editor-min-height': `${minHeight ?? (field === 'content' ? 480 : 180)}px`,
        '--editor-max-height': maxHeight ? `${maxHeight}px` : 'none',
    } as CSSProperties;

    return (
        <div
            className={`${styles.editor} ${disabled ? styles.editorDisabled : ''} ${className}`}
            style={editorStyle}
        >
            <div className={styles.editorHeader}>
                <div className={styles.editorHeaderLeft}>
                    <div className={styles.editorIcon}>
                        <i className="bi bi-pencil-square" aria-hidden="true" />
                    </div>

                    <div>
                        <div className={styles.editorTitle}>
                            {field === 'content' ? 'Article Content' : 'Description'}
                        </div>

                        <div className={styles.editorSubtitle}>Rich text editor</div>
                    </div>
                </div>

                <div className={styles.editorHeaderRight}>
                    <span className={styles.editorFieldBadge}>{field}</span>
                </div>
            </div>

            <div className={styles.toolbar}>
                <ToolbarGroup>
                    <div className={styles.selectWrapper}>
                        <button
                            className={`${styles.selectButton} ${showFontFamily ? styles.selectButtonActive : ''}`}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                                setShowFontFamily((current) => !current);
                                setShowFontSize(false);
                                setShowTextColor(false);
                                setShowHighlight(false);
                            }}
                        >
                            <span>
                                {FONT_FAMILIES.find((font) => font.value === currentFontFamily)
                                    ?.label ?? 'Font'}
                            </span>

                            <i className="bi bi-chevron-down" aria-hidden="true" />
                        </button>

                        {showFontFamily && (
                            <div className={styles.dropdownMenu}>
                                {FONT_FAMILIES.map((font) => (
                                    <button
                                        key={font.value}
                                        className={styles.dropdownItem}
                                        type="button"
                                        style={{ fontFamily: font.value }}
                                        onClick={() => handleFontFamily(font.value)}
                                    >
                                        <span>{font.label}</span>

                                        {currentFontFamily === font.value && (
                                            <i className="bi bi-check2" aria-hidden="true" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.selectWrapper}>
                        <button
                            className={`${styles.sizeButton} ${showFontSize ? styles.selectButtonActive : ''}`}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                                setShowFontSize((current) => !current);
                                setShowFontFamily(false);
                                setShowTextColor(false);
                                setShowHighlight(false);
                            }}
                        >
                            <span>{currentFontSize?.replace('px', '') ?? '16'}</span>

                            <i className="bi bi-chevron-down" aria-hidden="true" />
                        </button>

                        {showFontSize && (
                            <div className={`${styles.dropdownMenu} ${styles.fontSizeMenu}`}>
                                {FONT_SIZES.map((font) => (
                                    <button
                                        key={font.value}
                                        className={styles.dropdownItem}
                                        type="button"
                                        onClick={() => handleFontSize(font.value)}
                                    >
                                        <span>{font.label}px</span>

                                        {currentFontSize === font.value && (
                                            <i className="bi bi-check2" aria-hidden="true" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </ToolbarGroup>

                <ToolbarGroup>
                    <ToolbarButton
                        label="Bold"
                        icon="bi-type-bold"
                        active={editor.isActive('bold')}
                        disabled={disabled}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    />

                    <ToolbarButton
                        label="Italic"
                        icon="bi-type-italic"
                        active={editor.isActive('italic')}
                        disabled={disabled}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                    />

                    <ToolbarButton
                        label="Underline"
                        icon="bi-type-underline"
                        active={editor.isActive('underline')}
                        disabled={disabled}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                    />

                    <ToolbarButton
                        label="Strikethrough"
                        icon="bi-type-strikethrough"
                        active={editor.isActive('strike')}
                        disabled={disabled}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                    />
                </ToolbarGroup>

                <ToolbarGroup>
                    <div className={styles.colorPickerWrapper}>
                        <button
                            className={`${styles.colorButton} ${showTextColor ? styles.selectButtonActive : ''}`}
                            type="button"
                            disabled={disabled}
                            title="Text color"
                            aria-label="Text color"
                            onClick={() => {
                                setShowTextColor((current) => !current);
                                setShowHighlight(false);
                                setShowFontFamily(false);
                                setShowFontSize(false);
                            }}
                        >
                            <i className="bi bi-type" aria-hidden="true" />

                            <span
                                className={styles.colorIndicator}
                                style={{
                                    backgroundColor: currentTextColor || '#111827',
                                }}
                            />
                        </button>

                        {showTextColor && (
                            <div className={styles.colorPalette}>
                                <div className={styles.paletteHeader}>
                                    <span>Text color</span>

                                    <button type="button" onClick={closeFloatingMenus}>
                                        <i className="bi bi-x" aria-hidden="true" />
                                    </button>
                                </div>

                                <div className={styles.paletteGrid}>
                                    {TEXT_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            className={`${styles.colorSwatch} ${currentTextColor === color ? styles.colorSwatchActive : ''}`}
                                            type="button"
                                            title={color}
                                            aria-label={`Text color ${color}`}
                                            onClick={() => handleTextColor(color)}
                                        >
                                            <span style={{ backgroundColor: color }} />
                                        </button>
                                    ))}
                                </div>

                                <button
                                    className={styles.removeColorButton}
                                    type="button"
                                    onClick={() => {
                                        editor.chain().focus().unsetColor().run();
                                        setShowTextColor(false);
                                    }}
                                >
                                    <i className="bi bi-slash-circle" aria-hidden="true" />
                                    Remove color
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.colorPickerWrapper}>
                        <button
                            className={`${styles.colorButton} ${showHighlight ? styles.selectButtonActive : ''}`}
                            type="button"
                            disabled={disabled}
                            title="Highlight"
                            aria-label="Highlight"
                            onClick={() => {
                                setShowHighlight((current) => !current);
                                setShowTextColor(false);
                                setShowFontFamily(false);
                                setShowFontSize(false);
                            }}
                        >
                            <i className="bi bi-highlighter" aria-hidden="true" />

                            <span
                                className={styles.highlightIndicator}
                                style={{
                                    backgroundColor: currentBackgroundColor || '#FDE68A',
                                }}
                            />
                        </button>

                        {showHighlight && (
                            <div className={styles.colorPalette}>
                                <div className={styles.paletteHeader}>
                                    <span>Highlight</span>

                                    <button type="button" onClick={closeFloatingMenus}>
                                        <i className="bi bi-x" aria-hidden="true" />
                                    </button>
                                </div>

                                <div className={styles.paletteGrid}>
                                    {HIGHLIGHT_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            className={styles.colorSwatch}
                                            type="button"
                                            title={color}
                                            aria-label={`Highlight color ${color}`}
                                            onClick={() => handleHighlight(color)}
                                        >
                                            <span style={{ backgroundColor: color }} />
                                        </button>
                                    ))}
                                </div>

                                <button
                                    className={styles.removeColorButton}
                                    type="button"
                                    onClick={() => {
                                        editor.chain().focus().unsetHighlight().run();
                                        setShowHighlight(false);
                                    }}
                                >
                                    <i className="bi bi-slash-circle" aria-hidden="true" />
                                    Remove highlight
                                </button>
                            </div>
                        )}
                    </div>
                </ToolbarGroup>

                <ToolbarGroup>
                    <div className={styles.headingWrapper}>
                        <select
                            className={styles.headingSelect}
                            value={
                                editor.isActive('heading', { level: 1 })
                                    ? 'h1'
                                    : editor.isActive('heading', { level: 2 })
                                      ? 'h2'
                                      : editor.isActive('heading', { level: 3 })
                                        ? 'h3'
                                        : editor.isActive('heading', { level: 4 })
                                          ? 'h4'
                                          : editor.isActive('heading', { level: 5 })
                                            ? 'h5'
                                            : editor.isActive('heading', { level: 6 })
                                              ? 'h6'
                                              : 'paragraph'
                            }
                            disabled={disabled}
                            onChange={(event) => {
                                const nextValue = event.target.value;

                                if (nextValue === 'paragraph') {
                                    editor.chain().focus().setParagraph().run();
                                    return;
                                }

                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({
                                        level: Number(nextValue.replace('h', '')) as
                                            | 1
                                            | 2
                                            | 3
                                            | 4
                                            | 5
                                            | 6,
                                    })
                                    .run();
                            }}
                        >
                            <option value="paragraph">Paragraph</option>
                            <option value="h1">Heading 1</option>
                            <option value="h2">Heading 2</option>
                            <option value="h3">Heading 3</option>
                            <option value="h4">Heading 4</option>
                            <option value="h5">Heading 5</option>
                            <option value="h6">Heading 6</option>
                        </select>
                    </div>
                </ToolbarGroup>

                <ToolbarGroup>
                    <ToolbarButton
                        label="Align left"
                        icon="bi-text-left"
                        active={editor.isActive({ textAlign: 'left' })}
                        disabled={disabled}
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    />

                    <ToolbarButton
                        label="Align center"
                        icon="bi-text-center"
                        active={editor.isActive({ textAlign: 'center' })}
                        disabled={disabled}
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    />

                    <ToolbarButton
                        label="Align right"
                        icon="bi-text-right"
                        active={editor.isActive({ textAlign: 'right' })}
                        disabled={disabled}
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    />

                    <ToolbarButton
                        label="Justify"
                        icon="bi-justify"
                        active={editor.isActive({ textAlign: 'justify' })}
                        disabled={disabled}
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    />
                </ToolbarGroup>

                <ToolbarGroup>
                    <ToolbarButton
                        label="Bullet list"
                        icon="bi-list-ul"
                        active={editor.isActive('bulletList')}
                        disabled={disabled}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                    />

                    <ToolbarButton
                        label="Ordered list"
                        icon="bi-list-ol"
                        active={editor.isActive('orderedList')}
                        disabled={disabled}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    />

                    <ToolbarButton
                        label="Blockquote"
                        icon="bi-quote"
                        active={editor.isActive('blockquote')}
                        disabled={disabled}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    />

                    <ToolbarButton
                        label="Code block"
                        icon="bi-code-square"
                        active={editor.isActive('codeBlock')}
                        disabled={disabled}
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    />
                </ToolbarGroup>

                <ToolbarGroup>
                    <ToolbarButton
                        label="Add link"
                        icon="bi-link-45deg"
                        active={editor.isActive('link')}
                        disabled={disabled}
                        onClick={() => {
                            setLinkUrl(editor.getAttributes('link').href || '');
                            setShowLinkInput((current) => !current);
                            setShowImageInput(false);
                        }}
                    />

                    <ToolbarButton
                        label="Insert image"
                        icon={isUploadingImage ? 'bi-arrow-repeat' : 'bi-image'}
                        disabled={disabled || isUploadingImage}
                        onClick={handleOpenImagePicker}
                    />

                    <input
                        ref={imageInputRef}
                        className={styles.hiddenFileInput}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        onChange={handleImageInputChange}
                    />
                </ToolbarGroup>

                <ToolbarGroup>
                    <ToolbarButton
                        label="Clear formatting"
                        icon="bi-eraser"
                        disabled={disabled}
                        onClick={handleClearFormatting}
                    />

                    <ToolbarButton
                        label="Undo"
                        icon="bi-arrow-counterclockwise"
                        disabled={disabled || !editor.can().undo()}
                        onClick={() => editor.chain().focus().undo().run()}
                    />

                    <ToolbarButton
                        label="Redo"
                        icon="bi-arrow-clockwise"
                        disabled={disabled || !editor.can().redo()}
                        onClick={() => editor.chain().focus().redo().run()}
                    />
                </ToolbarGroup>
            </div>

            {showLinkInput && (
                <div className={styles.insertBar}>
                    <div className={styles.insertLabel}>
                        <i className="bi bi-link-45deg" aria-hidden="true" />
                        <span>Insert link</span>
                    </div>

                    <div className={styles.insertInputWrapper}>
                        <input
                            className={styles.insertInput}
                            type="url"
                            value={linkUrl}
                            placeholder="https://example.com"
                            autoFocus
                            onChange={(event) => setLinkUrl(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleAddLink();
                                }

                                if (event.key === 'Escape') {
                                    setShowLinkInput(false);
                                    setLinkUrl('');
                                }
                            }}
                        />
                    </div>

                    <button
                        className={styles.insertActionButton}
                        type="button"
                        onClick={handleAddLink}
                    >
                        Apply
                    </button>

                    <button
                        className={styles.insertCancelButton}
                        type="button"
                        onClick={() => {
                            setShowLinkInput(false);
                            setLinkUrl('');
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}

            {showImageInput && (
                <div className={styles.imageUploadBar}>
                    <div className={styles.imageUploadInfo}>
                        <div className={styles.imageUploadIcon}>
                            <i
                                className={
                                    isUploadingImage ? 'bi bi-arrow-repeat' : 'bi bi-cloud-arrow-up'
                                }
                                aria-hidden="true"
                            />
                        </div>

                        <div>
                            <div className={styles.imageUploadTitle}>
                                {isUploadingImage ? 'Uploading image...' : 'Insert image'}
                            </div>

                            <div className={styles.imageUploadDescription}>
                                JPG, PNG, WEBP, GIF or SVG · Maximum 5MB
                            </div>
                        </div>
                    </div>

                    {uploadError && (
                        <div className={styles.uploadError}>
                            <i className="bi bi-exclamation-circle" aria-hidden="true" />
                            <span>{uploadError}</span>
                        </div>
                    )}

                    <div className={styles.imageUploadActions}>
                        <button
                            className={styles.imageChooseButton}
                            type="button"
                            disabled={isUploadingImage || disabled}
                            onClick={handleOpenImagePicker}
                        >
                            <i className="bi bi-image" aria-hidden="true" />
                            Choose image
                        </button>

                        <button
                            className={styles.insertCancelButton}
                            type="button"
                            disabled={isUploadingImage}
                            onClick={() => {
                                setShowImageInput(false);
                                setUploadError('');

                                if (imageInputRef.current) {
                                    imageInputRef.current.value = '';
                                }
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.editorBody}>
                <EditorContent editor={editor} className={styles.editorContent} />
            </div>

            <div className={styles.editorFooter}>
                <div className={styles.footerLeft}>
                    <span className={styles.statusIndicator}>
                        <span className={styles.statusDot} />
                        {disabled ? 'Read only' : 'Editing'}
                    </span>

                    <span className={styles.fieldBadge}>{field}</span>
                </div>

                <div className={styles.footerRight}>
                    {maxLength && characterCount > maxLength && (
                        <span className={styles.characterWarning}>Limit exceeded</span>
                    )}

                    {showCharacterCount && (
                        <span className={styles.characterCount}>
                            {characterCount.toLocaleString()}
                            {maxLength ? ` / ${maxLength.toLocaleString()}` : ''} characters
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
