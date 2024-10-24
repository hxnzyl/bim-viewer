import { useContext } from 'react'

import LucideIcon from '@/components/icon/LucideIcon'

import { AppContext } from '@/context/app'
import { themes } from '@/types/theme'

export default function ThemeSelect() {
	const { theme, setTheme } = useContext(AppContext)

	return (
		<div
			className="absolute right-5 bottom-5 cursor-pointer"
			onClick={() => setTheme(themes[theme.code === 'dark' ? 0 : 1])}
		>
			{<LucideIcon name={theme.code === 'dark' ? 'sun' : 'moon'} />}
		</div>
	)
}
