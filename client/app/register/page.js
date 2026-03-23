'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register(form);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F8F8] px-4 py-8">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-[0_0_20px_#cfcfcf]" style={{ borderBottom: '3px solid #3858F6' }}>
        <span className="inline-flex rounded-md bg-[#FF3D00] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
          Join PD Updates
        </span>
        <h1 className="mt-3 text-3xl font-extrabold text-[#111827]">Create Account</h1>
        <p className="mt-2 text-sm text-[#7B7F84]">Join the community and start engaging.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-bold text-[#334155]">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-gray-200 bg-[#F8F8F8] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#3858F6] focus:ring-2 focus:ring-[#3858F6]/20"
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-[#334155]">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-gray-200 bg-[#F8F8F8] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#3858F6] focus:ring-2 focus:ring-[#3858F6]/20"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-[#334155]">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border-2 border-gray-200 bg-[#F8F8F8] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#3858F6] focus:ring-2 focus:ring-[#3858F6]/20"
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full py-3"
          >
            {submitting ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        <p className="mt-4 text-sm text-[#7B7F84]">
          Already have an account?{' '}
          <Link className="font-bold text-[#3858F6] hover:underline" href="/login">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
