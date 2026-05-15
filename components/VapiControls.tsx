'use client'
import React from 'react'
import { Mic } from 'lucide-react'
import useVapi from '@/hooks/useVapi'
import { IBook } from '@/types'

const VapiControls = ({ book } : {book: IBook}) => {
    const { status, isActive, messages, currentMessage, currentUserMessage, duration, start, stop, clearError, } = useVapi(book)
  return (
    <div className="transcript-container vapi-transcript-wrapper">
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
        </div>
  )
}

export default VapiControls