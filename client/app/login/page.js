'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = await signIn({ email, password });
      if (data.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-[#7B7F84]">Loading...</div>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F8F8] px-4 py-8">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-[0_0_20px_#cfcfcf]" style={{ borderBottom: '3px solid #3858F6' }}>
        <span className="inline-flex rounded-md bg-[#3858F6] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
          Welcome Back
        </span>
        <h1 className="mt-3 text-3xl font-extrabold text-[#111827]">Sign In</h1>
        <p className="mt-2 text-sm text-[#7B7F84]">Sign in to your account to continue.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-bold text-[#334155]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 bg-[#F8F8F8] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#3858F6] focus:ring-2 focus:ring-[#3858F6]/20"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-[#334155]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 bg-[#F8F8F8] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#3858F6] focus:ring-2 focus:ring-[#3858F6]/20"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full py-3"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-4 text-sm text-[#7B7F84]">
          Need an account?{' '}
          <Link className="font-bold text-[#3858F6] hover:underline" href="/register">
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}
