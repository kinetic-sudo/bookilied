import BookCard from '@/components/BookCard'
import HomePageSection from '@/components/HomePageSection'
import BookSearch from '@/components/BookSearch'
import { getAllBooks } from '@/lib/actions/book.actions'

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ search?: string }>
}

const Page = async ({ searchParams }: PageProps) => {
  const { search } = await searchParams
  const bookResults = await getAllBooks(search)
  const books = bookResults.success ? bookResults.data ?? [] : []

  return (
    <main className='wrapper'>
      <HomePageSection />

      {/* ── Section header with search ── */}
      <div className="library-filter-bar">
        <h2 className="section-title">Recent Books</h2>
        <BookSearch defaultValue={search ?? ''} />
      </div>

      {books.length === 0 ? (
        <div className="library-empty-card text-center">
          <p className="text-[var(--text-primary)] font-semibold text-lg mb-1">No books found</p>
          <p className="text-[var(--text-secondary)] text-sm">
            {search ? `No results for "${search}"` : 'Upload your first book to get started.'}
          </p>
        </div>
      ) : (
        <div className="library-books-grid mb-10">
          {books.map((book) => (
            <BookCard
              key={book._id}
              title={book.title}
              author={book.author}
              coverURL={book.coverURL}
              slug={book.slug}
            />
          ))}
        </div>
      )}
    </main>
  )
}

export default Page