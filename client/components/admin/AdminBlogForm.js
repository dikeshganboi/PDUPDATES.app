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

const defaultState = {
  title: '',
  category: '',
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

    if (!form.title.trim() || !form.category.trim() || !stripHtml(form.content)) {
      toast.error('Title, category, and content are required');
      return;
    }

    const payload = {
      title: form.title.trim(),
      category: form.category.trim(),
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
          <span className="text-sm font-bold text-[#334155]">Category</span>
          <input
            value={form.category}
            onChange={(event) => updateField('category', event.target.value)}
            className="input-premium"
            placeholder="Tech, Jobs, Guide"
            required
          />
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
