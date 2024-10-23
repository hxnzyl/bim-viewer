import dynamic from 'next/dynamic'
import dynamicIconImports from 'lucide-react/dynamicIconImports'
import type { LucideIconName, LucideIconProps } from '@/types/icon'

// 图标缓存
const iconCache: Partial<Record<LucideIconName, React.ComponentType>> = {}

export default function LucideIcon({ name, ...props }: LucideIconProps) {
	const LucideIconPrivate = (iconCache[name] = iconCache[name] || dynamic(dynamicIconImports[name]))

	return <LucideIconPrivate {...props} />
}
