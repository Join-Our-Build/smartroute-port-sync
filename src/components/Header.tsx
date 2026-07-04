'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { refreshDashboard } from '@/app/actions'

export function Header({
	stats,
	lastFetchIso,
}: {
	stats: { total: number; epics: number; byPerStatus: Record<string, number>; byJobStatus: Record<string, number> }
	lastFetchIso: string
}) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	const refresh = () =>
		startTransition(async () => {
			await refreshDashboard()
			router.refresh()
		})

	const minsAgo = Math.max(0, Math.round((Date.now() - new Date(lastFetchIso).getTime()) / 60000))

	return (
		<header className="sticky top-0 z-20 bg-bg/90 backdrop-blur border-b border-rule">
			<div className="flex items-center justify-between px-5 py-3 gap-8">
				<div className="flex items-baseline gap-4">
					<h1 className="font-medium text-[14px] text-ink tracking-tight">
						SmartRoute Port Sync
					</h1>
					<span className="font-mono text-[11px] text-muted-2">
						{stats.total} tickets · {stats.epics} epics
					</span>
				</div>
				<div className="flex items-baseline gap-4">
					<span className="font-mono text-[10.5px] text-muted-2">
						{minsAgo === 0 ? 'just now' : `${minsAgo}m ago`}
					</span>
					<button
						onClick={refresh}
						disabled={isPending}
						className="border border-ink px-2.5 py-1 text-[11px] font-medium hover:bg-ink hover:text-bg transition-colors disabled:opacity-50"
					>
						{isPending ? 'Refreshing…' : 'Refresh'}
					</button>
				</div>
			</div>
		</header>
	)
}
