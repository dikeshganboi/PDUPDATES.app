'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { uploadImageToCloudinary } from '../../lib/cloudinary';
import { cleanEditorHtml, stripHtml } from '../../utils/editorHtml';
import Button from '../ui/Button';

const TiptapEditor = dynamic(() => import('./TiptapEditor'), {
  ssr: false,
  loading: () => <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#7B7F84]">Loading editor...</div>,
});

const CATEGORIES = ['Tech', 'Jobs', 'Guides'];

const defaultState = {
  title: '',
  category: [],
  tags: '',
  image: '',
  content: '',
};

const AdminBlogForm = ({
  mode = 'create',
  initialValues,
  submitting,
  onSubmit,
}) => {
  const mergedInitialValues = useMemo(
    () => ({ ...defaultState, ...(initialValues || {}) }),
    [initialValues]
  );

  const [form, setForm] = useState(mergedInitialValues);
  const [coverUploading, setCoverUploading] = useState(false);
  const [editorImageUploading, setEditorImageUploading] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [editorImageProgress, setEditorImageProgress] = useState(0);
  const [localImagePreview, setLocalImagePreview] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  useEffect(() => {
    setForm(mergedInitialValues);
  }, [mergedInitialValues]);

  useEffect(() => {
    return () => {
      if (localImagePreview) {
        URL.revokeObjectURL(localImagePreview);
      }
    };
  }, [localImagePreview]);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setLocalImagePreview(localUrl);

    try {
      setCoverUploading(true);
      setCoverUploadProgress(0);
      const url = await uploadImageToCloudinary(file, {
        folder: 'blog-app/covers',
        onProgress: setCoverUploadProgress,
      });
      updateField('image', url);
      toast.success('Cover image uploaded');
    } catch (error) {
      toast.error(error.message || 'Image upload failed');
    } finally {
      setCoverUploading(false);
      setTimeout(() => setCoverUploadProgress(0), 800);
    }
  };

  const handleEditorImageUpload = async (file) => {
    try {
      setEditorImageUploading(true);
      setEditorImageProgress(0);
      const url = await uploadImageToCloudinary(file, {
        folder: 'blog-app/editor',
        onProgress: setEditorImageProgress,
      });
      toast.success('Inline image uploaded');
      return url;
    } catch (error) {
      toast.error(error.message || 'Failed to upload inline image');
      return null;
    } finally {
      setEditorImageUploading(false);
      setTimeout(() => setEditorImageProgress(0), 800);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.category.length || !stripHtml(form.content)) {
      toast.error('Title, at least one category, and content are required');
      return;
    }

    const payload = {
      title: form.title.trim(),
      category: form.category,
      tags: form.tags,
      image: form.image,
      content: cleanEditorHtml(form.content),
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-white p-6 shadow-[0_0_4px_#cfcfcf] md:p-7">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-bold text-[#334155]">Title</span>
          <input
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            className="input-premium"
            placeholder="Enter blog title"
            required
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-bold text-[#334155]">Categories (up to 3)</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {CATEGORIES.map((cat) => {
              const checked = form.category.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    if (checked) {
                      updateField('category', form.category.filter((c) => c !== cat));
                    } else if (form.category.length < 3) {
                      updateField('category', [...form.category, cat]);
                    } else {
                      toast.error('Maximum 3 categories allowed');
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-3.5 py-2 text-sm font-semibold transition ${
                    checked
                      ? 'border-[#3858F6] bg-[#3858F6]/10 text-[#3858F6]'
                      : 'border-gray-200 bg-white text-[#334155] hover:border-gray-300'
                  }`}
                >
                  {cat}
                  {checked && (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="input-premium flex-1"
              placeholder="Add custom category"
              disabled={form.category.length >= 3}
            />
            <button
              type="button"
              onClick={() => {
                const trimmed = customCategory.trim();
                if (!trimmed) return;
                if (form.category.length >= 3) {
                  toast.error('Maximum 3 categories allowed');
                  return;
                }
                if (form.category.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
                  toast.error('Category already added');
                  return;
                }
                updateField('category', [...form.category, trimmed]);
                setCustomCategory('');
              }}
              disabled={form.category.length >= 3}
              className="rounded-lg bg-[#3858F6] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#2a4ad0] disabled:opacity-50"
            >
              Add
            </button>
          </div>
          {form.category.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.category.map((cat) => (
                <span key={cat} className="inline-flex items-center gap-1.5 rounded-full bg-[#3858F6] px-3 py-1 text-xs font-bold text-white">
                  {cat}
                  <button
                    type="button"
                    onClick={() => updateField('category', form.category.filter((c) => c !== cat))}
                    className="hover:text-red-200"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </label>
      </div>

      <label className="space-y-1 block">
        <span className="text-sm font-bold text-[#334155]">Tags (comma separated)</span>
        <input
          value={form.tags}
          onChange={(event) => updateField('tags', event.target.value)}
          className="input-premium"
          placeholder="nextjs, career, backend"
        />
      </label>

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <label className="space-y-1 block">
          <span className="text-sm font-bold text-[#334155]">Image URL</span>
          <input
            value={form.image}
            onChange={(event) => updateField('image', event.target.value)}
            className="input-premium"
            placeholder="https://..."
          />
        </label>

        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border-2 border-gray-200 bg-[#F8F8F8] px-4 py-2.5 text-sm font-bold text-[#334155] transition hover:border-[#3858F6] hover:bg-white">
          {coverUploading ? `Uploading ${coverUploadProgress}%` : 'Upload Image'}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={coverUploading} />
        </label>
      </div>

      {(localImagePreview || form.image) && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#F8F8F8]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={localImagePreview || form.image}
            alt="Selected preview"
            className="h-44 w-full object-cover"
          />
        </div>
      )}

      <div className="space-y-1">
        <span className="text-sm font-bold text-[#334155]">Content</span>
        <TiptapEditor
          value={form.content}
          onChange={(nextContent) => updateField('content', nextContent)}
          onImageUpload={handleEditorImageUpload}
          uploading={editorImageUploading}
          progress={editorImageProgress}
        />
      </div>

      <Button
        type="submit"
        disabled={submitting || coverUploading || editorImageUploading}
        className="w-fit px-5"
      >
        {submitting ? 'Saving...' : mode === 'create' ? 'Publish Blog' : 'Update Blog'}
      </Button>
    </form>
  );
};

export default AdminBlogForm;
