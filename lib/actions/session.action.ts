'use server'

import { connectToDatabase } from "@/database/mongoose"

export const startVoicesession = async (clerkId, bookId) : Promise<StartSessionResult> => {
    try {
        await connectToDatabase();

        //limit/plan  to see whether a session is allowed 
    } catch (e) {
        console.error('error starting voice session', e)
        return {success: false, error: 'Failed to start session. Please try again later'}
    }

}