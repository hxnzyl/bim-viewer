/**
 * @Source https://github.com/mattdesl/three-vignette-background
 * @License MIT
 */

import { Color, DoubleSide, IUniform, Mesh, PlaneGeometry, RawShaderMaterial, Vector2 } from 'three'
import { BimRender } from '../../core/Render'
import { BimViewer } from '../../core/Viewer'
import { StringObject } from '../../types'
import { isIOS } from '../../utils/detect'
import { extend } from '../../utils/extend'
// @ts-ignore
import frag from './shader.frag'
// @ts-ignore
import vert from './shader.vert'

class BimHelperVignetteBackground extends BimRender {
	static Uniforms: StringObject<keyof BimHelperVignetteBackgroundUniforms> = {
		color1: 'c',
		color2: 'c',
		smooth: 'v2',
		offset: 'v2',
		scale: 'v2',
		aspect: 'f',
		grainScale: 'f',
		grainTime: 'f',
		noiseAlpha: 'f',
		aspectCorrection: 'b'
	}
	static Options: BimHelperVignetteBackgroundOptions = {
		color1: new Color(0xffffff),
		color2: new Color(0x283844),
		smooth: new Vector2(0.0, 1.0),
		offset: new Vector2(0, 0),
		scale: new Vector2(1, 1),
		aspect: 1,
		grainScale: isIOS() ? 0 : 0.001,
		grainTime: 0,
		noiseAlpha: 0.25,
		aspectCorrection: false
	}

	name = 'VignetteBackground'
	options = {} as Required<BimHelperVignetteBackgroundOptions>

	mesh!: Mesh
	geometry!: PlaneGeometry
	material!: RawShaderMaterial

	// @overwrite
	constructor(options?: BimHelperVignetteBackgroundOptions) {
		super()
		this.setOptions(options)
	}

	// @overwrite
	initialize(viewer: BimViewer) {
		if (this.bimViewer) return
		this.bimViewer = viewer
		this.geometry = new PlaneGeometry(2, 2, 1)
		this.material = new RawShaderMaterial({
			vertexShader: vert,
			fragmentShader: frag,
			side: DoubleSide,
			depthTest: false,
			uniforms: Object.keys(BimHelperVignetteBackground.Uniforms).reduce(
				(unis, key) => ((unis[key] = { value: this.options[key as keyof BimHelperVignetteBackgroundOptions] }), unis),
				{} as { [uniform: string]: IUniform }
			)
		})
		this.mesh = new Mesh(this.geometry, this.material)
		this.mesh.name = 'bim-helper-vignette-background-mesh'
		this.mesh.frustumCulled = false
		this.mesh.renderOrder = -1
	}

	// @overwrite
	setOptions(options?: BimHelperVignetteBackgroundOptions) {
		this.options = extend(true, {}, BimHelperVignetteBackground.Options, options || {})
	}

	// @overwrite
	render() {}

	// @overwrite
	update(uniforms?: BimHelperVignetteBackgroundUniforms) {
		if (this.material && uniforms) {
			Object.keys(uniforms).forEach((key: string) => {
				const keyAs = key as keyof BimHelperVignetteBackgroundUniforms
				this.material.uniforms[key].value = uniforms[keyAs]
			})
		}
		this.show()
	}

	// @overwrite
	show() {
		this.bimViewer.scene.add(this.mesh)
	}

	// @overwrite
	hide() {
		this.bimViewer.scene.remove(this.mesh)
	}

	// @overwrite
	onResize() {
		this.material.uniforms.aspect.value = this.bimViewer.clientWidth / this.bimViewer.clientHeight
	}

	// @overwrite
	dispose() {
		if (this.material) {
			this.bimViewer.scene.remove(this.mesh)
			this.material.dispose()
			this.material = null as any
		}
	}
}

export type BimHelperVignetteBackgroundUniforms = {
	color1: Color
	color2: Color
	smooth?: Vector2
	offset?: Vector2
	scale?: Vector2
	aspect?: number
	grainScale?: number
	grainTime?: number
	noiseAlpha?: number
	aspectCorrection?: boolean
}

export interface BimHelperVignetteBackgroundOptions extends BimHelperVignetteBackgroundUniforms {
	// geometry?: PlaneGeometry
}

export { BimHelperVignetteBackground }

