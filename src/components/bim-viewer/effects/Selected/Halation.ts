import {
	BoxHelper,
	Color,
	ColorRepresentation,
	Intersection,
	Material,
	Mesh,
	MeshPhongMaterial,
	MeshStandardMaterial,
	Object3D,
	Vector2
} from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { BimRender } from '../../core/Render'
import { BimViewer } from '../../core/Viewer'
import { extend } from '../../utils/extend'
import { materialToArray } from '../../utils/three'

class BimEffectSelectedHalation extends BimRender {
	static Options: BimEffectSelectedHalationOptions = {
		//选中盒子边框颜色
		selectedColor: 0xffffff,
		// 呼吸显示的颜色
		visibleEdgeColor: 0xffffff,
		// 呼吸消失的颜色
		hiddenEdgeColor: 0x000000
	}

	name = 'SelectedHalation'
	colorBuffers: { [key: number]: number } = {}
	options = {} as Required<BimEffectSelectedHalationOptions>

	selectedObject?: Mesh
	boxHelper?: BoxHelper

	composer!: EffectComposer
	renderPass!: RenderPass
	outlinePass!: OutlinePass
	shaderPass!: ShaderPass

	// @overwrite
	constructor(options?: BimEffectSelectedHalationOptions) {
		super()
		this.setOptions(options)
	}

	// @overwrite
	initialize(viewer: BimViewer) {
		if (this.bimViewer) return

		this.bimViewer = viewer
		const { renderer, scene, camera, clientWidth, clientHeight } = viewer
		const { visibleEdgeColor, hiddenEdgeColor } = this.options

		// 创建一个EffectComposer（效果组合器）对象，然后在该对象上添加后期处理通道。
		this.composer = new EffectComposer(renderer)

		// 新建一个场景通道  为了覆盖到原理来的场景上
		this.renderPass = new RenderPass(scene, camera)
		this.composer.addPass(this.renderPass)

		// 物体边缘发光通道
		this.outlinePass = new OutlinePass(new Vector2(clientWidth, clientHeight), scene, camera)
		this.outlinePass.edgeStrength = 10.0 // 边框的亮度
		this.outlinePass.edgeGlow = 1 // 光晕[0,1]
		this.outlinePass.usePatternTexture = false // 是否使用父级的材质
		this.outlinePass.edgeThickness = 0.5 // 边框宽度
		this.outlinePass.downSampleRatio = 2 // 边框弯曲度
		this.outlinePass.pulsePeriod = 5 // 呼吸闪烁的速度
		if (visibleEdgeColor) this.outlinePass.visibleEdgeColor.set(visibleEdgeColor) // 呼吸显示的颜色
		if (hiddenEdgeColor) this.outlinePass.hiddenEdgeColor.set(hiddenEdgeColor) // 呼吸消失的颜色
		this.outlinePass.clear = true
		this.composer.addPass(this.outlinePass)

		// 自定义的着色器通道 作为参数
		this.shaderPass = new ShaderPass(FXAAShader)
		this.shaderPass.uniforms.resolution.value.set(1 / viewer.clientWidth, 1 / viewer.clientHeight)
		this.shaderPass.renderToScreen = true
		this.composer.addPass(this.shaderPass)
	}

	// @overwrite
	setOptions(options?: BimEffectSelectedHalationOptions) {
		this.options = extend(true, {}, BimEffectSelectedHalation.Options, options || {})
	}

	// @overwrite
	render() {
		this.composer.render()
	}

	// @overwrite
	show() {
		if (!this.selectedObject) return

		const { selectedColor = '' } = this.options

		materialToArray(this.selectedObject.material).forEach((material: Material) => {
			if (material instanceof MeshStandardMaterial || material instanceof MeshPhongMaterial) {
				if (material.emissive) {
					// @ts-ignore
					material._emissiveHex = material._emissiveHex || material.emissive.getHex()
					material.emissive.set(selectedColor)
				} else {
					material.emissive = new Color(selectedColor)
				}
			}
		})

		if (this.outlinePass) {
			this.outlinePass.selectedObjects = [this.selectedObject]
		}

		if (this.boxHelper) {
			this.boxHelper.setFromObject(this.selectedObject)
		} else {
			this.boxHelper = new BoxHelper(this.selectedObject, selectedColor)
			this.bimViewer.scene.add(this.boxHelper)
		}
	}

	// @overwrite
	hide() {
		if (this.selectedObject) {
			materialToArray(this.selectedObject.material).forEach((material: Material) => {
				// @ts-ignore
				if (material._emissiveHex) {
					// @ts-ignore
					material.emissive.set(material._emissiveHex)
				}
			})
		}

		if (this.outlinePass) {
			this.outlinePass.selectedObjects = []
		}

		if (this.boxHelper) {
			this.bimViewer.scene.remove(this.boxHelper)
		}
	}

	// @overwrite
	dispose() {
		if (this.composer) {
			this.clearSelectedObject()
			this.composer.dispose()
			this.composer = null as any
		}
	}

	// @overwrite
	updateRaycaster(object: Intersection<Object3D>) {
		object instanceof Mesh ? this.setSelectedObject(object) : this.clearSelectedObject()
	}

	setSelectedObject(object: Mesh) {
		this.selectedObject = object
		this.show()
	}

	clearSelectedObject() {
		this.hide()
		this.selectedObject = undefined
		this.boxHelper = undefined
	}
}

export interface BimEffectSelectedHalationOptions {
	//选中盒子边框颜色
	selectedColor?: ColorRepresentation
	// 呼吸显示的颜色
	visibleEdgeColor?: ColorRepresentation
	// 呼吸消失的颜色
	hiddenEdgeColor?: ColorRepresentation
}

export { BimEffectSelectedHalation }
