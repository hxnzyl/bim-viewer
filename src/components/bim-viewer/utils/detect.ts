'use client'

export function isIOS() {
	return (
		typeof window !== 'undefined' &&
		(['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) ||
			(navigator.userAgent.includes('Mac') && document.ontouchend !== undefined))
	)
}

export function assertUrl(url: string) {
	if (url.includes('.gltf') || url.includes('.glb') || url.includes('.obj')) return
	throw new Error('Unsupported file extension, via .gltf、.glb、.obj')
}
