import { LucideProps } from 'lucide-react'
import dynamicIconImports from 'lucide-react/dynamicIconImports'

export type LucideIconName = keyof typeof dynamicIconImports

export interface LucideIconProps extends LucideProps {
	name: LucideIconName
}
