'use client'

import BimViewer from '@/components/bim-viewer'
import { BimViewerOptions } from '@/components/bim-viewer/core/Viewer'
import { BimEffectSelectedHalation } from '@/components/bim-viewer/effects/Selected/Halation'
import { BimHelperLineAxes } from '@/components/bim-viewer/helpers/Line/Axes'
import { BimHelperLineGrid } from '@/components/bim-viewer/helpers/Line/Grid'
import { BimHelperVignetteBackground } from '@/components/bim-viewer/helpers/Vignette/Background'
import { BimWidgetCubeView } from '@/components/bim-viewer/widgets/Cube/View'
import { BimWidgetGUIView } from '@/components/bim-viewer/widgets/GUI/View'

export default function HomePage() {
	const options: BimViewerOptions = {
		helpers: [
			// Grid
			new BimHelperLineGrid(),
			// Axes
			new BimHelperLineAxes(),
			// 背景色助手
			new BimHelperVignetteBackground()
		],
		widgets: [
			// Revit ViewCube
			new BimWidgetCubeView(),
			// GUI
			new BimWidgetGUIView()
		],
		effects: [
			//选中效果器-泛光
			new BimEffectSelectedHalation()
		]
	}

	return <BimViewer url="models/namaqualand_boulder_02_4k.gltf/namaqualand_boulder_02_4k.gltf" options={options}></BimViewer>
}
