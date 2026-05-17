'use server'

import VoiceSession from "@/database/models/voiceSessions.models";
import { connectToDatabase } from "@/database/mongoose"
import { getCurrentBillingPeriodStart } from "../subscription-constants";
import { EndSessionResult, StartSessionResult } from "@/types";


export const startVoicesession = async (clerkId: string, bookId: string) : Promise<StartSessionResult> => {
    try {
        await connectToDatabase();

        //limit/plan  to see whether a session is allowed 
        const session = await VoiceSession.create({
            clerkId, 
            bookId, 
            startedAt: new Date(), 
            billingPeriodStart: getCurrentBillingPeriodStart(),
            durationSeconds: 0,
        });

        return {
            success: true,
            sessionId: session._id.toString()
            // maxDurationMinutes: check.maxDurationMinutes,
        }
    } catch (e) {
        console.error('error starting voice session', e)
        return {success: false, error: 'Failed to start session. Please try again later'}
    }

}

export const endVoiceSession = async (
    sessionId: string,
    durationSeconds: number
  ): Promise<EndSessionResult> => {
    try {
      await connectToDatabase();
  
      await VoiceSession.findByIdAndUpdate(sessionId, {
        endedAt: new Date(),
        durationSeconds,
      });
  
      return { success: true };
    } catch (e) {
      console.error('error ending voice session', e);
      return { success: false, error: 'Failed to end session' };
    }
  };