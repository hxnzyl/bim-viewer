import type { Metadata } from 'next'

import ThemeSelect from './components/ThemeSelect'

export const metadata: Metadata = {
	title: '3D Models Viewer',
	description: '3D Models Viewer create by OWen'
}

export default function LayoutDefault({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<div className="flex flex-col min-h-screen">
			<ThemeSelect />
			<main className="flex flex-1 w-full">{children}</main>
		</div>
	)
}
