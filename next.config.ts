import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	reactStrictMode: true,
	eslint: {
		// ESLint runs locally (pnpm lint) and in CI. Skip it during Vercel
		// production builds so a config warning doesn't block deploy.
		ignoreDuringBuilds: true,
	},
}

export default nextConfig
