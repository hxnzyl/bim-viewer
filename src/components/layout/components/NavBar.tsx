import Link from 'next/link'

import LucideIcon from '@/components/icon/LucideIcon'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import type { LucideIconProps } from '@/types/icon'

interface NavLink {
	href: string
	text: string
	icon: LucideIconProps['name']
}

const navLinks: NavLink[] = [
	{ href: '/', text: 'Home', icon: 'home' }
	// { href: '/tool', text: 'Tool', icon: 'wrench' },
	// { href: '/data', text: 'Data', icon: 'database' }
]

export default function NavBar() {
	const currentPath = usePathname() as string

	function linkClassName(navLink: NavLink) {
		return cn(
			'flex items-center gap-3 px-3 py-2 transition-all border-b border-b-2 hover:text-primary',
			currentPath === navLink.href || currentPath.includes(navLink.href + '/')
				? 'text-primary border-primary'
				: 'text-muted-foreground border-transparent'
		)
	}

	return (
		<nav className="flex items-center justify-center text-sm font-medium col-span-4">
			{navLinks.map((navLink: NavLink) => (
				<Link key={navLink.href} href={navLink.href} className={linkClassName(navLink)}>
					<LucideIcon name={navLink.icon} className="w-4 h-4" />
					<span>{navLink.text}</span>
				</Link>
			))}
		</nav>
	)
}
