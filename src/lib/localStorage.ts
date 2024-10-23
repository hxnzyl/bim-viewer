export interface LocalStorage {
	getItem(key: string): string | null
	setItem(key: string, value: string): void
	removeItem(key: string): void
	[name: string]: any
}

const PREFIX = '3DModelsViewer_'

const localStorage: LocalStorage = {
	getItem(key: string): string | null {
		key = PREFIX + key
		return typeof window !== 'undefined' ? window.localStorage.getItem(key) : key in localStorage ? localStorage[key] : null
	},
	setItem(key: string, value: string): void {
		key = PREFIX + key
		if (typeof window !== 'undefined') window.localStorage.setItem(key, value)
		else localStorage[key] = value
	},
	removeItem(key: string): void {
		key = PREFIX + key
		if (typeof window !== 'undefined') window.localStorage.removeItem(key)
		else if (key in localStorage) delete localStorage[key]
	}
}

export default localStorage
