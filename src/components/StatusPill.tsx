import type { IssueStatus } from '@/lib/types'
import { statusColor } from '@/lib/status'

export function StatusPill({ status }: { status: IssueStatus | null }) {
	const { bg, fg, label } = statusColor(status)
	return (
		<span
			className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-medium leading-none whitespace-nowrap"
			style={{ background: bg, color: fg }}
		>
			<span className="w-1 h-1 rounded-full" style={{ background: fg, opacity: 0.75 }} />
			{label}
		</span>
	)
}
