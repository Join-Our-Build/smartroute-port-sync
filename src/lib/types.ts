export type IssueStatus =
	| 'Backlog'
	| 'Triage'
	| 'Todo'
	| 'In Progress'
	| 'In Review'
	| 'Done'
	| 'Canceled'
	| 'Duplicate'
	| 'Changes Requested'
	| string

export type LiveIssue = {
	id: string // e.g. "JOB-1542" or "PER-69"
	title: string
	status: IssueStatus
	url: string
	assignee: string | null
	parentId: string | null
	priority: number
	updatedAt: string
}

export type TicketRow = {
	job_id: string
	per_id: string
	per_url: string
	type: string
	summary: string
	title: string
	job_status: IssueStatus | null
	per_status: IssueStatus | null
	job_url: string
	per_url_actual: string | null
	job_priority: number | null
	per_priority: number | null
	epic_id: string | null // JOB-XXX of the epic parent (if any)
	job_updated: string | null
	per_updated: string | null
	tags?: string[] // manual markers from port-map.json, e.g. "post-mvp"
}

export type EpicGroup = {
	job_id: string
	per_id: string
	title: string
	summary: string
	type: string
	job_status: IssueStatus | null
	per_status: IssueStatus | null
	job_url: string
	per_url: string
	children: TicketRow[]
}
