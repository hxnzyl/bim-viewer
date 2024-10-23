import { ColorRepresentation, GridHelper } from 'three'

import { BimRender } from '../../core/Render'
import { BimViewer } from '../../core/Viewer'
import { extend } from '../../utils/extend'

class BimHelperLineGrid extends BimRender {
	static Options: BimHelperLineGridOptions = {
		color1: '#ffffff',
		color2: '#283844'
	}

	name = 'LineGrid'
	options = {} as BimHelperLineGridOptions
	gridHelper?: GridHelper

	// @overwrite
	constructor(options?: BimHelperLineGridOptions) {
		super()
		this.setOptions(options)
	}

	// @overwrite
	initialize(viewer: BimViewer) {
		this.bimViewer = viewer
	}

	// @overwrite
	setOptions(options?: BimHelperLineGridOptions) {
		this.options = extend(true, {}, BimHelperLineGrid.Options, options || {})
	}

	// @overwrite
	update() {
		this.hide()
		this.gridHelper = new GridHelper(this.bimViewer?.objectSize, 10, this.options.color1, this.options.color2)
		this.show()
	}

	// @overwrite
	show() {
		if (this.gridHelper) {
			this.bimViewer.scene.add(this.gridHelper)
		}
	}

	// @overwrite
	hide() {
		if (this.gridHelper) {
			this.bimViewer.scene.remove(this.gridHelper)
		}
	}

	// @overwrite
	onResize() {}

	// @overwrite
	dispose() {
		if (this.gridHelper) {
			this.hide()
			this.gridHelper.dispose()
			this.gridHelper = undefined
		}
	}
}

export interface BimHelperLineGridOptions {
	color1: ColorRepresentation
	color2: ColorRepresentation
}

export { BimHelperLineGrid }
