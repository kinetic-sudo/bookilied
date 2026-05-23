import { NextRequest, NextResponse } from 'next/server'
import { searchBookSegments } from '@/lib/actions/book.actions'
 
export async function POST(req: NextRequest) {
        try {
        const body = await req.json()
 
        // Vapi sends tool calls inside message.toolCallList
        const toolCallList = body?.message?.toolCallList ?? []
 
        const results = await Promise.all(
            toolCallList.map(async (toolCall: any) => {
                const { id, function: fn } = toolCall
 
                if (fn?.name !== 'search_book') {
                    return {
                        toolCallId: id,
                        result: 'Unknown tool.',
                    }
                }
 
                // Parse parameters — Vapi may send them as a JSON string or object
                const params =
                    typeof fn.arguments === 'string'
                        ? JSON.parse(fn.arguments)
                        : fn.arguments
 
                const bookId: string = params?.bookId
                const query: string  = params?.query
 
                if (!bookId || !query) {
                    return {
                        toolCallId: id,
                        result: 'Missing required parameters: bookId and query.',
                    }
                }
 
                // Search top 3 matching segments
                const searchResult = await searchBookSegments(bookId, query, 3)
 
                if (
                    !searchResult.success ||
                    !searchResult.data ||
                    searchResult.data.length === 0
                ) {
                    return {
                        toolCallId: id,
                        result: 'No information found about this topic.',
                    }
                }
 
                // Combine segment contents into a single string
                const combined = (searchResult.data as { content: string }[])
                .map(segment => segment.content)
                .join('\n\n')
            
 
                return {
                    toolCallId: id,
                    result: combined,
                }
            })
        )
 
        return NextResponse.json({ results })
 
    } catch (e) {
        console.error('Error in search-book route', e)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
 