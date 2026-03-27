'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const badgeColors = [
  'bg-[#FF3385] text-white',
  'bg-[#FFAF25] text-white',
  'bg-[#2A67F7] text-white',
  'bg-[#FF3D00] text-white',
];

const ArrowButton = ({ direction, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={direction === 'next' ? 'Next slide' : 'Previous slide'}
    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition hover:bg-[#3858F6]"
  >
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {direction === 'next' ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
      )}
    </svg>
  </button>
);

const AuthorAvatar = ({ author }) => {
  if (author?.avatar) {
    return (
      <Image
        src={author.avatar}
        alt={author.name || 'Author'}
        width={44}
        height={44}
        className="h-11 w-11 rounded-full border border-white/15 object-cover"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3858F6] text-sm font-bold text-white">
      {(author?.name || 'A')[0].toUpperCase()}
    </div>
  );
};

export default function HeroCarousel({ slides = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  if (!slides.length) return null;

  const goTo = (index) => setActiveIndex(index);
  const goPrevious = () => setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  const goNext = () => setActiveIndex((current) => (current + 1) % slides.length);

  return (
    <section className="container-shell pt-6 md:pt-8">
      <div className="relative overflow-hidden rounded-[28px] bg-[#0f172a] shadow-[0_18px_60px_rgba(15,23,42,0.22)]">
        <div className="relative min-h-[500px] md:min-h-[580px]">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={slide._id || slide.slug || index}
                className={`absolute inset-0 transition-all duration-700 ease-out ${
                  isActive
                    ? 'pointer-events-auto translate-x-0 opacity-100'
                    : index < activeIndex
                      ? 'pointer-events-none -translate-x-8 opacity-0'
                      : 'pointer-events-none translate-x-8 opacity-0'
                }`}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.62)_38%,rgba(0,0,0,0.24)_68%,rgba(0,0,0,0.08)_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0)_35%,rgba(0,0,0,0.5)_100%)]" />
              </div>
            );
          })}

          <div className="absolute inset-0 flex">
            <div className="flex w-full items-end lg:items-stretch">
              <div className="flex w-full flex-col justify-end p-5 sm:p-8 lg:w-[64%] lg:p-10 xl:p-12">
                <div className="max-w-2xl rounded-[26px] border border-white/12 bg-black/28 p-5 backdrop-blur-md sm:p-6 lg:bg-transparent lg:p-0 lg:backdrop-blur-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {slides[activeIndex].categories.map((category, index) => (
                      <Link
                        key={`${slides[activeIndex].slug}-${category}`}
                        href={`/blog?category=${encodeURIComponent(category)}`}
                        className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] transition hover:opacity-85 ${badgeColors[index % badgeColors.length]}`}
                      >
                        {category}
                      </Link>
                    ))}
                    <span className="flex items-center gap-1 text-xs font-medium text-white/70">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {slides[activeIndex].readTime} min read
                    </span>
                  </div>

                  <h1 className="mt-4 max-w-2xl text-3xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-[56px]">
                    <Link href={`/blog/${slides[activeIndex].slug}`} className="transition hover:text-[#8ca1ff]">
                      {slides[activeIndex].title}
                    </Link>
                  </h1>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/78 sm:text-[15px] lg:text-base">
                    {slides[activeIndex].excerpt}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-4 text-white/82">
                    <div className="flex items-center gap-3">
                      <AuthorAvatar author={slides[activeIndex].author} />
                      <div>
                        <div className="text-sm font-semibold text-white">{slides[activeIndex].author?.name || 'Admin'}</div>
                        <div className="text-xs text-white/60">{slides[activeIndex].publishedAt}</div>
                      </div>
                    </div>
                    <div className="hidden h-8 w-px bg-white/15 sm:block" />
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70">
                      <span className="inline-flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        {slides[activeIndex].views} views
                      </span>
                    </div>
                  </div>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <Link href={`/blog/${slides[activeIndex].slug}`} className="inline-flex items-center rounded-full bg-[#3858F6] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_30px_rgba(56,88,246,0.35)] transition hover:bg-white hover:text-[#111827]">
                      Read article
                    </Link>
                    <Link href="/blog" className="inline-flex items-center rounded-full border border-white/18 bg-white/8 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/14">
                      Browse all posts
                    </Link>
                  </div>
                </div>
              </div>

              <div className="hidden w-[36%] flex-col justify-between border-l border-white/10 bg-black/18 p-6 backdrop-blur-sm lg:flex xl:p-7">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Featured stories</p>
                    <div className="flex items-center gap-2">
                      <ArrowButton direction="previous" onClick={goPrevious} />
                      <ArrowButton direction="next" onClick={goNext} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {slides.map((slide, index) => {
                      const isActive = index === activeIndex;

                      return (
                        <button
                          key={`${slide.slug}-preview`}
                          type="button"
                          onClick={() => goTo(index)}
                          className={`flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition ${
                            isActive
                              ? 'border-white/25 bg-white/14 shadow-[0_10px_25px_rgba(0,0,0,0.18)]'
                              : 'border-white/8 bg-white/6 hover:bg-white/10'
                          }`}
                        >
                          <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-white/10">
                            <Image src={slide.image} alt={slide.title} fill sizes="96px" className="object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-bold leading-snug text-white">{slide.title}</p>
                            <p className="mt-2 text-xs text-white/55">{slide.publishedAt}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs text-white/60">
                  <span className="font-semibold text-white">{String(activeIndex + 1).padStart(2, '0')}</span>
                  <span>/</span>
                  <span>{String(slides.length).padStart(2, '0')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 lg:hidden sm:left-8 sm:right-8">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/28 px-3 py-2 backdrop-blur-md">
              {slides.map((slide, index) => (
                <button
                  key={`${slide.slug}-dot`}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => goTo(index)}
                  className={`h-2.5 rounded-full transition-all ${index === activeIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/45'}`}
                />
              ))}
            </div>
            {slides.length > 1 && (
              <div className="flex items-center gap-2">
                <ArrowButton direction="previous" onClick={goPrevious} />
                <ArrowButton direction="next" onClick={goNext} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}