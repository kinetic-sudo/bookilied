import { useState } from "react";
import { IBook, Messages } from "@/types";
import { useAuth } from "@clerk/nextjs";

export type CallStatus = 'idle' | 'connecting' | 'starting' | 'thinking' | 'speaking'

export const useVapi = (book: IBook) => {
    const { userId } = useAuth()
    // TODO IMPLEMENT LIMIT

    const [status, setStatus] = useState<CallStatus>('idle')
    const [messages, setMessages] = useState<Messages[]>([])
}