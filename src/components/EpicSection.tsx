import type { EpicGroup } from '@/lib/types'
import { TicketRow } from './TicketRow'

export function EpicSection({ group }: { group: EpicGroup }) {
	const isFlat = group.job_id === '__orphans__' || group.job_id === '__per_native__'

	if (isFlat) {
		return (
			<section className="mt-6">
				<div className="flex items-baseline gap-2 py-1.5 px-1 mb-1 sticky top-14 bg-bg z-10 border-b border-rule">
					<span className="font-medium text-[12px] text-ink">
						{group.title}
					</span>
					<span className="font-mono text-[10.5px] text-muted-2 tabular-nums">
						{group.children.length}
					</span>
				</div>
				<div>
					{group.children.map((c, i) => (
						<TicketRow
							key={c.job_id || c.per_id}
							row={c}
							isChild
							childIndex={i}
							childCount={group.children.length}
						/>
					))}
				</div>
			</section>
		)
	}

	// Epic header row (same layout as child but bold)
	const headerRow = {
		job_id: group.job_id,
		per_id: group.per_id,
		per_url: group.per_url,
		per_url_actual: group.per_url,
		type: group.type,
		summary: group.summary,
		title: group.title,
		job_status: group.job_status,
		per_status: group.per_status,
		job_url: group.job_url,
		job_priority: null,
		per_priority: null,
		epic_id: null,
		job_updated: null,
		per_updated: null,
	}

	return (
		<section className="mt-4">
			<TicketRow row={headerRow} isEpicHeader />
			{group.children.map((c, i) => (
				<TicketRow
					key={c.job_id}
					row={c}
					isChild
					childIndex={i}
					childCount={group.children.length}
				/>
			))}
		</section>
	)
}
