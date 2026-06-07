'use client'
import React from 'react'
import { Mic, MicOff } from 'lucide-react'
import Image from 'next/image'
import useVapi from '@/hooks/useVapi'
import { IBook } from '@/types'
import Transcript from '@/components/Transcript'

const VapiControls = ({ book }: { book: IBook }) => {
  const {
    status,
    isActive,
    messages,
    currentMessage,
    currentUserMessage,
    duration,
    maxDurationSeconds,
    limitError,
    start,
    stop,
    clearError,
  } = useVapi(book)

  const dotClass = `vapi-status-dot vapi-status-dot-${status === 'idle' ? 'ready' : status}`

  const statusLabel =
    status === 'idle'
      ? 'Ready'
      : status.charAt(0).toUpperCase() + status.slice(1)

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  // Warn user when 1 minute remaining
  const remaining = maxDurationSeconds - duration
  const isNearLimit = isActive && remaining <= 60 && remaining > 0

  return (
    <>
      {/* ── Limit / billing error banner ── */}
      {limitError && (
        <div className="warning-banner">
          <div className="warning-banner-content">
            <span className="warning-banner-text">{limitError}</span>
            <button onClick={clearError} className="ml-auto text-sm underline">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Header card ── */}
      <div className="vapi-header-card">
        <div className="vapi-cover-wrapper">
          <Image
            src={book.coverURL}
            alt={`Cover of ${book.title}`}
            width={120}
            height={180}
            className="vapi-cover-image !w-[120px] !h-[180px]"
            priority
          />

          <div className="vapi-mic-wrapper">
            {isActive && <span className="vapi-pulse-ring" aria-hidden="true" />}
            <button
              type="button"
              onClick={isActive ? stop : start}
              disabled={status === 'connecting'}
              className={`vapi-mic-btn shadow-md !w-[60px] !h-[60px] z-10 ${
                isActive ? 'vapi-mic-btn-active' : 'vapi-mic-btn-inactive'
              }`}
              aria-label={isActive ? 'Stop conversation' : 'Start conversation'}
            >
              {isActive
                ? <Mic className="size-7 text-black" />
                : <MicOff className="size-7 text-[#212a3b]" />
              }
            </button>
          </div>
        </div>

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

            {/* Timer — turns red when near limit */}
            <div className={`vapi-badge-ai border ${isNearLimit ? 'border-red-400 bg-red-50' : 'border-[var(--border-subtle)]'}`}>
              <span className={`vapi-badge-ai-text ${isNearLimit ? 'text-red-600' : ''}`}>
                {formatTime(duration)} / {formatTime(maxDurationSeconds)}
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