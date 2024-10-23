/**
 * CubeView Widget
 *
 * @author OWen<733433@qq.com>
 */

import { ColorRepresentation, Scene } from 'three'
import { BimRender } from '../../core/Render'
import { BimViewer } from '../../core/Viewer'
import { extend } from '../../utils/extend'
import { BimWidgetCubeData } from './Data'
import { BimWidgetCubeEditor } from './Editor'
import { BimWidgetCubeRender } from './Render'

class BimWidgetCubeView extends BimRender {
	static Options: BimWidgetCubeViewOptions = {
		// domElement: undefined,
		visibility: 'hidden',
		width: 150,
		height: 150,
		colors: {
			faceDefaultColor: 14936556, //#e3e9ec
			faceDefaultOpacity: 1, //透明度
			wireframeDefaultColor: 13421772, //#cccccc
			wireframeDefaultOpacity: 1, //透明度
			faceHighlightColor: 3368703, //#3366FF
			faceHighlightOpacity: 0.5, //透明度
			wireframeHighlightColor: 3381759, //#3399FF
			wireframeHighlightOpacity: 0.5 //透明度
		}
	}

	name = 'CubeView'
	options = {} as Required<BimWidgetCubeViewOptions>
	events: ('show' | 'hide')[] = []

	domElement!: HTMLElement
	bimCubeData!: BimWidgetCubeData
	bimCubeRender!: BimWidgetCubeRender
	bimCubeEditor!: BimWidgetCubeEditor

	// @overwrite
	constructor(options?: BimWidgetCubeViewOptions) {
		super()
		this.setOptions(options)
	}

	// @overwrite
	initialize(viewer: BimViewer) {
		if (this.bimViewer) return
		this.bimViewer = viewer
		this.createDomElement()
		this.bimCubeData = new BimWidgetCubeData(this.options.colors, () => {
			this.bimCubeRender = new BimWidgetCubeRender(this.domElement, this.bimCubeData)
			this.bimCubeEditor = new BimWidgetCubeEditor(this.domElement, this.bimCubeData, this.bimCubeRender, this.bimViewer)
			this.dispatchEvent()
		})
	}

	// @overwrite
	setOptions(options?: BimWidgetCubeViewOptions) {
		this.options = extend(true, {}, BimWidgetCubeView.Options, options || {})
	}

	// @overwrite
	createDomElement() {
		if (this.domElement) return
		const { width, height, visibility, domElement } = this.options
		let el = domElement || document.getElementById('bim-widget-cube-view')
		if (!el) (el = document.createElement('div')), this.bimViewer?.domElement?.appendChild(el)
		el.id = 'bim-widget-cube-view'
		el.style.cssText = `position:fixed;top:0;right:0;visibility:${visibility};width:${width}px;height:${height}px`
		this.domElement = el
	}

	// @overwrite
	render() {
		// @ts-ignore
		this.bimCubeRender.render(this.bimViewer.camera)
	}

	// @overwrite
	update() {
		this.show()
	}

	// @overwrite
	show() {
		if (this.domElement) {
			this.bimCubeRender!.setActiveScene(this.bimCubeData!.getScene())
			this.bimCubeRender!.render()
			this.domElement.style.visibility = ''
		} else {
			this.events.push('show')
		}
	}

	// @overwrite
	hide() {
		if (this.domElement) {
			this.bimCubeRender!.setActiveScene(new Scene())
			this.bimCubeRender!.render()
			this.domElement.style.visibility = 'hidden'
		} else {
			this.events.push('hide')
		}
	}

	// @overwrite
	dispose() {
		this.bimCubeData.dispose()
		this.bimCubeEditor.dispose()
		this.bimCubeRender.dispose()
		this.events = []
	}

	dispatchEvent() {
		this.events.forEach((fun) => this[fun]())
		this.events = []
	}
}

export interface BimWidgetCubeViewOptions {
	domElement?: HTMLElement
	visibility?: 'hidden' | 'visible'
	width?: number
	height?: number
	colors?: {
		faceDefaultColor?: ColorRepresentation //#e3e9ec
		faceDefaultOpacity?: number //透明度
		wireframeDefaultColor?: ColorRepresentation //#cccccc
		wireframeDefaultOpacity?: number //透明度
		faceHighlightColor?: ColorRepresentation //#3399FF
		faceHighlightOpacity?: number //透明度
		wireframeHighlightColor?: ColorRepresentation //#3399FF
		wireframeHighlightOpacity?: number //透明度
	}
}

export { BimWidgetCubeView }
