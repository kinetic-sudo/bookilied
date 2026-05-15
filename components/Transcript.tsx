'use client'
import React, { useEffect, useRef } from 'react'
import { Mic } from 'lucide-react'
import { Messages } from '@/types'

interface TranscriptProps {
  messages: Messages[]
  currentMessage?: string       // streaming AI text
  currentUserMessage?: string   // streaming user text
}

const Transcript = ({ messages, currentMessage, currentUserMessage }: TranscriptProps) => {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom whenever messages or streaming content change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentMessage, currentUserMessage])

  const isEmpty =
    messages.length === 0 && !currentMessage && !currentUserMessage

  return (
    <div className="transcript-container">
      {isEmpty ? (
        /* ── Empty state ── */
        <div className="transcript-empty">
          <Mic
            className="w-12 h-12 text-[var(--text-secondary)] mb-4 opacity-40"
            strokeWidth={1.25}
          />
          <p className="transcript-empty-text">No conversation yet</p>
          <p className="transcript-empty-hint">
            Click the mic button above to start talking
          </p>
        </div>
      ) : (
        /* ── Message list ── */
        <div className="transcript-messages">
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user'
            return (
              <div
                key={i}
                className={`transcript-message ${
                  isUser
                    ? 'transcript-message-user'
                    : 'transcript-message-assistant'
                }`}
              >
                <div
                  className={`transcript-bubble ${
                    isUser
                      ? 'transcript-bubble-user'
                      : 'transcript-bubble-assistant'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            )
          })}

          {/* Streaming user message */}
          {currentUserMessage && (
            <div className="transcript-message transcript-message-user">
              <div className="transcript-bubble transcript-bubble-user">
                {currentUserMessage}
                <span className="transcript-cursor" aria-hidden="true" />
              </div>
            </div>
          )}

          {/* Streaming AI message */}
          {currentMessage && (
            <div className="transcript-message transcript-message-assistant">
              <div className="transcript-bubble transcript-bubble-assistant">
                {currentMessage}
                <span className="transcript-cursor" aria-hidden="true" />
              </div>
            </div>
          )}

          {/* Anchor for auto-scroll */}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}

export default Transcript