import { useEffect } from 'react'
import { BimViewer, BimViewerOptions } from './core/Viewer'

export default function BimViewerComponent(props: { url: string; options: BimViewerOptions }) {
	useEffect(() => {
		// mounted
		let viewer = new BimViewer(props.options)
		viewer.loadUrl(props.url)

		// unmounted
		return () => {
			viewer.dispose()
			viewer = null as any
		}
	}, [props])

	return <div id="bim-viewer" className="flex-shrink-0 w-full"></div>
}
