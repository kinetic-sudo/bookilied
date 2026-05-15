'use client'
import React from 'react'
import { Mic, MicOff } from 'lucide-react'
import Image from 'next/image'
import useVapi from '@/hooks/useVapi'
import { IBook } from '@/types'
import Transcript from '@/components/Transcript'

type BookProps = Pick<IBook, '_id' | 'title' | 'author' | 'coverURL' | 'persona' | 'slug' | 'fileURL' | 'totalSegments'>


const VapiControls = ({ book }: { book: BookProps }) => {
  const {
    status,
    isActive,
    messages,
    currentMessage,
    currentUserMessage,
    duration,
    start,
    stop,
    clearError,
  } = useVapi(book)

  /* ── Status dot class ── */
  const dotClass = `vapi-status-dot vapi-status-dot-${status === 'idle' ? 'ready' : status}`

  /* ── Status label ── */
  const statusLabel =
    status === 'idle'
      ? 'Ready'
      : status.charAt(0).toUpperCase() + status.slice(1)

  /* ── Duration formatting (mm:ss / 15:00) ── */
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <>
      {/* ── Header card ── */}
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

          {/* Mic toggle button */}
          <div className="vapi-mic-wrapper">
            {isActive && (
              <span className="vapi-pulse-ring" aria-hidden="true" />
            )}
            <button
              type="button"
              onClick={isActive ? stop : start}
              disabled={status === 'connecting'}
              className={`vapi-mic-btn ${
                isActive ? 'vapi-mic-btn-active' : 'vapi-mic-btn-inactive'
              }`}
              aria-label={isActive ? 'Stop conversation' : 'Start conversation'}
            >
                {isActive ? (
                    <Mic className='size-7 text-white' />
                ): (
                    <MicOff className='size-7 text-[#212a3b]' />
                )}
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

          {/* Pill badges */}
          <div className="flex flex-wrap gap-2">
            {/* Status */}
            <div className="vapi-status-indicator">
              <span className={dotClass} />
              <span className="vapi-status-text">{statusLabel}</span>
            </div>

            {/* Voice */}
            <div className="vapi-badge-ai border border-[var(--border-subtle)]">
              <span className="vapi-badge-ai-text capitalize">
                Voice: {book.persona}
              </span>
            </div>

            {/* Timer */}
            <div className="vapi-badge-ai border border-[var(--border-subtle)]">
              <span className="vapi-badge-ai-text">
                {formatTime(duration)} / 15:00
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Transcript area ── */}
      <div className="vapi-transcript-wrapper">
        <Transcript
          messages={messages}
          currentMessage={currentMessage}
          currentUserMessage={currentUserMessage}
        />
      </div>
    </>
  )
}

export default VapiControls