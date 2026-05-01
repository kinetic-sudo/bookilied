import BookCard from '@/components/BookCard'
import HomePageSection from '@/components/HomePageSection'
import { sampleBooks } from '@/lib/constant'

const Page = () => {
  return (
    <main>
      <HomePageSection />
      <div className="library-hero-grid">
        {sampleBooks.map((book) => (
          <BookCard />
        ))}
      </div>
    </main>

  )
}

export default Page