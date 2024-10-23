import { Raycaster, Vector2, Vector3 } from 'three'
import { BimViewer } from '../../core/Viewer'
import { BimWidgetCubeData } from './Data'
import { BimWidgetCubeMap } from './Map'
import { BimWidgetCubeRender } from './Render'
import { BimWidgetCubeRotate } from './Rotate'

class BimWidgetCubeEditor {
	domElement: HTMLElement
	bimCubeData: BimWidgetCubeData
	bimCubeRender: BimWidgetCubeRender
	bimViewer: BimViewer
	raycaster: Raycaster
	onMouseDownBinded: (event: MouseEvent) => void
	onMouseUpBinded: (event: MouseEvent) => void
	onMouseMoveBinded: (event: MouseEvent) => void

	mouseOffset?: Vector2

	lastHoverComponentId: string = ''
	mouseEnable: boolean = false
	mouseLock: boolean = false

	constructor(domElement: HTMLElement, cubeData: BimWidgetCubeData, cubeRender: BimWidgetCubeRender, viewer: BimViewer) {
		this.domElement = domElement
		this.bimCubeData = cubeData
		this.bimCubeRender = cubeRender
		this.bimViewer = viewer
		this.raycaster = new Raycaster()
		this.onMouseDownBinded = this.onMouseDown.bind(this)
		this.onMouseUpBinded = this.onMouseUp.bind(this)
		this.onMouseMoveBinded = this.onMouseMove.bind(this)
		domElement.addEventListener('mousemove', this.onMouseMoveBinded, false)
		domElement.addEventListener('mousedown', this.onMouseDownBinded, false)
	}

	onMouseDown(event: MouseEvent) {
		this.mouseEnable = true
		this.mouseOffset = new Vector2(event.offsetX, event.offsetY)
		window.addEventListener('mouseup', this.onMouseUpBinded, false)
	}

	onMouseMove(event: MouseEvent) {
		if (this.mouseEnable) return
		const i = this.canvasToNormalized(event.offsetX, event.offsetY),
			o = this.getComponentId(i),
			s = this.lastHoverComponentId
		if (!o) {
			this.lastHoverComponentId = ''
		} else if (o != s) {
			this.bimCubeData.getComponent(o)?.highlight()
			this.bimCubeRender.render()
			this.lastHoverComponentId = o
		}
		if (s && o != s) {
			this.bimCubeData.getComponent(s)?.cancelHighlight()
			this.bimCubeRender.render()
		}
	}

	onMouseUp(event: MouseEvent) {
		window.removeEventListener('mouseup', this.onMouseUpBinded)
		if (this.mouseEnable && this.mouseOffset) {
			if (this.mouseLock) return
			this.mouseLock = true
			setTimeout(() => (this.mouseLock = false), 1000)
			const { x, y } = this.mouseOffset
			this.mouseEnable = false
			this.mouseOffset = undefined
			if (event.offsetX == x && event.offsetY == y) {
				const s = this.canvasToNormalized(x, y),
					n = this.getComponentId(s),
					i = this.lastHoverComponentId
				if (n) {
					if (i) {
						this.bimCubeData.getComponent(i)?.cancelHighlight()
						this.lastHoverComponentId = ''
						this.bimCubeRender.render()
					}
					const rotate = BimWidgetCubeRotate[BimWidgetCubeMap[n]]
					this.bimViewer.rotateTo(new Vector3(...rotate[0]), new Vector3(...rotate[1]))
				}
			}
		}
	}

	canvasToNormalized(x: number, y: number) {
		const t = this.domElement.offsetWidth,
			i = this.domElement.offsetHeight
		return new Vector2((x / t) * 2 - 1, (-y / i) * 2 + 1)
	}

	getComponentId(vector: Vector2) {
		const camera = this.bimCubeRender.getActiveCamera()
		this.raycaster.setFromCamera(vector, camera)
		const meshes = this.bimCubeData.getMeshes(),
			objects = this.raycaster.intersectObjects(meshes, true),
			l = objects.length
		if (l > 0) {
			// @ts-ignore
			let s = objects[0].object.componentId
			if (l > 1) {
				// @ts-ignore
				const n = objects[1].object.componentId
				if (4 == s.length && 2 == n.length && objects[1].distance < objects[0].distance + 5) {
					s = n
				}
			}
			return s
		}
		return ''
	}

	dispose() {
		window.removeEventListener('mouseup', this.onMouseUpBinded)
		this.domElement.removeEventListener('mousemove', this.onMouseMoveBinded)
		this.domElement.removeEventListener('mousedown', this.onMouseDownBinded)
	}
}

export { BimWidgetCubeEditor }

