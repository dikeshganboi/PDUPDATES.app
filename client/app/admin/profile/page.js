'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { FiCamera, FiSave } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import AdminGuard from '../../../components/admin/AdminGuard';
import api from '../../../lib/api';
import { uploadImageToCloudinary, validateImageFile } from '../../../lib/cloudinary';

const AdminProfilePage = () => {
  const { user, token, updateUser } = useAuth();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateImageFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setUploading(true);
      setUploadProgress(0);

      const url = await uploadImageToCloudinary(file, {
        folder: 'blog-app/avatars',
        onProgress: setUploadProgress,
      });

      setAvatar(url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
      setAvatarPreview(avatar);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setSaving(true);
      const res = await api.put(
        '/users/me',
        { name: name.trim(), bio: bio.trim(), avatar },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateUser({
        name: res.data.name,
        bio: res.data.bio,
        avatar: res.data.avatar,
      });

      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const initials = name
    ?.split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase() || 'A';

  return (
    <AdminGuard>
      <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        <h1 className="mb-1 text-2xl font-extrabold text-[#111827] md:text-3xl">My Profile</h1>
        <p className="mb-8 text-sm text-[#7B7F84]">Update your photo and bio — this appears on your blog posts.</p>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="relative">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt={name}
                  width={120}
                  height={120}
                  className="h-[120px] w-[120px] rounded-full border-4 border-[#3858F6]/20 object-cover"
                />
              ) : (
                <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full border-4 border-[#3858F6]/20 bg-[#3858F6] text-3xl font-bold text-white">
                  {initials}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#3858F6] text-white shadow-lg transition hover:bg-[#2a45c9] disabled:opacity-50"
              >
                <FiCamera size={16} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {uploading && (
              <div className="w-full max-w-xs">
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#3858F6] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-center text-xs text-[#7B7F84]">Uploading… {uploadProgress}%</p>
              </div>
            )}

            <p className="text-xs text-[#7B7F84]">JPG, PNG or WebP. Max 5MB.</p>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="profileName" className="mb-1.5 block text-sm font-bold text-[#111827]">
              Display Name
            </label>
            <input
              id="profileName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#111827] outline-none transition focus:border-[#3858F6] focus:ring-2 focus:ring-[#3858F6]/20"
              placeholder="Your name"
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="profileBio" className="mb-1.5 block text-sm font-bold text-[#111827]">
              Bio
            </label>
            <textarea
              id="profileBio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#3858F6] focus:ring-2 focus:ring-[#3858F6]/20"
              placeholder="Write a short bio about yourself — this will appear at the bottom of your blog posts."
            />
            <p className="mt-1 text-right text-xs text-[#7B7F84]">{bio.length}/500</p>
          </div>

          {/* Preview */}
          <div>
            <p className="mb-3 text-sm font-bold text-[#111827]">Preview — how it looks on blog posts</p>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt={name}
                  width={96}
                  height={96}
                  className="mx-auto h-24 w-24 rounded-full border-4 border-[#3858F6]/10 object-cover"
                />
              ) : (
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#3858F6]/10 bg-[#3858F6] text-2xl font-bold text-white">
                  {initials}
                </div>
              )}
              <h3 className="mt-4 text-lg font-extrabold text-[#111827]">{name || 'Your Name'}</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#7B7F84]">
                {bio || 'Your bio will appear here…'}
              </p>
            </div>
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3858F6] py-3.5 text-sm font-bold text-white transition hover:bg-black disabled:opacity-60"
          >
            <FiSave size={16} />
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>
    </AdminGuard>
  );
};

export default AdminProfilePage;
