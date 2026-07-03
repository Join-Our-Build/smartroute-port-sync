import type { Metadata } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const plexSans = IBM_Plex_Sans({
	subsets: ['latin'],
	weight: ['400', '500', '600'],
	variable: '--font-plex-sans',
	display: 'swap',
})

const plexMono = IBM_Plex_Mono({
	subsets: ['latin'],
	weight: ['400', '500'],
	variable: '--font-plex-mono',
	display: 'swap',
})

export const metadata: Metadata = {
	title: 'SmartRoute Port Sync',
	description: 'Cross-workspace live sync: JOB ↔ PER',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
			<body>{children}</body>
		</html>
	)
}
