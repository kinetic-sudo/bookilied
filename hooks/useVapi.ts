import { useState, useRef, useEffect } from "react";
import { IBook, Messages } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { ASSISTANT_ID, DEFAULT_VOICE, VOICE_SETTINGS } from "@/lib/constant";
import { endVoiceSession, startVoiceSession } from "@/lib/actions/session.action"
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
    const [currentMessage, setCurrentMessage] = useState('')        // streaming assistant text
    const [currentUserMessage, setCurrentUserMessage] = useState('') // streaming user text
    const [duration, setDuration] = useState(0)
    const [limitError, setLimitError] = useState<string | null>(null)

    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const sessionIdRef = useRef<string | null>(null)
    const isStoppingRef = useRef<boolean>(false)

    // Track last committed content per role to deduplicate finals
    const lastCommittedRef = useRef<{ user: string; assistant: string }>({
        user: '',
        assistant: '',
    })

    const bookRef = useLatestRef(book)
    const durationRef = useLatestRef(duration)
    const voice = book.persona || DEFAULT_VOICE

    const isActive =
        status === 'listening' ||
        status === 'thinking'  ||
        status === 'speaking'  ||
        status === 'starting'

    // ── Vapi event listeners ──────────────────────────────────────────────────
    useEffect(() => {
        const v = getVapi()

        // ── Call lifecycle ──
        v.on('call-start', () => {
            setStatus('listening')
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1)
            }, 1000)
        })

        v.on('call-end', () => {
            setStatus('idle')
            setCurrentMessage('')
            setCurrentUserMessage('')
            lastCommittedRef.current = { user: '', assistant: '' }
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        })

        // ── Speech state ──
        v.on('speech-start', () => setStatus('speaking'))
        v.on('speech-end',   () => setStatus('listening'))

        // ── Message / transcript events ──
        v.on('message', (msg: any) => {
            if (msg.type !== 'transcript') return

            const { role, transcriptType, transcript } = msg

            // 1. User partial — update live streaming bubble
            if (role === 'user' && transcriptType === 'partial') {
                setCurrentUserMessage(transcript)
                return
            }

            // 2. User final — commit to messages, clear bubble, set thinking
            if (role === 'user' && transcriptType === 'final') {
                const content = transcript.trim()
                setCurrentUserMessage('')
                setStatus('thinking')

                if (!content || content === lastCommittedRef.current.user) return
                lastCommittedRef.current.user = content

                setMessages(prev => {
                    const last = prev.findLast(m => m.role === 'user')
                    if (last?.content === content) return prev
                    return [...prev, { role: 'user', content }]
                })
                return
            }

            // 3. Assistant partial — update live streaming bubble, mark as speaking
            if (role === 'assistant' && transcriptType === 'partial') {
                setCurrentMessage(transcript)
                setStatus('speaking')
                return
            }

            // 4. Assistant final — commit to messages, clear bubble, back to listening
            if (role === 'assistant' && transcriptType === 'final') {
                const content = transcript.trim()
                setCurrentMessage('')
                setStatus('listening')

                if (!content || content === lastCommittedRef.current.assistant) return
                lastCommittedRef.current.assistant = content

                setMessages(prev => {
                    const last = prev.findLast(m => m.role === 'assistant')
                    if (last?.content === content) return prev
                    return [...prev, { role: 'assistant', content }]
                })
            }
        })

        // ── Error handling ──
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
        setCurrentMessage('')
        setCurrentUserMessage('')
        lastCommittedRef.current = { user: '', assistant: '' }

        try {
            const result = await startVoiceSession(userId, book._id)

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

        } catch (err) {
            console.error('Error starting call', err)
            if(sessionIdRef.current) {
                endVoiceSession(sessionIdRef.current, 0).catch((endErr) => 
                    console.log('Failed to rollback voice session after start failure', err)
                
            )
                sessionIdRef.current = null;
            }
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