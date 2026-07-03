import type { LiveIssue, TicketRow, EpicGroup } from './types'
import portMapJson from '../data/port-map.json'
import summariesJson from '../data/summaries.json'
import titlesJson from '../data/titles.json'

type PortMap = {
	map: Record<string, { per_id: string; per_url: string; back_link_added: boolean }>
}
type Summaries = Record<string, { type: string; summary: string }>
type Titles = Record<string, { title: string; job_url: string; job_parent_id?: string | null }>

const portMap = (portMapJson as unknown as PortMap).map
const summaries = summariesJson as unknown as Summaries
const titles = titlesJson as unknown as Titles

export function joinData(jobIssues: LiveIssue[], perIssues: LiveIssue[]): EpicGroup[] {
	const jobById = new Map(jobIssues.map((i) => [i.id, i]))
	const perById = new Map(perIssues.map((i) => [i.id, i]))

	// Build canonical row list
	const rows: TicketRow[] = []
	for (const [jobId, entry] of Object.entries(portMap)) {
		const job = jobById.get(jobId)
		const per = perById.get(entry.per_id)
		const sum = summaries[jobId] ?? { type: 'improvement', summary: '' }
		const baked = titles[jobId]
		// Prefer live parentId, fall back to baked parent from manifest
		const jobParent = job?.parentId ?? baked?.job_parent_id ?? null
		const isEpicChild = jobParent && portMap[jobParent]
		rows.push({
			job_id: jobId,
			per_id: entry.per_id,
			per_url: entry.per_url,
			type: sum.type,
			summary: sum.summary,
			title: job?.title ?? per?.title ?? baked?.title ?? jobId,
			job_status: job?.status ?? null,
			per_status: per?.status ?? null,
			job_url: job?.url ?? baked?.job_url ?? `https://linear.app/joinourbuild/issue/${jobId.toLowerCase()}/`,
			per_url_actual: per?.url ?? entry.per_url,
			job_priority: job?.priority ?? null,
			per_priority: per?.priority ?? null,
			epic_id: isEpicChild ? jobParent : null,
			job_updated: job?.updatedAt ?? null,
			per_updated: per?.updatedAt ?? null,
		})
	}

	// Group by epic
	const epicIds = rows.filter((r) => r.type === 'epic').map((r) => r.job_id)
	const groups: EpicGroup[] = []
	const usedChildren = new Set<string>()
	for (const eid of epicIds) {
		const eRow = rows.find((r) => r.job_id === eid)
		if (!eRow) continue
		const children = rows.filter((r) => r.epic_id === eid && r.job_id !== eid)
		children.forEach((c) => usedChildren.add(c.job_id))
		groups.push({
			job_id: eRow.job_id,
			per_id: eRow.per_id,
			title: eRow.title,
			summary: eRow.summary,
			type: eRow.type,
			job_status: eRow.job_status,
			per_status: eRow.per_status,
			job_url: eRow.job_url,
			per_url: eRow.per_url_actual ?? eRow.per_url,
			children,
		})
	}

	// Orphan group: tickets not under any in-scope epic
	const orphans = rows.filter(
		(r) => r.type !== 'epic' && !usedChildren.has(r.job_id)
	)
	if (orphans.length > 0) {
		groups.push({
			job_id: '__orphans__',
			per_id: '__orphans__',
			title: 'Standalone tickets',
			summary: `${orphans.length} tickets without an in-scope epic parent — mostly independent bugs, features, and audits.`,
			type: 'improvement',
			job_status: null,
			per_status: null,
			job_url: '',
			per_url: '',
			children: orphans,
		})
	}

	// Order epics: by number of children desc, then by title
	groups.sort((a, b) => {
		if (a.job_id === '__orphans__') return 1
		if (b.job_id === '__orphans__') return -1
		return b.children.length - a.children.length
	})

	return groups
}

export function computeStats(groups: EpicGroup[]) {
	const all: TicketRow[] = groups.flatMap((g) => g.children.concat(
		g.job_id === '__orphans__'
			? []
			: [
					{
						job_id: g.job_id,
						per_id: g.per_id,
						per_url: g.per_url,
						type: g.type,
						summary: g.summary,
						title: g.title,
						job_status: g.job_status,
						per_status: g.per_status,
						job_url: g.job_url,
						per_url_actual: g.per_url,
						job_priority: null,
						per_priority: null,
						epic_id: null,
						job_updated: null,
						per_updated: null,
					},
			  ]
	))
	const byPerStatus: Record<string, number> = {}
	const byJobStatus: Record<string, number> = {}
	for (const r of all) {
		if (r.per_status) byPerStatus[r.per_status] = (byPerStatus[r.per_status] ?? 0) + 1
		if (r.job_status) byJobStatus[r.job_status] = (byJobStatus[r.job_status] ?? 0) + 1
	}
	return {
		total: all.length,
		epics: groups.filter((g) => g.job_id !== '__orphans__').length,
		byPerStatus,
		byJobStatus,
	}
}
