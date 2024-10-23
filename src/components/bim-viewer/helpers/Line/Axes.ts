import { AxesHelper, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { BimRender } from '../../core/Render'
import { BimViewer } from '../../core/Viewer'
import { extend } from '../../utils/extend'

class BimHelperLineAxes extends BimRender {
	static Options: BimHelperLineAxesOptions = {
		// domElement: undefined,
		visibility: 'hidden',
		width: 150,
		height: 150
	}

	name = 'LineAxes'
	options = {} as BimHelperLineAxesOptions

	domElement!: HTMLElement
	axesScene!: Scene
	axesRenderer!: WebGLRenderer
	axesCamera!: PerspectiveCamera
	axesHelper!: AxesHelper
	axesCorner!: AxesHelper

	// @overwrite
	constructor(options?: BimHelperLineAxesOptions) {
		super()
		this.setOptions(options)
	}

	// @overwrite
	initialize(viewer: BimViewer) {
		if (this.bimViewer) return

		this.bimViewer = viewer
		this.createDomElement()

		const { width, height } = this.options

		this.axesScene = new Scene()
		this.axesCamera = new PerspectiveCamera(50, width / height, 0.1, 10)
		this.axesCamera.up.copy(this.bimViewer.camera.up)
		this.axesScene.add(this.axesCamera)

		this.axesRenderer = new WebGLRenderer({ alpha: true })
		this.axesRenderer.setPixelRatio(window.devicePixelRatio)
		this.axesRenderer.setSize(width, height)

		this.axesCorner = new AxesHelper(5)
		this.axesScene.add(this.axesCorner)

		this.axesHelper = new AxesHelper()
		this.axesHelper.renderOrder = 999
		this.axesHelper.onBeforeRender = (renderer) => renderer.clearDepth()

		this.domElement.appendChild(this.axesRenderer.domElement)
	}

	// @overwrite
	setOptions(options?: BimHelperLineAxesOptions) {
		this.options = extend(true, {}, BimHelperLineAxes.Options, options || {})
	}

	// @overwrite
	createDomElement() {
		if (this.domElement) return
		const { width, height, visibility, domElement } = this.options
		let el = domElement || document.getElementById('bim-widget-line-axes')
		if (!el) (el = document.createElement('div')), this.bimViewer.domElement.appendChild(el)
		el.id = 'bim-widget-line-axes'
		el.style.cssText = `position:fixed;bottom:0;left:0;visibility:${visibility};width:${width}px;height:${height}px`
		this.domElement = el
	}

	// @overwrite
	render() {
		this.axesCamera.position.copy(this.bimViewer.camera.position)
		this.axesCamera.lookAt(this.axesScene.position)
		this.axesRenderer.render(this.axesScene, this.axesCamera)
	}

	// @overwrite
	update() {
		this.hide()
		const { objectSize, camera } = this.bimViewer
		this.axesCamera.position.copy(camera.position)
		this.axesCamera.lookAt(this.axesScene.position)
		this.axesCamera.near = objectSize / 100
		this.axesCamera.far = objectSize * 100
		this.axesCamera.updateProjectionMatrix()
		this.axesHelper.scale.set(objectSize, objectSize, objectSize)
		this.show()
	}

	// @overwrite
	show() {
		this.domElement.style.visibility = ''
		this.bimViewer.scene.add(this.axesHelper)
	}

	// @overwrite
	hide() {
		this.domElement.style.visibility = 'hidden'
		this.bimViewer.scene.remove(this.axesHelper)
	}

	// @overwrite
	onResize() {
		const { width, height } = this.options
		this.axesCamera.aspect = width / height
		this.axesCamera.updateProjectionMatrix()
		this.axesRenderer.setSize(width, height)
	}

	// @overwrite
	dispose() {
		if (!this.domElement) return

		this.axesHelper.dispose()
		this.axesCorner.dispose()

		this.axesRenderer.dispose()

		this.bimViewer.domElement.removeChild(this.domElement)
		this.domElement = null as any
	}
}

export interface BimHelperLineAxesOptions {
	domElement?: HTMLElement
	visibility: 'hidden' | 'visible'
	width: number
	height: number
}

export { BimHelperLineAxes }
