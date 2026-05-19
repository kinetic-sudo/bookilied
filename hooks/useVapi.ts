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
    if(!vapi) {
        if(!VAPI_API_KEY) {
            throw new Error('NEXT_PUBLIC_VAPI_API_KEY, not found. Please set it in the .env file.')
        }
        vapi = new Vapi(VAPI_API_KEY)
    }

    return vapi;
} 

export const useVapi = (book: IBook) => {
    const { userId } = useAuth()
    // TODO IMPLEMENT LIMIT

    const [status, setStatus] = useState<CallStatus>('idle')
    const [messages, setMessages] = useState<Messages[]>([])
    const [currentMessage, setCurrentMessage] = useState('')
    const [currentUserMessage, setCurrentUserMessage] = useState('')
    const [duration, setDuration] = useState(0)
    const [limitError, setLimitError] = useState<string | null>(null)

    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const startTimerRef = useRef<NodeJS.Timeout | null>(null)
    const sessionIdRef = useRef<string | null>(null)
    const isStoppingRef = useRef<boolean>(false)

    const bookRef = useLatestRef(book);
    const durationRef = useLatestRef(duration)
    const voice = book.persona || DEFAULT_VOICE
    // const maxDuration = useLatestRef(limits.maxSessionMinutes * 60)

    const isActive = status === 'listening' || status === 'thinking' || status === 'speaking' || 'starting'
    
    //limits
    // const maxDurationRef = useLatestRef(limits.maxSessionMinutes * 60) 
    // const maxDurationSeconds
    // const remainingSeconds
    // const showTimeWarning

    const start = async () => {
        if(!userId) return setLimitError('Please login to start a conversation');
        setLimitError(null)
        setStatus('connecting')

        try {
            const result = await startVoicesession(userId, book._id)

            if(!result.success) {
                setLimitError(result.error || 'session limit error. Please upgrade your plan')
                setStatus('idle')
                return;
            }

            sessionIdRef.current = result.sessionId || null;


            const firstMessage = `hey, good to meet you. Quick question, before we dive in: have you actually read ${book.title} yet? Or are we starting fresh`

            await getVapi().start(ASSISTANT_ID,{
                firstMessage,
                variableValues: {
                    title:book.title, author:book.author, bookId:book._id
                }, voice: {
                    provider: '11labs',
                    voiceId: getVoice(voice).id, 
                    model: 'eleven_turbo_v2_5' as const, 
                    stability: VOICE_SETTINGS.stability,
                    similarityBoost: VOICE_SETTINGS.similarityBoost,
                    style: VOICE_SETTINGS.style,
                }
            })

        } catch (e) {
            console.error('Error starting call')
            setStatus('idle')
            setLimitError('An error occured while starting the call');
        }
    }
    const stop = async () => {}
    const clearError = async () => {}

    return {
        status, isActive, messages, currentMessage, currentUserMessage, duration, start, stop, clearError,
        // maxDurationSeconds, remainingSeconds, showTimeWarning
    }
}

export default useVapi