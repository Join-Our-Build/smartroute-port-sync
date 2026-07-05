import type { LiveIssue, TicketRow, EpicGroup } from './types'
import portMapJson from '../data/port-map.json'
import summariesJson from '../data/summaries.json'
import titlesJson from '../data/titles.json'

type PortMap = {
	map: Record<
		string,
		{ per_id: string; per_url: string; back_link_added: boolean; tags?: string[] }
	>
}
type Summaries = Record<string, { type: string; summary: string }>
type Titles = Record<string, { title: string; job_url: string; job_parent_id?: string | null }>

const portMap = (portMapJson as unknown as PortMap).map
const summaries = summariesJson as unknown as Summaries
const titles = titlesJson as unknown as Titles

// A ticket is "post-MVP" if it carries the manual port-map tag OR a live Linear
// "post-mvp" label. Native PER tickets (no JOB counterpart) only ever have the
// live label, so tag-only detection would miss them (e.g. PER-249).
const POST_MVP_TAG = 'post-mvp'
function rowTags(
	manual: string[] | undefined,
	liveLabels: string[] | undefined,
): string[] | undefined {
	const set = new Set(manual ?? [])
	if ((liveLabels ?? []).some((l) => l.toLowerCase() === POST_MVP_TAG)) set.add(POST_MVP_TAG)
	return set.size ? [...set] : undefined
}

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
			tags: rowTags(entry.tags, per?.labels),
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

	// PER-native tickets: created directly in PER, no JOB counterpart.
	// Pinned first — this is the live work, everything below is port history.
	const mappedPerIds = new Set(Object.values(portMap).map((e) => e.per_id))
	const perNumber = (id: string) => Number.parseInt(id.split('-')[1] ?? '0', 10)
	const native = perIssues
		.filter((p) => !mappedPerIds.has(p.id))
		.sort((a, b) => perNumber(b.id) - perNumber(a.id))
	if (native.length > 0) {
		groups.unshift({
			job_id: '__per_native__',
			per_id: '__per_native__',
			title: 'New in PER',
			summary: `${native.length} tasks created directly in PER — no JOB counterpart.`,
			type: 'new',
			job_status: null,
			per_status: null,
			job_url: '',
			per_url: '',
			children: native.map((p) => ({
				job_id: '',
				per_id: p.id,
				per_url: p.url,
				per_url_actual: p.url,
				type: 'new',
				summary: '',
				title: p.title,
				job_status: null,
				per_status: p.status,
				job_url: '',
				job_priority: null,
				per_priority: p.priority,
				epic_id: null,
				job_updated: null,
				per_updated: p.updatedAt,
				tags: rowTags(undefined, p.labels),
			})),
		})
	}

	return groups
}

export function computeStats(groups: EpicGroup[]) {
	const all: TicketRow[] = groups.flatMap((g) => g.children.concat(
		g.job_id === '__orphans__' || g.job_id === '__per_native__'
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
	// Post-MVP tickets are deferred out of MVP scope. They still render in the
	// list (with their orange badge), but drop out of the headline total and the
	// progress denominator — same treatment as Canceled/Duplicate.
	const scoped = all.filter((r) => !(r.tags ?? []).includes(POST_MVP_TAG))
	const byPerStatus: Record<string, number> = {}
	const byJobStatus: Record<string, number> = {}
	for (const r of scoped) {
		if (r.per_status) byPerStatus[r.per_status] = (byPerStatus[r.per_status] ?? 0) + 1
		if (r.job_status) byJobStatus[r.job_status] = (byJobStatus[r.job_status] ?? 0) + 1
	}
	// Progress: Done over actionable tickets. Canceled/Duplicate are excluded from
	// the denominator — they're no longer work, so they neither help nor hurt the %.
	const done = byPerStatus['Done'] ?? 0
	const closedOut = (byPerStatus['Canceled'] ?? 0) + (byPerStatus['Duplicate'] ?? 0)
	const actionable = scoped.length - closedOut
	return {
		total: scoped.length,
		epics: groups.filter((g) => g.job_id !== '__orphans__' && g.job_id !== '__per_native__').length,
		done,
		donePct: actionable > 0 ? Math.round((done / actionable) * 100) : 0,
		byPerStatus,
		byJobStatus,
	}
}
