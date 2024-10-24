export type DeepRequired<T> = T extends object
	? {
			[P in keyof T]-?: DeepRequired<T[P]>
	  } & {}
	: T

export interface NumberObject {
	[key: string]: number
}

export interface DataAnyObject {
	[key: string]: {
		data: any
	}
}
