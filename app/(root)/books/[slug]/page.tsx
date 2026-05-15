import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, MicOff, Mic } from 'lucide-react';
import { getBookBySlug } from '@/lib/actions/book.actions';
import VapiControls from '@/components/VapiControls';

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/')  ;
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
      

        {/* Transcript area */}
        <VapiControls book={book}/>
      </div>
    </main>
  );
}