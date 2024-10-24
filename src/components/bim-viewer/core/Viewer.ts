import { Easing, Tween } from '@tweenjs/tween.js'
import {
    AmbientLight,
    AnimationClip,
    AnimationMixer,
    Box3,
    Cache,
    Camera,
    ColorRepresentation,
    DirectionalLight,
    EventDispatcher,
    Group,
    Light,
    LineBasicMaterial,
    LinearSRGBColorSpace,
    LoadingManager,
    Material,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    MeshPhongMaterial,
    MeshPhysicalMaterial,
    MeshStandardMaterial,
    Object3D,
    Object3DEventMap,
    PMREMGenerator,
    PerspectiveCamera,
    Raycaster,
    SRGBColorSpace,
    Scene,
    Skeleton,
    SkeletonHelper,
    SkinnedMesh,
    Texture,
    UnsignedByteType,
    Vector2,
    Vector3,
    WebGLRenderer
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { Environment, Environments } from '../config/Environments'
import { BimHelperVignetteBackground } from '../helpers/Vignette/Background'
import { assertUrl } from '../utils/detect'
import { extend } from '../utils/extend'
import { materialToArray } from '../utils/three'
import { BimRender, BimRenders } from './Render'

import { EventListenerQueue } from 'events-ns'

Cache.enabled = true

class BimViewer extends EventDispatcher<{ [key: string]: { data: any } }> {
	static Options: BimViewerOptions = {
		// domElement: undefined,
		visibility: 'hidden',
		width: '',
		height: '',
		kiosk: false,
		model: '',
		preset: '',
		renderLifeTime: 3, //渲染的生命周期(秒)
		//助手
		helpers: [],
		//效果器
		effects: [],
		//组件
		widgets: [],
		//相机配置项
		// position: undefined, //初始定位，默认居中
		near: 0.01, //
		far: 1000, //渲染范围
		fov: 60,
		// 环境光
		ambientColor: 0xffffff,
		ambientIntensity: 1,
		// 平行光
		directColor: 0xffffff,
		directIntensity: 0.5
	}

	eventQueue!: EventListenerQueue
	domElement!: HTMLElement
	renderer!: WebGLRenderer
	controls!: OrbitControls
	camera!: PerspectiveCamera
	scene!: Scene
	raycaster!: Raycaster
	environment!: Environment
	lockRenderTimer?: NodeJS.Timeout
	renderBinded!: (prevTime: number) => void
	unlockRenderBinded!: () => void
	lockRenderBinded!: () => void
	onClickBinded!: (event: any) => void
	onResizeBinded!: () => NodeJS.Timeout

	object?: Group<Object3DEventMap>
	objectCenter!: Vector3
	mixer?: AnimationMixer
	tween?: Tween

	renderTimer: number = 0
	clientWidth: number = 0
	clientHeight: number = 0
	objectSize: number = 0
	prevTime: number = 0
	renderCount: number = 0
	options = {} as Required<BimViewerOptions>
	effects: BimRenders = {}
	widgets: BimRenders = {}
	helpers: BimRenders = {}
	skeletonHelpers: SkeletonHelper[] = []
	clips: AnimationClip[] = []
	lights: Light[] = []
	meshes: Mesh[] = []
	morphs: Mesh[] = []
	cameras: Camera[] = []
	skeletons: Skeleton[] = []
	materials: Material[] = []

	constructor(options?: BimViewerOptions) {
		super()
		this.initialize(options)
	}

	initialize(options?: BimViewerOptions) {
		if (!options) return
		//设置参数
		this.prevTime = Date.now()
		this.setOptions(options)
		//创建DOM
		this.createDomElement()
		//设置事件
		this.setEvent()
		//设置渲染
		this.setRender()
		//设置场景
		this.setScene()
		//设置相机
		this.setCamera()
		//设置控制器
		this.setControls()
		//设置反射
		this.setRaycaster()
		//设置环境
		this.setEnvironment()
		//设置助手
		this.setHelpers()
		//设置部件
		this.setWidgets()
		//设置效果器
		this.setEffects()
		//添加事件
		this.eventQueue.addEventListener()
	}

	setOptions(options?: BimViewerOptions) {
		this.options = extend(true, {}, BimViewer.Options, options || {})
	}

	//#region Event
	setEvent() {
		this.onClickBinded = this.onClick.bind(this)
		// this.onMousemoveBinded = this.onMousemove.bind(this)
		this.renderBinded = this.render.bind(this)
		this.unlockRenderBinded = this.unlockRender.bind(this)
		this.lockRenderBinded = this.lockRender.bind(this)
		this.onResizeBinded = () => setTimeout(this.onResize.bind(this), 16.7)
		this.eventQueue = new EventListenerQueue([])
		this.eventQueue.push(this.domElement, 'click', this.onClickBinded, false)
		// this.eventQueue.push(this.domElement, 'mousemove', this.onMousemoveBinded, false)
		this.eventQueue.push(window, 'resize', this.onResizeBinded, false)
	}

	onResize() {
		if (!this.updateDomElementSize()) return

		this.unlockRender()

		this.camera.aspect = this.clientWidth / this.clientHeight
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(this.clientWidth, this.clientHeight)

		this.applyHelpers('onResize')
		this.applyWidgets('onResize')
	}

	onClick(event: MouseEvent) {
		this.onMousemove(event)
	}

	onMousemove(event: MouseEvent) {
		this.unlockRender()
		this.updateRaycaster(
			new Vector2((event.clientX / this.clientWidth) * 2 - 1, -(event.clientY / this.clientHeight) * 2 + 1)
		)
	}
	//#endregion Event

	//#region Content
	createDomElement() {
		if (this.domElement) return
		const { width, height, visibility, domElement } = this.options
		let el = domElement || document.getElementById('bim-viewer')
		if (!el) (el = document.createElement('div')), document.body.appendChild(el)
		el.style.cssText = `visibility:${visibility};width:${width};height:${height}`
		el.id = 'bim-viewer'
		this.domElement = el
		this.updateDomElementSize()
	}

	updateDomElementSize() {
		const { clientWidth, clientHeight } = this.domElement
		if (clientWidth === this.clientWidth && clientHeight === this.clientHeight) return false
		this.clientWidth = clientWidth
		this.clientHeight = clientHeight
		return true
	}

	loadUrl(url: string, rootPath: string = '/') {
		assertUrl(url)

		const manager = new LoadingManager()
		manager.setURLModifier((url: string) => rootPath + url)

		const isObj = url.includes('.obj')
		const loader = isObj
			? new OBJLoader(manager)
			: new GLTFLoader(manager)
					.setCrossOrigin('anonymous')
					.setDRACOLoader(new DRACOLoader(manager).setDecoderPath('wasm/'))
					.setKTX2Loader(new KTX2Loader(manager).setTranscoderPath('wasm/').detectSupport(this.renderer))
					.setMeshoptDecoder(MeshoptDecoder)

		loader.load(
			url,
			(data: GLTF | Group<Object3DEventMap>) => {
				const dataAsGLTF = data as GLTF
				const dataAsGroup = data as Group<Object3DEventMap>

				const scene: Group<Object3DEventMap> = isObj ? dataAsGroup : dataAsGLTF.scene || dataAsGLTF.scenes[0]

				this.update(scene, data.animations)

				// See: https://github.com/google/draco/issues/349
				// DRACOLoader.releaseDecoderModule();

				this.dispatchEvent({ type: 'loaded', data })
			},
			(data) => {
				this.dispatchEvent({ type: 'progress', data })
			},
			(error: any) => {
				const message = error?.message || error + ''
				if (message.match(/ProgressEvent/)) {
					error.message = 'Unable to retrieve this file. Check JS console and browser network tab.'
				} else if (message.match(/Unexpected token/)) {
					error.message = `Unable to parse file content. Verify that this file is valid. Error: "${message}"`
				} else if (error && error.target && error.target instanceof Image) {
					error.message = 'Missing texture: ' + error.target.src.split('/').pop()
				}
				this.dispatchEvent({ type: 'error', data: error })
			}
		)

		return this
	}

	update(object: Group<Object3DEventMap>, clips: AnimationClip[]) {
		this.hide()

		const { position } = this.options

		const box = new Box3().setFromObject(object)
		const size = box.getSize(new Vector3()).length()
		const center = box.getCenter(new Vector3())

		this.object = object
		this.objectCenter = center
		this.objectSize = size

		this.controls.reset()
		this.controls.maxDistance = size * 10

		// object.position.add(new Vector3().copy(object.position).sub(center))

		this.camera.near = size / 100
		this.camera.far = size * 100
		this.camera.updateProjectionMatrix()

		if (position) {
			this.camera.position.fromArray(position)
			this.camera.lookAt(new Vector3())
		} else {
			this.camera.position.addVectors(this.objectCenter, new Vector3(size / 2, size / 2, size / 2))
			this.camera.lookAt(center)
		}

		this.controls.enabled = true
		this.controls.saveState()

		this.lights = []
		this.skeletons = []
		this.meshes = []
		this.materials = []
		this.morphs = []
		this.cameras = []

		this.object.traverse((node: Object3D<Object3DEventMap>) => {
			// 设置模型生成阴影并接收阴影
			node.castShadow = true
			node.receiveShadow = true
			// 灯光
			if (node instanceof Light) {
				this.lights.push(node)
			}
			// 相机
			else if (node instanceof Camera) {
				node.name = node.name || `BimViewer_Camera_${this.cameras.length + 1}`
				this.cameras.push(node)
			}
			// 网格
			else if (node instanceof Mesh) {
				const mesh = node as Mesh
				this.meshes.push(mesh)
				// 网格材料
				const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
				materials.forEach((material: Material) => {
					// TODO(https://github.com/mrdoob/three.js/pull/18235): Clean up.
					material.depthWrite = !material.transparent
					// 放射光颜色与放射光贴图 不设置可能导致黑模
					if (material instanceof MeshStandardMaterial || material instanceof MeshPhongMaterial) {
						material.emissive = material.color
						material.emissiveMap = material.emissiveMap || material.map
						this.updateTextureColorSpace(material, SRGBColorSpace)
					}
					this.materials.push(material)
				})
				// 变形动画
				if (mesh.morphTargetInfluences) {
					this.morphs.push(mesh)
				}
				// 骨骼
				if (mesh instanceof SkinnedMesh) {
					this.skeletons.push(mesh.skeleton)
				}
			}
		})

		this.updateLights('addLights', true)

		this.updateClips(clips)

		this.applyHelpers('update')
		this.applyWidgets('update')

		this.show()

		// 开始渲染
		this.startRender()
	}

	show() {
		if (this.object) {
			this.domElement.style.visibility = ''
			this.scene.add(this.object)
		}
	}

	hide() {
		if (this.object) {
			this.domElement.style.visibility = 'hidden'
			this.scene.remove(this.object)
		}
	}

	clear() {
		if (this.object) {
			this.scene.remove(this.object)
			this.object = undefined
		}
	}

	dispose() {
		if (!this.renderer) return

		cancelAnimationFrame(this.renderTimer)

		this.clear()

		this.applyHelpers('dispose')
		this.applyEffects('dispose')
		this.applyWidgets('dispose')

		this.eventQueue.removeAllEventListeners()

		this.renderer.dispose()

		this.domElement.removeChild(this.renderer.domElement)

		this.renderer = null as any
	}
	//#endregion Content

	//#region Render
	setRender() {
		if (!this.domElement) return

		this.prevTime = 0
		this.renderCount = 0

		this.renderer = new WebGLRenderer({
			//canvas是否包含alpha (透明度)。默认为 false
			alpha: true,
			//是否执行抗锯齿。默认为false
			antialias: true,
			//着色器精度。渲染成图片的颜色精度。值：highp/mediump/lowp。默认为highp
			precision: 'highp',
			//提示用户代理怎样的配置更适用于当前WebGL环境。可能是high-performance,low-power或default。默认是default
			powerPreference: 'high-performance',
			//是否保留缓直到手动清除或被覆盖。默认false
			preserveDrawingBuffer: true,
			//是否使用对数深度缓存。如果要在单个场景中处理巨大的比例差异，就有必要使用。默认false
			logarithmicDepthBuffer: true
		})

		this.renderer.outputColorSpace = SRGBColorSpace

		this.renderer.setClearColor(0xffffff, 1)
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.renderer.setSize(this.clientWidth, this.clientHeight)

		this.domElement?.appendChild(this.renderer.domElement)
	}

	setControls() {
		if (!this.domElement) return

		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.controls.autoRotate = false
		this.controls.autoRotateSpeed = -10
		this.controls.screenSpacePanning = true

		this.eventQueue.push(this.controls, 'change', this.unlockRenderBinded, 'controls-change')
	}

	render(prevTime: number) {
		const dt = (prevTime - this.prevTime) / 1000

		if (this.renderCount > 0) {
			this.controls?.update()
			this.mixer?.update(dt)

			this.renderer.render(this.scene, this.camera)

			this.applyHelpers('render')
			this.applyEffects('render')
			this.applyWidgets('render')

			this.tween?.update()
		}

		this.renderTimer = requestAnimationFrame(this.renderBinded)

		this.prevTime = prevTime
	}

	startRender() {
		if (!this.renderTimer) {
			console.info('BimBuilder: render start.', Date.now())
			this.render(this.prevTime)
		}
	}

	pauseRender() {
		if (this.renderTimer) {
			console.info('BimBuilder: render pause.', Date.now())
			cancelAnimationFrame(this.renderTimer)
			this.renderTimer = 0
		}
	}

	unlockRender() {
		if (this.renderCount++ == 0) console.info('BimBuilder: render unlock.', Date.now())
		//无论什么情况下都要清除定时器，否则会掉帧
		clearTimeout(this.lockRenderTimer)
		const { renderLifeTime = 1 } = this.options
		// @ts-ignore
		this.lockRenderTimer = setTimeout(this.lockRenderBinded, renderLifeTime * 1000)
	}

	lockRender() {
		if (this.renderCount > 0) {
			console.info('BimBuilder: render lock.', Date.now())
			clearTimeout(this.lockRenderTimer)
			this.renderCount = 0
		}
	}
	//#endregion Render

	//#region Scene
	setScene() {
		this.scene = new Scene()
		this.eventQueue.push(this.scene, 'added', this.unlockRenderBinded, 'scene-added')
	}

	setCamera() {
		const { near, far, fov } = this.options
		const aspect = this.clientWidth / this.clientHeight
		this.camera = new PerspectiveCamera(fov, aspect, near, far)
		this.scene.add(this.camera)
	}

	updateCamera(name: string) {
		// @TODO
	}

	setRaycaster() {
		this.raycaster = new Raycaster()
	}

	updateRaycaster(coords: Vector2) {
		this.raycaster.setFromCamera(coords, this.camera)
		// gltf文件需要深度查找
		// const objects = this.raycaster.intersectObjects(this.scene.children, true)
		const object = this.raycaster.intersectObject(this.scene, true)
		this.applyEffects('updateRaycaster', object)
	}
	//#endregion Scene

	//#region Effects
	setEffects() {
		this.effects = {}
		this.options.effects.forEach((effect) => {
			effect.initialize(this)
			this.effects[effect.name] = effect
		})
	}

	applyEffects(name: keyof BimRender, params?: any) {
		let key
		for (key in this.effects) {
			// @ts-ignore
			this.effects[key][name](params)
		}
		if (key) this.unlockRender()
	}
	//#endregion Effects

	//#region Widgets
	setWidgets() {
		this.widgets = {}
		this.options.widgets.forEach((widget) => {
			widget.initialize(this)
			this.widgets[widget.name] = widget
		})
	}

	applyWidgets(name: keyof BimRender) {
		let key
		for (key in this.widgets) {
			// @ts-ignore
			this.widgets[key][name]()
		}
		if (key) this.unlockRender()
	}
	//#endregion Widgets

	//#region Helpers
	setHelpers() {
		this.helpers = {}
		this.options.helpers.forEach((helper) => {
			helper.initialize(this)
			this.helpers[helper.name] = helper
		})
	}

	applyHelpers(name: keyof BimRender) {
		let key
		for (key in this.helpers) {
			// @ts-ignore
			this.helpers[key][name]()
		}
		if (key) this.unlockRender()
	}

	updateGrid(grid: boolean) {
		const gridHelper = this.helpers.LineGrid
		if (gridHelper) {
			grid ? gridHelper.show() : gridHelper.hide()
		}
	}

	updateBackground(color1: ColorRepresentation, color2: ColorRepresentation) {
		const backgroundHelper = this.helpers.VignetteBackground as BimHelperVignetteBackground
		if (backgroundHelper) {
			backgroundHelper.update({
				color1,
				color2
			})
		}
	}
	//#endregion Helpers

	//#region Environment
	setEnvironment() {
		this.environment = Environments[0]
	}

	updateEnvironment(name: string, background: boolean) {
		const environment = Environments.find((entry) => entry.name === name)
		if (!environment) return
		const { path } = environment,
			resolve = (envMap: Texture | null) => {
				const backgroundHelper = this.helpers.VignetteBackground
				if (backgroundHelper) {
					if (!envMap || !background) {
						backgroundHelper.show()
					} else {
						backgroundHelper.hide()
					}
				}
				this.scene.background = background ? envMap : null
				this.scene.environment = envMap
			}
		if (path) {
			new RGBELoader().setDataType(UnsignedByteType).load(path, (texture) => {
				const pmremGenerator = new PMREMGenerator(this.renderer)
				pmremGenerator.compileEquirectangularShader()
				const envMap = pmremGenerator.fromEquirectangular(texture).texture
				pmremGenerator.dispose()
				resolve(envMap)
			})
		} else {
			resolve(null)
		}
	}
	//#endregion Environment

	//#region Animate
	rotateTo(toPosition: Vector3, toUp: Vector3) {
		if (!this.object) return

		this.controls.enabled = false

		const { position, up } = this.camera
		const { target } = this.controls

		const toTarget = this.objectCenter.normalize()
		toPosition.subVectors(toTarget, toPosition.setLength(this.objectSize))

		const _this = this

		this.tween = new Tween({
			x1: position.x,
			y1: position.y,
			z1: position.z,
			x2: target.x,
			y2: target.y,
			z2: target.z,
			x3: up.x,
			y3: up.y,
			z3: up.z
		})

		this.tween.to(
			{
				x1: toPosition.x,
				y1: toPosition.y,
				z1: toPosition.z,
				x2: toTarget.x,
				y2: toTarget.y,
				z2: toTarget.z,
				x3: toUp.x,
				y3: toUp.y,
				z3: toUp.z
			},
			500
		)

		this.tween.easing(Easing.Cubic.InOut)

		this.tween.onUpdate(function (p) {
			_this.unlockRender()
			position.x = p.x1
			position.y = p.y1
			position.z = p.z1
			target.x = p.x2
			target.y = p.y2
			target.z = p.z2
			up.x = p.x3
			up.y = p.y3
			up.z = p.z3
		})

		this.tween.onComplete(function () {
			_this.controls.enabled = true
		})

		this.tween.start()
	}

	updateClips(clips: AnimationClip[]) {
		if (this.object) {
			this.removeClips()
			this.clips = clips
			this.mixer = clips.length > 0 ? new AnimationMixer(this.object) : undefined
		}
	}

	updatePlaybackSpeed(playbackSpeed: number) {
		if (this.mixer) {
			this.mixer.timeScale = playbackSpeed
		}
	}

	playAllClips() {
		if (this.mixer) {
			this.clips.forEach((clip) => {
				this.mixer?.clipAction(clip).reset().play()
			})
		}
	}

	removeClips() {
		if (this.mixer) {
			this.mixer.stopAllAction().uncacheRoot(this.mixer.getRoot())
			this.mixer = undefined
		}
	}
	//#endregion Animate

	//#region Lights
	addLights() {
		const { ambientColor, ambientIntensity, directColor, directIntensity } = this.options

		// 环境光
		const light1 = new AmbientLight(ambientColor, ambientIntensity)
		light1.name = 'BimViewer_AmbientLight'
		this.scene.add(light1)

		// 方向光
		const light2 = new DirectionalLight(directColor, directIntensity)
		light2.position.set(0.5, 0, 0.866) // ~60º
		light2.name = 'BimViewer_DirectionalLight'
		this.scene.add(light2)

		this.lights.push(light1, light2)
	}

	updateLights(type: string, value: any) {
		switch (type) {
			case 'addLights':
				const hasLights = this.lights.length > 0
				value ? hasLights || this.addLights() : hasLights && this.removeLights()
				break
			case 'exposure':
				this.renderer!.toneMappingExposure = value
				break
			case 'ambientIntensity':
				this.lights[0].intensity = value
				break
			case 'ambientColor':
				this.lights[0].color.setHex(value)
				break
			case 'directIntensity':
				this.lights[1].intensity = value
				break
			case 'directColor':
				this.lights[1].color.setHex(value)
				break
		}
	}

	removeLights() {
		this.lights.forEach((light) => light.parent?.remove(light))
		this.lights = []
	}
	//#endregion Lights

	//#region Display
	updateWireframe(wireframe: boolean) {
		this.materials.forEach((material) => {
			if (material instanceof MeshBasicMaterial || material instanceof MeshLambertMaterial) {
				material.wireframe = wireframe
			}
		})
	}

	updateSkeleton(skeleton: boolean) {
		const hasSkeleton = this.skeletonHelpers.length > 0
		skeleton ? hasSkeleton || this.addSkeletonHelpers() : hasSkeleton && this.removeSkeletonHelpers()
	}

	addSkeletonHelpers() {
		this.skeletons.forEach((skeleton) => {
			const object = skeleton.bones[0]?.parent
			if (!object) return
			const helper = new SkeletonHelper(object)
			materialToArray<LineBasicMaterial>(helper.material).forEach((material) => (material.linewidth = 3))
			this.scene?.add(helper)
			this.skeletonHelpers.push(helper)
		})
	}

	removeSkeletonHelpers() {
		this.skeletonHelpers.forEach((helper) => helper.parent?.remove(helper))
		this.skeletonHelpers = []
	}

	updateTexturesColorSpace(colorSpace: string) {
		this.materials.forEach((material) => {
			if (
				material instanceof MeshLambertMaterial ||
				material instanceof MeshPhongMaterial ||
				material instanceof MeshStandardMaterial ||
				material instanceof MeshPhysicalMaterial
			) {
				this.updateTextureColorSpace(material, colorSpace)
			}
		})
	}

	updateTextureColorSpace(material: MeshHasMapMaterial, colorSpace: string) {
		if (material.map) {
			material.map.colorSpace = colorSpace === 'sRGB' ? SRGBColorSpace : LinearSRGBColorSpace
		}
		if (material.emissiveMap) {
			material.emissiveMap.colorSpace = colorSpace === 'sRGB' ? SRGBColorSpace : LinearSRGBColorSpace
		}
		if (material.map || material.emissiveMap) {
			material.needsUpdate = true
		}
	}

	updateOutputColorSpace(colorSpace: string) {
		this.renderer.outputColorSpace = colorSpace === 'sRGB' ? SRGBColorSpace : LinearSRGBColorSpace
		this.materials.forEach((material) => (material.needsUpdate = true))
	}
	//#endregion Display
}

type MeshHasMapMaterial = MeshLambertMaterial | MeshPhongMaterial | MeshStandardMaterial | MeshPhysicalMaterial

export interface BimViewerOptions {
	domElement?: HTMLElement
	visibility?: 'hidden' | 'visible'
	width?: string | number
	height?: string | number
	kiosk?: boolean
	model?: string
	preset?: string
	//渲染的生命周期(秒)
	renderLifeTime?: number
	//助手
	helpers?: BimRender[]
	//效果器
	effects?: BimRender[]
	//组件
	widgets?: BimRender[]
	//初始定位，默认居中
	position?: []
	near?: number
	//渲染范围
	far?: number
	fov?: number
	// 环境光
	ambientColor?: number
	ambientIntensity?: number
	// 平行光
	directColor?: number
	directIntensity?: number
}

export { BimViewer }

