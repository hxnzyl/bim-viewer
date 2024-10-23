import { Context, createContext } from 'react'

import { Theme, themes } from '@/types/theme'

export interface AppConfig {
	theme: Theme
	[name: string]: any
}

export const AppContext: Context<AppConfig> = createContext<AppConfig>({} as AppConfig)

export { themes }

export type { Theme }
