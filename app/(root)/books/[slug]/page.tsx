import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, MicOff, Mic } from 'lucide-react';
import { getBookBySlug } from '@/lib/actions/book.actions';

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const { slug } = await params;
  const result = await getBookBySlug(slug);

  if (!result.success || !result.data) {
    redirect('/');
  }

  const book = result.data;

  return (
    <main className="book-page-container">
      {/* Floating back button */}
      <Link href="/" className="back-btn-floating" aria-label="Go back">
        <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
      </Link>

      <div className="max-w-4xl mx-auto flex flex-col gap-5">
        {/* Header Card */}
        <div className="vapi-header-card">
          {/* Book cover + mic button */}
          <div className="vapi-cover-wrapper">
            <Image
              src={book.coverURL}
              alt={`Cover of ${book.title}`}
              width={120}
              height={180}
              className="vapi-cover-image !w-[120px] !h-[180px]"
              priority
            />
            {/* Mic button overlapping cover bottom-right */}
            <div className="vapi-mic-wrapper">
              <button
                type="button"
                className="vapi-mic-btn vapi-mic-btn-inactive"
                aria-label="Start conversation"
                disabled
                aria-disabled="true"
              >
                <MicOff className="w-6 h-6 text-[var(--text-primary)]" />
              </button>
            </div>
          </div>

          {/* Book info + badges */}
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            <div>
              <h1
                className="book-title-lg !text-2xl sm:!text-[30px] leading-tight mb-1"
                style={{ fontFamily: "'IBM Plex Serif', serif" }}
              >
                {book.title}
              </h1>
              <p className="text-base text-[var(--text-secondary)] font-medium">
                by {book.author}
              </p>
            </div>

            {/* Pill badges row */}
            <div className="flex flex-wrap gap-2">
              {/* Status badge */}
              <div className="vapi-status-indicator">
                <span className="vapi-status-dot vapi-status-dot-ready" />
                <span className="vapi-status-text">Ready</span>
              </div>

              {/* Voice badge */}
              <div className="vapi-badge-ai border border-[var(--border-subtle)]">
  <span className="vapi-badge-ai-text capitalize">Voice: {book.persona}</span>
</div>

              {/* Timer badge */}
              <div className="vapi-badge-ai border border-[var(--border-subtle)]">
  <span className="vapi-badge-ai-text">0:00 / 15:00</span>
</div>
            </div>
          </div>
        </div>

        {/* Transcript area */}
        <div className="transcript-container vapi-transcript-wrapper">
          <div className="transcript-empty">
            <Mic
              className="w-12 h-12 text-[var(--text-secondary)] mb-4 opacity-40"
              strokeWidth={1.25}
            />
            <p className="transcript-empty-text">No conversation yet</p>
            <p className="transcript-empty-hint">
              Click the mic button above to start talking
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}