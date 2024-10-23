import { LucideIconProps } from './icon'

export type ThemeName = 'dark' | 'light'

export interface Theme {
	code: string
	name: ThemeName
	icon: LucideIconProps['name']
}

export const themes: Theme[] = [
	{ name: 'light', code: 'light', icon: 'sun' },
	{ name: 'dark', code: 'dark', icon: 'moon' }
]
