import { fetchJobIssues, fetchPerIssues } from '@/lib/linear'
import { joinData, computeStats } from '@/lib/join'
import { Header } from '@/components/Header'
import { ColumnHeader } from '@/components/ColumnHeader'
import { EpicSection } from '@/components/EpicSection'

export const revalidate = 3600

export default async function DashboardPage() {
	let jobIssues: Awaited<ReturnType<typeof fetchJobIssues>> = []
	let perIssues: Awaited<ReturnType<typeof fetchPerIssues>> = []
	const errors: string[] = []

	const [jobResult, perResult] = await Promise.allSettled([
		fetchJobIssues(),
		fetchPerIssues(),
	])
	if (jobResult.status === 'fulfilled') jobIssues = jobResult.value
	else errors.push(`JOB · ${jobResult.reason instanceof Error ? jobResult.reason.message : String(jobResult.reason)}`)
	if (perResult.status === 'fulfilled') perIssues = perResult.value
	else errors.push(`PER · ${perResult.reason instanceof Error ? perResult.reason.message : String(perResult.reason)}`)
	const fetchError = errors.length ? errors.join(' · ') : null

	const groups = joinData(jobIssues, perIssues)
	const stats = computeStats(groups)
	const lastFetch = new Date().toISOString()

	return (
		<div className="min-h-screen">
			<Header stats={stats} lastFetchIso={lastFetch} />

			<main className="max-w-[1400px] mx-auto px-5">
				{fetchError && (
					<div className="mt-3 border border-rule bg-bg-2 px-3 py-2 text-[11.5px] font-mono text-muted">
						<span className="text-ink font-medium">Live fetch offline · </span>
						{fetchError}. Showing baked data (env vars{' '}
						<span className="text-ink">LINEAR_JOB_API_KEY</span> +{' '}
						<span className="text-ink">LINEAR_PER_API_KEY</span> not set).
					</div>
				)}

				<ColumnHeader />

				<div className="pb-24">
					{groups.map((g) => (
						<EpicSection key={g.job_id} group={g} />
					))}
				</div>
			</main>
		</div>
	)
}
