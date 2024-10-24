import { Scene, TextureLoader, Vector3 } from 'three'
import { BimWidgetCubeCorner } from './Corner'
import { BimWidgetCubeEdge } from './Edge'
import { BimWidgetCubeFace } from './Face'
import { BimWidgetCubeMap } from './Map'
import { BimWidgetCubeViewColors } from './View'

class BimWidgetCubeData {
	scene: Scene
	colors: BimWidgetCubeViewColors
	callback: () => void

	length: number = 100
	texturesLoaded: number = 0
	vertices: Vector3[] = []
	vertexIds: string[] = []
	edgeIndices: number[][] = []
	edgeIds: string[] = []
	faceIndices: number[][] = []
	faceIds: string[] = []
	componentList: (BimWidgetCubeFace | BimWidgetCubeEdge | BimWidgetCubeCorner)[] = []

	constructor(s: BimWidgetCubeViewColors, c: () => void) {
		var e = this.length
		this.vertices.push(new Vector3(-e / 2, -e / 2, e / 2))
		this.vertices.push(new Vector3(e / 2, -e / 2, e / 2))
		this.vertices.push(new Vector3(-e / 2, e / 2, e / 2))
		this.vertices.push(new Vector3(e / 2, e / 2, e / 2))
		this.vertices.push(new Vector3(-e / 2, -e / 2, -e / 2))
		this.vertices.push(new Vector3(e / 2, -e / 2, -e / 2))
		this.vertices.push(new Vector3(-e / 2, e / 2, -e / 2))
		this.vertices.push(new Vector3(e / 2, e / 2, -e / 2))
		for (var t = 0; t < 8; t++) {
			this.vertexIds.push(t + '')
			this.edgeIndices.push([0, 1], [1, 3], [3, 2], [2, 0])
			this.edgeIndices.push([0, 4], [1, 5], [2, 6], [3, 7])
			this.edgeIndices.push([4, 5], [5, 7], [7, 6], [6, 4])
		}
		for (t = 0; t < 12; t++) {
			var i = this.edgeIndices[t]
			this.edgeIds.push(i[0] + '' + i[1])
		}
		this.faceIndices.push([0, 2, 3, 1])
		this.faceIndices.push([4, 0, 1, 5])
		this.faceIndices.push([4, 6, 2, 0])
		this.faceIndices.push([2, 6, 7, 3])
		this.faceIndices.push([1, 3, 7, 5])
		this.faceIndices.push([5, 7, 6, 4])
		for (t = 0; t < 6; t++) {
			var o = this.faceIndices[t]
			this.faceIds.push(o[0] + '' + o[1] + o[2] + o[3])
		}
		this.scene = new Scene()
		this.colors = s
		this.callback = c
		this.buildEdges()
		this.buildCorners()
		this.buildFaces()
	}

	buildFaces() {
		var n = 0,
			s = this,
			e = s.vertices,
			t = s.faceIndices,
			i = s.faceIds,
			f = function (o: number) {
				var n = 'viewcube/' + BimWidgetCubeMap[i[o]] + '.png',
					r = new TextureLoader()
				r.setCrossOrigin('anonymous')
				r.load(n, function (a) {
					const face = new BimWidgetCubeFace(e, t[o], i[o], a, s.colors)
					s.componentList.push(face)
					// @ts-ignore
					s.scene.add(face.getMesh()).add(face.getWireframe()).add(face.getHighlightMesh())
					6 == ++s.texturesLoaded && s.callback && s.callback()
				})
			}
		for (; n < 6; n++) f(n)
	}

	buildEdges() {
		for (var e = this.vertices, t = this.edgeIndices, i = this.edgeIds, o = 0; o < 12; o++) {
			var s = new BimWidgetCubeEdge(e, t[o], i[o], this.colors)
			this.componentList.push(s)
			// @ts-ignore
			this.scene.add(s.getMesh()).add(s.getWireframe()).add(s.getHighlightWireframeMesh())
		}
	}

	buildCorners() {
		for (var e = this.vertices, t = this.vertexIds, i = 0; i < 8; i++) {
			var o = new BimWidgetCubeCorner(e[i], t[i], this.colors)
			this.componentList.push(o)
			// @ts-ignore
			this.scene.add(o.getMesh()).add(o.getWireframe()).add(o.getCornerFace()).add(o.getCornerWireframe())
		}
	}

	getComponent(componentId: string) {
		for (var i = 0, l = this.componentList.length; i < l; i++) {
			var o = this.componentList[i]
			if (o.getComponentId() === componentId) {
				return o
			}
		}
		return null
	}

	getScene() {
		return this.scene
	}

	getMeshes() {
		for (var e = [], t = this.scene.children, i = 0; i < t.length; i++) {
			var o = t[i]
			// @ts-ignore
			if ('Mesh' === o.type && true !== o.isHighlightMesh) {
				e.push(o)
			}
		}
		return e
	}

	dispose() {
		// this.scene = null
		this.vertices = []
		this.vertexIds = []
		this.edgeIndices = []
		this.edgeIds = []
		this.faceIndices = []
		this.faceIds = []
		this.componentList = []
	}
}

export { BimWidgetCubeData }

