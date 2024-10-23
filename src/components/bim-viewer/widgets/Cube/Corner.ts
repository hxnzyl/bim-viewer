import { BufferGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2'
import { BimWidgetCubeMesh } from './Mesh'
import { BimWidgetCubeViewOptions } from './View'

class BimWidgetCubeCorner extends BimWidgetCubeMesh {
	length: number
	vertex: Vector3

	cornerFace?: Mesh<BufferGeometry, MeshBasicMaterial>
	cornerWireframe?: Line2

	cornerVertices: Vector3[] = []
	faceHighlightOpacity: number = 1

	constructor(vertex: Vector3, componentId: string, colors: BimWidgetCubeViewOptions['colors']) {
		super()
		this.length = 20
		this.vertex = vertex
		this.colors = colors
		this.componentId = componentId
		this.build()
	}

	build() {
		var e: Vector3[] = [],
			t = this.vertex.clone(),
			i = t.clone().multiplyScalar(-1)
		e.push(t)
		var o = this.vertex.clone(),
			s = i.x > 0 ? this.length : -this.length
		o.x += s
		e.push(o)
		var n = this.vertex.clone(),
			r = i.y > 0 ? this.length : -this.length
		n.y += r
		e.push(n)
		var a = this.vertex.clone(),
			l = i.z > 0 ? this.length : -this.length
		a.z += l
		e.push(a)
		this.cornerVertices = e
		this.mesh = this.createMesh([o, n, a])
		this.wireframeMesh = this.createWireframe([o, n, a, o])
		this.buildCornerFace()
		this.buildCornerWireframe()
	}

	highlight() {
		var wm = this.wireframeMesh!.material
		wm.color.set(this.colors.wireframeHighlightColor)
		wm.opacity = this.colors.wireframeHighlightOpacity
		this.wireframeMesh!.renderOrder = 100

		var mm = this.mesh!.material
		mm.color.set(this.colors.faceHighlightColor)
		mm.opacity = this.faceHighlightOpacity

		var cm = this.cornerFace!.material
		cm.transparent = true
		cm.color.set(this.colors.faceHighlightColor)
		cm.opacity = this.colors.faceHighlightOpacity

		var cwm = this.cornerWireframe!.material
		cwm.color.set(this.colors.wireframeHighlightColor)
		cwm.opacity = this.colors.wireframeHighlightOpacity
		this.cornerWireframe!.visible = true
	}

	cancelHighlight() {
		var wm = this.wireframeMesh!.material
		wm.color.set(this.colors.wireframeDefaultColor)
		wm.opacity = this.colors.wireframeDefaultOpacity
		this.wireframeMesh!.renderOrder = 0
		var mm = this.mesh!.material
		mm.color.set(this.colors.faceDefaultColor)
		mm.opacity = this.colors.faceDefaultOpacity
		this.transparent(this.cornerFace)
		this.cornerWireframe!.visible = false
	}

	buildCornerFace() {
		if (this.cornerFace) return
		var e = this.cornerVertices
		e.push(e[1])
		this.cornerFace = this.createMesh(e)
		this.transparent(this.cornerFace)
	}

	getCornerFace() {
		return this.cornerFace
	}

	getCornerWireframe() {
		return this.cornerWireframe
	}

	buildCornerWireframe() {
		if (this.cornerWireframe) return
		for (var e = [], t = 1; t < this.cornerVertices.length; t++) {
			var i = this.cornerVertices[0],
				o = this.cornerVertices[t]
			e.push(i, o)
		}
		this.cornerWireframe = this.createWireframe(e)
		this.cornerWireframe.visible = false
	}
}

export { BimWidgetCubeCorner }

