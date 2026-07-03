import type { TicketRow as TR } from '@/lib/types'
import { typeStyle } from '@/lib/status'
import { StatusPill } from './StatusPill'

export function TicketRow({
	row,
	isEpicHeader,
	isChild,
	childIndex,
	childCount,
}: {
	row: TR
	isEpicHeader?: boolean
	isChild?: boolean
	childIndex?: number
	childCount?: number
}) {
	const ts = typeStyle(row.type)
	const isLast =
		isChild && childIndex !== undefined && childCount !== undefined && childIndex === childCount - 1

	return (
		<div
			className={`grid items-center gap-3 py-1.5 border-b border-rule-2 hover:bg-bg-2 transition-colors ${
				isEpicHeader ? 'font-medium bg-bg-2/40' : ''
			}`}
			style={{
				gridTemplateColumns:
					'16px 78px 108px minmax(0, 1fr) 108px 68px 108px',
			}}
		>
			<div className="font-mono text-[10px] text-muted-2 leading-none flex justify-center">
				{isEpicHeader ? '▼' : isChild ? (isLast ? '└' : '├') : ''}
			</div>

			<a
				href={row.job_url}
				target="_blank"
				rel="noopener noreferrer"
				className="font-mono text-[11px] text-ink hover:text-red hover:underline underline-offset-2 truncate"
			>
				{row.job_id}
			</a>

			<span
				className="text-[10px] font-medium uppercase tracking-wide truncate"
				style={{ color: ts.fg }}
			>
				{ts.label}
			</span>

			<span
				className={`text-[13px] truncate ${isEpicHeader ? 'text-ink' : 'text-ink-2'}`}
				title={row.title}
			>
				{row.title}
			</span>

			<div className="justify-self-start">
				<StatusPill status={row.job_status} />
			</div>

			<a
				href={row.per_url_actual ?? row.per_url}
				target="_blank"
				rel="noopener noreferrer"
				className="font-mono text-[11px] text-ink hover:text-red hover:underline underline-offset-2 truncate"
			>
				{row.per_id}
			</a>

			<div className="justify-self-start">
				<StatusPill status={row.per_status} />
			</div>
		</div>
	)
}
