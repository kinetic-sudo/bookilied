import { auth } from '@clerk/nextjs/server'
import { PricingTable } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function SubscriptionsPage() {
    const { userId } = await auth()
    if (!userId) redirect('/')

    return (
        <main className="clerk-subscriptions">
            <Link href="/" className="back-btn-floating" aria-label="Go back">
                <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
            </Link>

            <div className="w-full max-w-6xl mx-auto mt-[4rem]">
                <h1 className="page-title">Choose Your Plan</h1>
                <p className="page-description text-[var(--text-secondary)]">
                    Unlock more books, longer sessions, and conversation history.
                </p>

                <div className="mt-10 clerk-pricing-table-wrapper">
                    <PricingTable />
                </div>
            </div>
        </main>
    )
}