'use server'

import VoiceSession from "@/database/models/voiceSessions.models";
import { connectToDatabase } from "@/database/mongoose"
import { getCurrentBillingPeriodStart } from "../subscription-constants";


export const startVoicesession = async (clerkId, bookId) : Promise<StartSessionResult> => {
    try {
        await connectToDatabase();

        //limit/plan  to see whether a session is allowed 
        const ssession = await VoiceSession.create({ clerkId, bookId, 
            startedAt: new Date(), 
            billingPeriodStart: getCurrentBillingPeriodStart()
        });
    } catch (e) {
        console.error('error starting voice session', e)
        return {success: false, error: 'Failed to start session. Please try again later'}
    }

}