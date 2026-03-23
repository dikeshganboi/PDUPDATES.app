'use client';

export default function BlogDetailError({ error, reset }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center md:px-6">
      <h2 className="text-2xl font-bold text-ink">Failed to load this blog</h2>
      <p className="mt-2 text-ink/70">{error?.message || 'Something went wrong while loading the article.'}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream hover:bg-coral"
      >
        Try Again
      </button>
    </div>
  );
}
