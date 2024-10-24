export type DeepRequired<T> = T extends object
	? {
			[P in keyof T]-?: DeepRequired<T[P]>
	  } & {}
	: T

export interface AnyObject<T = string> {
	[key: T]: any
}

export interface StringObject<T = string> {
	[key: T]: string
}

export interface NumberObject<T = string> {
	[key: T]: number
}

export interface BooleanObject<T = string> {
	[key: T]: boolean
}

export interface DataAnyObject<T = string> {
	[key: T]: {
		data: any
	}
}
