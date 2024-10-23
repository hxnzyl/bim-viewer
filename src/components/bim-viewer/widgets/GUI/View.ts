import type { GUI, GUIController, GUIParams } from 'dat.gui'
import Stats from 'three/examples/jsm/libs/stats.module'
import { Environments } from '../../config/Environments'
import { BimRender } from '../../core/Render'
import { BimViewer } from '../../core/Viewer'
import { BimHelperVignetteBackground } from '../../helpers/Vignette/Background'
import { extend } from '../../utils/extend'

class BimWidgetGUIView extends BimRender {
	static Options: BimWidgetGUIViewOptions = {
		// domElement: undefined,
		kiosk: false,
		visibility: 'hidden',
		width: 260
	}

	name = 'GUIView'
	options = {} as Required<BimWidgetGUIViewOptions>
	state: { [key: string]: any } = {}
	actionStates: { [key: string]: boolean } = {}
	animCtrls: GUIController<object>[] = []
	morphCtrls: GUIController<object>[] = []

	domElement!: HTMLElement
	gui!: GUI
	animationsFolder!: GUI
	morphsFolder!: GUI
	camerasFolder!: GUI
	cameraCtrl!: GUIController<object>
	stats!: Stats

	// @overwrite
	constructor(options?: BimWidgetGUIViewOptions) {
		super()
		this.setOptions(options)
	}

	// @overwrite
	initialize(viewer: BimViewer) {
		this.bimViewer = viewer
		this.createDomElement()
	}

	// @overwrite
	setOptions(options?: BimWidgetGUIViewOptions) {
		this.options = extend(true, {}, BimWidgetGUIView.Options, options || {})
	}

	// @overwrite
	createDomElement() {
		if (this.gui) return

		const { domElement, visibility, kiosk, ...guiParams } = this.options
		const { GUI } = require('dat.gui')
		const gui = new GUI(guiParams)

		const bim = this.bimViewer
		const opts = bim.options
		const bgh = bim.helpers.VignetteBackground as BimHelperVignetteBackground

		const state = {
			wireframe: false,
			skeleton: !!bim.helpers.skeletonHelpers,
			grid: !!bim.helpers.LineGrid,
			autoRotate: bim.controls?.autoRotate,
			screenSpacePanning: bim.controls?.screenSpacePanning,
			textureColorSpace: 'sRGB',
			outputColorSpace: 'sRGB',
			exposure: bim.renderer?.toneMappingExposure || 1,
			background: false,
			environment: bim.environment?.name || 'None',
			backgroundColor1: (bgh && bgh.options.color1) || '#ffffff',
			backgroundColor2: (bgh && bgh.options.color2) || '#ffffff',
			addLights: bim.lights.length > 0,
			playbackSpeed: 1.0
		}

		//#region Display
		const displayFolder = gui.addFolder('Displaies')
		displayFolder.add(state, 'wireframe').onChange(() => bim.updateWireframe(state.wireframe)) //线框
		displayFolder.add(state, 'skeleton').onChange(() => bim.updateSkeleton(state.skeleton)) //骨架
		displayFolder.add(state, 'grid').onChange(() => bim.updateGrid(state.grid)) //网格助手
		//#endregion Display

		//#region Controls
		const controlsFolder = gui.addFolder('Controls')
		controlsFolder.add(bim.controls!, 'autoRotate') //自动旋转
		controlsFolder.add(bim.controls!, 'screenSpacePanning') //屏幕空间平移
		//#endregion Controls

		//#region Textures
		const texturesFolder = gui.addFolder('Textures')
		texturesFolder.add(state, 'exposure', 0, 2).onChange(() => bim.updateLights('exposure', state.exposure))
		texturesFolder.add(state, 'textureColorSpace', ['sRGB', 'Linear']).onChange(() => bim.updateTexturesColorSpace(state.textureColorSpace))
		texturesFolder.add(state, 'outputColorSpace', ['sRGB', 'Linear']).onChange(() => bim.updateOutputColorSpace(state.outputColorSpace))
		//#endregion Textures

		//#region Environments
		const environmentsFolder = gui.addFolder('Environments')
		const environmentNames = Environments.map((env) => env.name)
		environmentsFolder.add(state, 'background').onChange(() => bim.updateEnvironment(state.environment, state.background))
		environmentsFolder
			.add(state, 'environment', environmentNames)
			.onChange(() => bim.updateEnvironment(state.environment, state.background))
		environmentsFolder
			.addColor(state, 'backgroundColor1')
			.onChange(() => bim.updateBackground(state.backgroundColor1, state.backgroundColor2))
		environmentsFolder
			.addColor(state, 'backgroundColor2')
			.onChange(() => bim.updateBackground(state.backgroundColor1, state.backgroundColor2))
		//#endregion Environments

		//#region Lights
		const lightingFolder = gui.addFolder('Lights')
		lightingFolder.add(state, 'addLights').onChange(() => bim.updateLights('addLights', state.addLights))
		lightingFolder.addColor(opts, 'ambientColor').onChange(() => bim.updateLights('ambientColor', opts.ambientColor))
		lightingFolder.add(opts, 'ambientIntensity', 0, 2).onChange(() => bim.updateLights('ambientIntensity', opts.ambientIntensity))
		lightingFolder.addColor(opts, 'directColor').onChange(() => bim.updateLights('directColor', opts.directColor))
		lightingFolder.add(opts, 'directIntensity', 0, 4).onChange(() => bim.updateLights('directIntensity', opts.directIntensity))
		//#endregion Lights

		//#region Animations
		this.animationsFolder = gui.addFolder('Animations')
		this.animationsFolder.domElement.style.display = 'none'

		//#endregion Animations

		//#region Morph Targets
		this.morphsFolder = gui.addFolder('Morph Targets')
		this.morphsFolder.domElement.style.display = 'none'
		//#endregion Morph Targets

		//#region Cameras
		this.camerasFolder = gui.addFolder('Cameras')
		this.camerasFolder.domElement.style.display = 'none'
		//#endregion Cameras

		//#region Performance
		this.stats = new Stats()
		this.stats.dom.style.cssText = 'position:static;height:48px'
		const performanceFolder = gui.addFolder('Performance')
		const performmanceLi = document.createElement('li')
		performmanceLi.appendChild(this.stats.dom)
		performmanceLi.id = 'bim-gui-stats'
		// @ts-ignore
		performanceFolder.__ul.appendChild(performmanceLi)
		performanceFolder.open()
		//#endregion Performance

		//#region Push DOM
		this.domElement = document.createElement('div')
		this.domElement.id = 'bim-gui'
		this.domElement.appendChild(gui.domElement)
		bim.domElement?.appendChild(this.domElement)
		kiosk && gui.close()
		//#endregion Push DOM

		this.gui = gui
		this.state = state
		this.actionStates = {}
	}

	// @overwrite
	render() {
		this.stats.update()
	}

	// @overwrite
	update() {
		this.createDomElement()
		this.updateCamerasFolder()
		this.updateMorphsFolder()
		this.updateAnimationsFolder()
		this.show()
	}

	updateCamerasFolder() {
		if (this.cameraCtrl) this.cameraCtrl.remove()

		const { cameras } = this.bimViewer
		if (cameras.length == 0) {
			this.camerasFolder?.hide()
		} else {
			this.camerasFolder.domElement.style.display = ''
			this.cameraCtrl = this.camerasFolder.add(this.state, 'camera', ['[default]'].concat(cameras.map((mesh) => mesh.name)))
			this.cameraCtrl.onChange((name) => this.updateCamera(name))
		}
	}

	updateMorphsFolder() {
		this.morphCtrls.forEach((ctrl) => ctrl.remove())
		this.morphCtrls = []

		const { morphs } = this.bimViewer
		if (morphs.length == 0) {
			this.morphsFolder?.hide()
		} else {
			this.morphsFolder.domElement.style.display = ''
			for (const mesh of morphs) {
				const s = mesh.morphTargetInfluences || []
				const l = s.length || 0
				if (l > 0) {
					const ctrl = this.morphsFolder.add({ name: mesh.name || 'Untitled' }, 'name')
					this.morphCtrls.push(ctrl)
				}
				for (let i = 0; i < l; i++) {
					const ctrl = this.morphsFolder.add(s, i, 0, 1, 0.01).listen()
					s.forEach((value, key) => key && value === i && ctrl.name(key + ''))
					this.morphCtrls.push(ctrl)
				}
			}
		}
	}

	updateAnimationsFolder() {
		this.animCtrls.forEach((ctrl) => ctrl.remove())
		this.animCtrls = []

		const bim = this.bimViewer
		const { mixer, clips } = bim
		if (clips.length == 0) {
			this.animationsFolder.hide()
		} else {
			this.animCtrls.push(
				this.animationsFolder.add(this.state, 'playbackSpeed', 0, 1).onChange(() => bim.updatePlaybackSpeed(this.state.playbackSpeed))
			)
			this.animCtrls.push(this.animationsFolder.add({ playAll: () => bim.playAllClips() }, 'playAll'))

			this.actionStates = {}
			this.animationsFolder.domElement.style.display = ''

			clips.forEach((clip, clipIndex) => {
				// Autoplay the first clip.
				this.actionStates[clip.name] = clipIndex === 0
				let action = clipIndex === 0 ? mixer?.clipAction(clip).play() : null
				// Play other clips when enabled.
				this.animCtrls.push(
					this.animationsFolder!.add(this.actionStates, clip.name)
						.listen()
						.onChange((playAnimation) => {
							action = action || mixer?.clipAction(clip)
							if (action) {
								action.setEffectiveTimeScale(1)
								playAnimation ? action.play() : action.stop()
							}
						})
				)
			})
		}
	}

	// @overwrite
	show() {
		this.domElement.style.visibility = ''
	}

	// @overwrite
	hide() {
		this.domElement.style.visibility = 'hidden'
	}

	// @overwrite
	onResize() {}

	// @overwrite
	dispose() {
		if (this.domElement) {
			this.bimViewer.domElement.removeChild(this.domElement)
			this.domElement = null as any
		}
	}
}

export interface BimWidgetGUIViewOptions extends GUIParams {
	domElement?: HTMLElement
	visibility?: 'hidden' | 'visible'
	kiosk?: boolean
}

export { BimWidgetGUIView }
