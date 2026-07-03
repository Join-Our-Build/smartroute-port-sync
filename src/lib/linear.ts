import type { LiveIssue } from './types'

const LINEAR_GRAPHQL = 'https://api.linear.app/graphql'

const SMARTROUTE_PROJECT_ID_JOB = '0f9d70d7-bdcd-4b99-80a9-e8c48733787c'
const NEW_SMARTROUTE_PROJECT_ID_PER = '120e5916-ea87-4784-8e21-f3b41d9329ce'

const ISSUES_QUERY = `
	query ProjectIssues($projectId: String!, $after: String) {
		project(id: $projectId) {
			issues(first: 250, after: $after) {
				pageInfo { hasNextPage endCursor }
				nodes {
					identifier
					title
					url
					priority
					updatedAt
					state { name type }
					assignee { name email }
					parent { identifier }
				}
			}
		}
	}
`

type Node = {
	identifier: string
	title: string
	url: string
	priority: number
	updatedAt: string
	state: { name: string; type: string } | null
	assignee: { name: string; email: string } | null
	parent: { identifier: string } | null
}

type IssuesPage = {
	pageInfo: { hasNextPage: boolean; endCursor: string }
	nodes: Node[]
}
type GraphQLResponse = {
	data?: { project?: { issues?: IssuesPage } }
	errors?: unknown
}

async function fetchAllIssues(apiKey: string, projectId: string): Promise<Node[]> {
	const nodes: Node[] = []
	let after: string | null = null
	for (let i = 0; i < 20; i++) {
		const res: Response = await fetch(LINEAR_GRAPHQL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: apiKey,
			},
			body: JSON.stringify({
				query: ISSUES_QUERY,
				variables: { projectId, after },
			}),
			next: { revalidate: 300 },
		})
		if (!res.ok) {
			const text = await res.text()
			throw new Error(`Linear GraphQL ${res.status}: ${text.slice(0, 200)}`)
		}
		const data: GraphQLResponse = await res.json()
		if (data.errors) {
			throw new Error(`Linear GraphQL errors: ${JSON.stringify(data.errors).slice(0, 300)}`)
		}
		const issues = data.data?.project?.issues
		if (!issues) return nodes
		nodes.push(...issues.nodes)
		if (!issues.pageInfo.hasNextPage) return nodes
		after = issues.pageInfo.endCursor
	}
	return nodes
}

function toLive(n: Node): LiveIssue {
	return {
		id: n.identifier,
		title: n.title,
		status: n.state?.name ?? 'Unknown',
		url: n.url,
		assignee: n.assignee?.name ?? null,
		parentId: n.parent?.identifier ?? null,
		priority: n.priority,
		updatedAt: n.updatedAt,
	}
}

export async function fetchJobIssues(): Promise<LiveIssue[]> {
	const key = process.env.LINEAR_JOB_API_KEY
	if (!key) throw new Error('LINEAR_JOB_API_KEY is not set')
	const nodes = await fetchAllIssues(key, SMARTROUTE_PROJECT_ID_JOB)
	return nodes.map(toLive)
}

export async function fetchPerIssues(): Promise<LiveIssue[]> {
	const key = process.env.LINEAR_PER_API_KEY
	if (!key) throw new Error('LINEAR_PER_API_KEY is not set')
	const nodes = await fetchAllIssues(key, NEW_SMARTROUTE_PROJECT_ID_PER)
	return nodes.map(toLive)
}
