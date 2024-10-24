'use client'

import '@/styles/globals.css'

import { useEffect, useState } from 'react'

import LayoutDefault from '@/components/layout/default'
import { AppContext, Theme, themes } from '@/context/app'

import { cn } from '@/lib/utils'

import localStorage from '@/lib/localStorage'

const defaultTheme: Theme = JSON.parse(localStorage.getItem('theme') || 'null') || themes[0]

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	const [initializeRenderCompleted, setInitializeRenderCompleted] = useState<boolean>(false)
	let [theme, setTheme] = useState(defaultTheme)

	// 只会在组件首次渲染时执行一次
	useEffect(() => {
		setInitializeRenderCompleted(true)
	}, [])

	const onSelectTheme = (_theme: Theme) => {
		theme = _theme
		setTheme(_theme)
		localStorage.setItem('theme', JSON.stringify(_theme))
	}

	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body className={cn(`min-h-screen bg-background font-sans antialiased`, initializeRenderCompleted && theme.code)}>
				<AppContext.Provider value={{ theme, setTheme: onSelectTheme }}>
					{initializeRenderCompleted && <LayoutDefault>{children}</LayoutDefault>}
				</AppContext.Provider>
			</body>
		</html>
	)
}
