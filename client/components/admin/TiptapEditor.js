'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

const ActionButton = ({ onClick, active, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
      active ? 'bg-coral text-white' : 'bg-white text-ink hover:bg-soft'
    }`}
  >
    {label}
  </button>
);

const TiptapEditor = ({ value, onChange, onImageUpload, uploading, progress }) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ['http', 'https'],
      }),
      Image.configure({ inline: false }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'tiptap min-h-[220px] px-4 py-3 text-sm text-ink outline-none',
      },
    },
    onUpdate: ({ editor: activeEditor }) => {
      onChange(activeEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl || 'https://');

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertImage = async () => {
    if (!editor) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const imageUrl = await onImageUpload(file);
      if (!imageUrl) return;

      editor.chain().focus().setImage({ src: imageUrl, alt: 'Embedded image' }).run();
    };

    input.click();
  };

  if (!editor) {
    return <div className="px-4 py-3 text-sm text-ink/70">Loading editor...</div>;
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-white">
      <div className="flex flex-wrap gap-2 border-b border-amber-100 bg-soft px-3 py-2">
        <ActionButton
          label="H1"
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <ActionButton
          label="H2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ActionButton
          label="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ActionButton
          label="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ActionButton
          label="Underline"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ActionButton
          label="Bullet"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ActionButton
          label="Numbered"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ActionButton
          label="Link"
          active={editor.isActive('link')}
          onClick={setLink}
        />
        <ActionButton
          label="Code"
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <ActionButton label="Image" active={false} onClick={insertImage} />
      </div>

      <EditorContent editor={editor} />

      {uploading && (
        <div className="border-t border-amber-100 px-4 py-2 text-xs text-ink/70">
          Uploading image... {progress}%
        </div>
      )}
    </div>
  );
};

export default TiptapEditor;
