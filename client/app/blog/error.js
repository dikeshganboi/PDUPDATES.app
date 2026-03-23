'use client';

export default function BlogListingError({ error, reset }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center md:px-6">
      <h2 className="text-2xl font-bold text-ink">Failed to load blogs</h2>
      <p className="mt-2 text-ink/70">{error?.message || 'Please try again in a moment.'}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream hover:bg-coral"
      >
        Retry
      </button>
    </div>
  );
}
