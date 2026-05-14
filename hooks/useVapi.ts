import { useState, useRef, useEffect } from "react";
import { IBook, Messages } from "@/types";
import { useAuth } from "@clerk/nextjs";

export type CallStatus = 'idle' | 'connecting' | 'starting' | 'thinking' | 'speaking'

const useLatestRef = <T>(value: T) => {
    const ref = useRef(value)
    useEffect(() => {
        ref.current = value
    });
    return ref
}

export const useVapi = (book: IBook) => {
    const { userId } = useAuth()
    // TODO IMPLEMENT LIMIT

    const [status, setStatus] = useState<CallStatus>('idle')
    const [messages, setMessages] = useState<Messages[]>([])
    const [currentMessage, setCurrentMessage] = useState('')
    const [currentUserMessage, setCurrentUserMessage] = useState('')
    const [duration, setDuration] = useState(0)
    const [limitError, setLimitError] = useState<null>(null)

    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const startTimerRef = useRef<NodeJS.Timeout | null>(null)
    const sessionIdRef = useRef<string | null>(null)
    const isStoppingRef = useRef<boolean>(false)


}