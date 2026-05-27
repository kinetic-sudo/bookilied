import BookCard from '@/components/BookCard'
import HomePageSection from '@/components/HomePageSection'
import { getAllBooks } from '@/lib/actions/book.actions'
import { sampleBooks } from '@/lib/constant'


const Page = async () => {
  const bookResults = await getAllBooks()
  const books =  bookResults.success ? bookResults.data ?? [] : []
  return (
    <main className='wrapper'>
      <HomePageSection />
      <div className="library-books-grid mb-10">
        {books.map((book) => (
          <BookCard key={book._id} title={book.title} author={book.author} coverURL={book.coverURL}
           slug={book.slug}/>
        ))}
      </div>
    </main>

  )
}

export default Page