import { Intersection, Object3D } from 'three'
import { BimViewer } from './Viewer'

const ABSTRACT_METHOD_ERROR = new Error('This is an implementation of the abstract method.')

class BimRender {
	name = 'BimRender'
	options = {}

	bimViewer!: BimViewer

	initialize(viewer: BimViewer) {
		throw ABSTRACT_METHOD_ERROR
	}

	setOptions(options?: {}) {
		throw ABSTRACT_METHOD_ERROR
	}

	createDomElement() {
		throw ABSTRACT_METHOD_ERROR
	}

	render() {}

	update() {
		throw ABSTRACT_METHOD_ERROR
	}

	updateRaycaster(objects: Intersection<Object3D>) {}

	show() {
		throw ABSTRACT_METHOD_ERROR
	}

	hide() {
		throw ABSTRACT_METHOD_ERROR
	}

	dispose() {
		throw ABSTRACT_METHOD_ERROR
	}

	onResize() {}
}

export interface BimRenders {
	[key: string]: BimRender
}

export { BimRender }
