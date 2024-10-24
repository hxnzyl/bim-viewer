import { BufferGeometry, DoubleSide, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import {
    getBufferAttributeIndexFromVector3sArray,
    getBufferAttributePositionFromVector3sArray,
    vector3sToArray
} from '../../utils/three'
import { BimWidgetCubeViewColors } from './View'

class BimWidgetCubeMesh {
	colors!: Required<BimWidgetCubeViewColors>
	mesh!: Mesh<BufferGeometry, MeshBasicMaterial>
	wireframeMesh!: Line2
	componentId!: string

	createMesh(vectors: Vector3[]) {
		const geometry = new BufferGeometry(),
			material = new MeshBasicMaterial({
				color: this.colors.faceDefaultColor,
				opacity: this.colors.faceDefaultOpacity,
				side: DoubleSide
			})
		geometry.setAttribute('position', getBufferAttributePositionFromVector3sArray(vectors))
		geometry.setIndex(getBufferAttributeIndexFromVector3sArray(vectors))
		const mesh = new Mesh<BufferGeometry, MeshBasicMaterial>(geometry, material)
		// @ts-ignore
		mesh.componentId = this.componentId
		return mesh
	}

	createWireframe(vectors: Vector3[]) {
		const lineGeometry = new LineGeometry()
		lineGeometry.setPositions(vector3sToArray(vectors))

		const lineMaterial = new LineMaterial({
			color: this.colors.wireframeDefaultColor,
			opacity: this.colors.wireframeDefaultOpacity,
			linewidth: 1
		})
		lineMaterial.resolution.set(160, 160)

		const line2 = new Line2(lineGeometry, lineMaterial)
		// @ts-ignore
		line2.componentId = this.componentId
		return line2
	}

	getMesh() {
		return this.mesh
	}

	getWireframe() {
		return this.wireframeMesh
	}

	transparent(mesh: Mesh<BufferGeometry, MeshBasicMaterial>) {
		const m = mesh.material
		if (m) {
			m.transparent = true
			m.opacity = 0
		}
	}

	opaque(mesh: Mesh<BufferGeometry, MeshBasicMaterial>) {
		const m = mesh.material
		if (m) {
			m.transparent = false
			m.opacity = 1
		}
	}

	getComponentId() {
		return this.componentId
	}
}

export { BimWidgetCubeMesh }

