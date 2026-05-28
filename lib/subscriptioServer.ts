import { auth } from '@clerk/nextjs/server'
import { PlanSlug } from '@/lib/subscription-constants'

/**
 * Returns the current user's plan slug using Clerk's has() to check
 * which Clerk Billing plan the user is subscribed to.
 *
 * Plans are configured in the Clerk Dashboard with slugs:
 *   "standard" and "pro"
 * Users without a subscription are on "free".
 */
export const getUserPlan = async (): Promise<PlanSlug> => {
    const { has } = await auth()

    if (has({ plan: 'pro' })) return 'pro'
    if (has({ plan: 'standard' })) return 'standard'
    return 'free'
}