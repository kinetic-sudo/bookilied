import BookCard from '@/components/BookCard'
import HomePageSection from '@/components/HomePageSection'
import { sampleBooks } from '@/lib/constant'

const Page = () => {
  return (
    <main className='wrapper'>
      <HomePageSection />
      <div className="library-books-grid mb-10">
        {sampleBooks.map((book) => (
          <BookCard key={book._id} title={book.title} author={book.author} coverURL={book.coverURL}
           slug={book.slug}/>
        ))}
      </div>
    </main>

  )
}

export default Page