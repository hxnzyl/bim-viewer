import { BufferAttribute, Material, Vector2, Vector3 } from 'three'

export function getBufferAttributePositionFromVector3sArray(vectors: Vector3[]) {
	const l = vectors.length,
		positionArray = new Float32Array(l * 3)
	for (let i = 0; i < l; i++) {
		positionArray[i * 3] = vectors[i].x
		positionArray[i * 3 + 1] = vectors[i].y
		positionArray[i * 3 + 2] = vectors[i].z
	}
	return new BufferAttribute(positionArray, 3)
}

export function getBufferAttributeUvFromVector2sArray(vectors: Vector2[]) {
	const l = vectors.length,
		uvArray = new Float32Array(l * 2)
	for (let i = 0; i < l; i++) {
		uvArray[i * 2] = vectors[i].x
		uvArray[i * 2 + 1] = vectors[i].y
	}
	return new BufferAttribute(uvArray, 2)
}

export function getBufferAttributeIndexFromVector3sArray(vectors: Vector3[]) {
	const t = vectors.length - 2,
		intArray = new Uint32Array(3 * t)
	for (let o = 0, s = 1; s <= t; s++) {
		intArray[o++] = 0
		intArray[o++] = s
		intArray[o++] = s + 1
	}
	return new BufferAttribute(intArray, 1)
}

export function vector3sToArray(vectors: Vector3[]) {
	const l = vectors.length,
		array = []
	for (let o = 0; o < l; o++) {
		var s = vectors[o]
		array.push(s.x, s.y, s.z)
	}
	return array
}

export function materialToArray<T = Material>(materials: Material | Material[]): T[] {
	return Array.isArray(materials) ? (materials as T[]) : [materials as T]
}
