import BookCard from '@/components/BookCard'
import HomePageSection from '@/components/HomePageSection'
import { sampleBooks } from '@/lib/constant'

const Page = () => {
  return (
    <main>
      <HomePageSection />
      <div className="library-hero-grid">
        {sampleBooks.map((book) => (
          <BookCard key={book._id} title={book.title} author={book.author} coverUrl={book.coverURL}
           slug={book.slug}/>
        ))}
      </div>
    </main>

  )
}

export default Page