import { Camera, OrthographicCamera, Scene, Vector3, WebGLRenderer } from 'three'
import { BimWidgetCubeData } from './Data'

class BimWidgetCubeRender {
	domElement: HTMLElement
	bimCubeData: BimWidgetCubeData
	camera: OrthographicCamera
	renderer: WebGLRenderer
	cameraTarget: Vector3
	activeScene?: Scene

	constructor(domElement: HTMLElement, cubeData: BimWidgetCubeData) {
		this.domElement = domElement
		this.bimCubeData = cubeData
		this.camera = new OrthographicCamera(-110, 110, 110, -110, 0.01, 500)
		this.camera.position.set(0, 0, 200)
		this.renderer = new WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
		this.domElement.appendChild(this.renderer.domElement)
		const style = this.domElement.style,
			width = this.domElement.offsetWidth || parseFloat(style.width.replace('px', '')),
			height = this.domElement.offsetHeight || parseFloat(style.height.replace('px', ''))
		this.renderer.setSize(width, height)
		this.cameraTarget = new Vector3(0, 0, 0)
	}

	getActiveCamera() {
		return this.camera
	}

	setActiveScene(scene: Scene) {
		this.activeScene = scene
	}

	render(camera?: Camera) {
		if (camera) {
			this.camera.position.copy(new Vector3(0, 0, 200).applyQuaternion(camera.quaternion))
			this.camera.up.copy(camera.up)
			this.camera.lookAt(this.cameraTarget)
			this.camera.updateMatrixWorld()
		}
		const scene = this.activeScene || this.bimCubeData.getScene()
		this.renderer.autoClear = true
		this.renderer.render(scene, this.camera)
	}

	dispose() {
		if (this.renderer) {
			this.domElement.removeChild(this.renderer.domElement)
			this.renderer.dispose()
			this.renderer = null as any
		}
	}
}

export { BimWidgetCubeRender }

