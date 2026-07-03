export function ColumnHeader() {
	return (
		<div
			className="grid items-center gap-3 py-2 px-1 border-b border-rule text-[10px] uppercase tracking-wider text-muted font-medium sticky top-[52px] bg-bg z-10"
			style={{
				gridTemplateColumns: '16px 78px 108px minmax(0, 1fr) 108px 68px 108px',
			}}
		>
			<span></span>
			<span>JOB ID</span>
			<span>Type</span>
			<span>Title</span>
			<span>JOB Status</span>
			<span>PER ID</span>
			<span>PER Status</span>
		</div>
	)
}
