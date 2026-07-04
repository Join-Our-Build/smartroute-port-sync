import type { IssueStatus } from './types'

export const STATUS_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
	Backlog: { bg: 'var(--st-backlog)', fg: '#FBFAF7', label: 'Backlog' },
	Triage: { bg: 'var(--st-triage)', fg: '#FBFAF7', label: 'Triage' },
	Todo: { bg: 'var(--st-todo)', fg: '#FBFAF7', label: 'Todo' },
	'In Progress': { bg: 'var(--st-progress)', fg: '#FBFAF7', label: 'In Progress' },
	'In Review': { bg: 'var(--st-review)', fg: '#FBFAF7', label: 'In Review' },
	Done: { bg: 'var(--st-done)', fg: '#FBFAF7', label: 'Done' },
	Canceled: { bg: 'var(--st-canceled)', fg: '#FBFAF7', label: 'Canceled' },
	Duplicate: { bg: 'var(--st-duplicate)', fg: '#3C3B39', label: 'Duplicate' },
	'Changes Requested': { bg: 'var(--st-changes)', fg: '#FBFAF7', label: 'Changes Req.' },
}

export function statusColor(s: IssueStatus | null | undefined) {
	if (!s) return { bg: 'var(--muted-2)', fg: '#FBFAF7', label: '—' }
	return STATUS_COLORS[s] ?? { bg: 'var(--muted)', fg: '#FBFAF7', label: s }
}

// Type badge palette — editorial, restrained
export const TYPE_STYLES: Record<string, { fg: string; label: string }> = {
	bug: { fg: '#9F1D1D', label: 'Bug' },
	feature: { fg: '#2F5D8A', label: 'Feature' },
	epic: { fg: '#3F6E42', label: 'Epic' },
	improvement: { fg: '#5A5E43', label: 'Improvement' },
	'launch-blocker': { fg: '#9F1D1D', label: 'Launch Blocker' },
	'quick-win': { fg: '#3F6E42', label: 'Quick Win' },
	'ux-audit': { fg: '#8A5A2B', label: 'UX Audit' },
	ops: { fg: '#57578F', label: 'Ops' },
	regression: { fg: '#9F1D1D', label: 'Regression' },
	marketing: { fg: '#8A5A2B', label: 'Marketing' },
	'tech-debt': { fg: '#54524F', label: 'Tech Debt' },
	infra: { fg: '#57578F', label: 'Infra' },
	new: { fg: '#2F5D8A', label: 'New' },
}

export function typeStyle(t: string) {
	return TYPE_STYLES[t] ?? { fg: '#54524F', label: t }
}
