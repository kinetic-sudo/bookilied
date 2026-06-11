'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface BookSearchProps {
  defaultValue: string
}

const BookSearch = ({ defaultValue }: BookSearchProps) => {
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const params = new URLSearchParams()

    if (value.trim()) {
      params.set('search', value)
    }

    // Replace so back button doesn't cycle through every keystroke
    router.replace(`${pathname}${params.toString() ? `?${params}` : ''}`)
  }

  const handleClear = () => {
    router.replace(pathname)
  }

  return (
    <div className="library-search-wrapper">
      <Search className="w-4 h-4 ml-3 text-[var(--text-muted)] shrink-0" />
      <input
        type="text"
        placeholder="Search by title or author..."
        defaultValue={defaultValue}
        onChange={handleChange}
        className="library-search-input text-sm"
      />
      {defaultValue && (
        <button
          onClick={handleClear}
          className="mr-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default BookSearch