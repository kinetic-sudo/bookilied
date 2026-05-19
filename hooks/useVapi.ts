import { useState, useRef, useEffect } from "react";
import { IBook, Messages } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { ASSISTANT_ID, DEFAULT_VOICE, VOICE_SETTINGS } from "@/lib/constant";
import { startVoicesession } from "@/lib/actions/session.action";
import Vapi from '@vapi-ai/web'
import { getVoice } from "@/lib/utils";

export type CallStatus = 'idle' | 'connecting' | 'starting' | 'thinking' | 'speaking' | 'listening'

const useLatestRef = <T>(value: T) => {
    const ref = useRef(value)
    useEffect(() => {
        ref.current = value
    });
    return ref
}

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY

let vapi: InstanceType<typeof Vapi>

function getVapi() {
    if (!vapi) {
        if (!VAPI_API_KEY) {
            throw new Error('NEXT_PUBLIC_VAPI_API_KEY not found. Please set it in the .env file.')
        }
        vapi = new Vapi(VAPI_API_KEY)
    }
    return vapi;
}

export const useVapi = (book: IBook) => {
    const { userId } = useAuth()

    const [status, setStatus] = useState<CallStatus>('idle')
    const [messages, setMessages] = useState<Messages[]>([])
    const [currentMessage, setCurrentMessage] = useState('')
    const [currentUserMessage, setCurrentUserMessage] = useState('')
    const [duration, setDuration] = useState(0)
    const [limitError, setLimitError] = useState<string | null>(null)

    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const sessionIdRef = useRef<string | null>(null)
    const isStoppingRef = useRef<boolean>(false)

    const bookRef = useLatestRef(book);
    const durationRef = useLatestRef(duration)
    const voice = book.persona || DEFAULT_VOICE

    const isActive = status === 'listening' || status === 'thinking' || status === 'speaking' || status === 'starting'

    // ── Vapi event listeners ──────────────────────────────────────────────────
    useEffect(() => {
        const v = getVapi()

        // Call lifecycle
        v.on('call-start', () => {
            setStatus('listening')
            // Start duration timer
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1)
            }, 1000)
        })

        v.on('call-end', () => {
            setStatus('idle')
            setCurrentMessage('')
            setCurrentUserMessage('')
            // Stop duration timer
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        })

        // Speech state — who is talking
        v.on('speech-start', () => {
            setStatus('speaking') // AI is speaking
        })

        v.on('speech-end', () => {
            setStatus('listening') // waiting for user
        })

        // Transcripts — partial (streaming) and final (committed)
        v.on('message', (msg: any) => {
            if (msg.type !== 'transcript') return

            const isAssistant = msg.role === 'assistant'

            if (msg.transcriptType === 'partial') {
                // Stream the text live into the current bubble
                if (isAssistant) setCurrentMessage(msg.transcript)
                else setCurrentUserMessage(msg.transcript)
            } else if (msg.transcriptType === 'final') {
                // Commit to the messages list and clear the streaming bubble
                setMessages(prev => [...prev, { role: msg.role, content: msg.transcript }])
                if (isAssistant) setCurrentMessage('')
                else setCurrentUserMessage('')
            }
        })

        // Error handling
        v.on('error', (e: any) => {
            console.error('Vapi error', e)
            setStatus('idle')
            setLimitError('Call error. Please try again.')
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        })

        return () => {
            v.removeAllListeners()
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [])

    // ── Actions ───────────────────────────────────────────────────────────────
    const start = async () => {
        if (!userId) return setLimitError('Please login to start a conversation')
        setLimitError(null)
        setStatus('connecting')
        setDuration(0)
        setMessages([])

        try {
            const result = await startVoicesession(userId, book._id)

            if (!result.success) {
                setLimitError(result.error || 'Session limit reached. Please upgrade your plan.')
                setStatus('idle')
                return
            }

            sessionIdRef.current = result.sessionId || null

            const firstMessage = `hey, good to meet you. Quick question, before we dive in: have you actually read ${book.title} yet? Or are we starting fresh`

            await getVapi().start(ASSISTANT_ID, {
                firstMessage,
                variableValues: {
                    title: book.title,
                    author: book.author,
                    bookId: book._id,
                },
                voice: {
                    provider: '11labs',
                    voiceId: getVoice(voice).id,
                    model: 'eleven_turbo_v2_5' as const,
                    stability: VOICE_SETTINGS.stability,
                    similarityBoost: VOICE_SETTINGS.similarityBoost,
                    style: VOICE_SETTINGS.style,
                    useSpeakerBoost: VOICE_SETTINGS.useSpeakerBoost,
                },
            })

        } catch (e) {
            console.error('Error starting call', e)
            setStatus('idle')
            setLimitError('An error occurred while starting the call.')
        }
    }

    const stop = async () => {
        isStoppingRef.current = true
        getVapi().stop()
        isStoppingRef.current = false
    }

    const clearError = () => setLimitError(null)

    return {
        status,
        isActive,
        messages,
        currentMessage,
        currentUserMessage,
        duration,
        limitError,
        start,
        stop,
        clearError,
    }
}

export default useVapi