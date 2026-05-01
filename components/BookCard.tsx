import { BookCardProps } from '@/types'
import Link from 'next/link'
import React from 'react'

const BookCard = ({slug, title, coverURL, }: BookCardProps) => {
  return (
    <Link href={`/books/${slug}`}>BookCard</Link>
  )
}

export default BookCard