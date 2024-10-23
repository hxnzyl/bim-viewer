import { Vector3 } from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { vector3sToArray } from '../../utils/three'
import { BimWidgetCubeMesh } from './Mesh'
import { BimWidgetCubeViewOptions } from './View'

class BimWidgetCubeEdge extends BimWidgetCubeMesh {
	highlightWidth: number
	width: number
	vertices: Vector3[]
	indices: number[]
	highlightWireframeMesh?: Line2

	constructor(vertices: Vector3[], indices: number[], componentId: string, colors: BimWidgetCubeViewOptions['colors']) {
		super()
		this.highlightWidth = 3
		this.width = 15
		this.vertices = vertices
		this.indices = indices
		this.componentId = componentId
		this.colors = colors
		this.build()
	}

	build() {
		var e = this.indices[0],
			t = this.indices[1],
			i = this.vertices[e],
			o = this.vertices[t],
			s = i.clone().add(o).multiplyScalar(0.5).clone().multiplyScalar(-1),
			n = s.clone().normalize(),
			r = [],
			a = o.clone().sub(i).normalize(),
			l = i.clone().add(a.clone().multiplyScalar(20)),
			h = i.clone().add(a.clone().multiplyScalar(80)),
			g = []
		if (0 !== s.x) {
			var c = s.x > 0 ? this.width : -this.width
			g.push(new Vector3().setX(c).add(n))
		}
		if (0 !== s.y) {
			var d = s.y > 0 ? this.width : -this.width
			g.push(new Vector3().setY(d).add(n))
		}
		if (0 !== s.z) {
			var u = s.z > 0 ? this.width : -this.width
			g.push(new Vector3().setZ(u).add(n))
		}
		if (2 === g.length) {
			r.push(l.clone().add(n))
			r.push(l.clone().add(g[0]))
			r.push(h.clone().add(g[0]))
			r.push(h.clone().add(n))
			r.push(h.clone().add(g[1]))
			r.push(l.clone().add(g[1]))
			this.mesh = this.createMesh(r)
			this.transparent(this.mesh)
			this.wireframeMesh = this.createWireframe([l, h])
			this.highlightWireframeMesh = this.createHighlightWireframe([l.sub(n), h.sub(n)])
		}
	}

	createHighlightWireframe(vectors: Vector3[]) {
		const geometry = new LineGeometry()
		geometry.setPositions(vector3sToArray(vectors))

		const material = new LineMaterial({
			color: this.colors.wireframeHighlightColor,
			opacity: this.colors.wireframeHighlightOpacity,
			linewidth: this.highlightWidth,
			dashed: false
		})
		material.resolution.set(160, 160)

		const line = new Line2(geometry, material)
		line.computeLineDistances()
		line.scale.set(1, 1, 1)
		line.visible = false
		line.renderOrder = 100
		return line
	}

	getHighlightWireframeMesh() {
		return this.highlightWireframeMesh
	}

	highlight() {
		const m = this.highlightWireframeMesh
		m!.visible = true
		m!.renderOrder = 100
	}

	cancelHighlight() {
		const m = this.highlightWireframeMesh
		m!.visible = false
	}
}

export { BimWidgetCubeEdge }

