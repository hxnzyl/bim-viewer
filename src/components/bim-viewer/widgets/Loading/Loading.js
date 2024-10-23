/**
 * loading Widget
 *
 * @author OWen<733433@qq.com>
 */

import { Bounce, Power3, TimelineMax } from 'gsap'
import {
    AmbientLight,
    BoxGeometry,
    Color,
    DirectionalLight,
    HemisphereLight,
    Mesh,
    MeshLambertMaterial,
    Object3D,
    OrthographicCamera,
    PCFSoftShadowMap,
    PlaneGeometry,
    Scene,
    Vector3,
    WebGLRenderer
} from 'three'

class BimLoading {
	constructor(el, options) {
		this.el = el
		this.options = options
		this.newScene()
		this.newLights()
		this.newPlatform()
		this.newGround()
		this.newCube()
	}

	newScene() {
		this.scene = new Scene()
		let factor = 130
		let near = 1
		let far = 10000
		let { clientWidth, clientHeight } = this.el
		this.camera = new OrthographicCamera(
			clientWidth / -factor,
			clientWidth / factor,
			clientHeight / factor,
			clientHeight / -factor,
			near,
			far
		)
		this.camera.position.set(7, 5, 5)
		this.camera.lookAt(this.scene.position)
		this.renderer = new WebGLRenderer({ antialias: true })
		this.renderer.setClearColor(new Color(this.options.backgroundColor), 1)
		this.renderer.shadowMap.enabled = true
		this.renderer.shadowMap.type = PCFSoftShadowMap
		this.renderer.setSize(clientWidth, clientHeight)
		this.el.parentNode.appendChild(this.renderer.domElement)
	}

	newLights() {
		let light = new AmbientLight(0xffffff, 0.9)
		let hemisphereLight = new HemisphereLight(0xffffff, 0xffffff, 0.1)
		let shadowLight = new DirectionalLight(0xffffff, 0.1)
		shadowLight.position.set(10, 100, 30)
		shadowLight.castShadow = true
		this.scene.add(light)
		this.scene.add(hemisphereLight)
		this.scene.add(shadowLight)
	}

	newGround() {
		let ground = new Ground(this.options.groundColor)
		ground.mesh.position.y = -2
		ground.mesh.rotation.x = getDegree(-90)
		this.scene.add(ground.mesh)
	}

	newPlatform() {
		;[new Vector3(0, -1, 0.5), new Vector3(0, -1, -0.5), new Vector3(-1, -1, -0.5)].forEach((pos) => {
			let platform = new Platform(this.options.platformColor)
			Object.assign(platform.mesh.position, pos)
			this.scene.add(platform.mesh)
		})
	}

	newCube() {
		let cube = new Cube(this.options.cubeColor)
		this.scene.add(cube.mesh)
		cube.cube.position.set(0, 2, 0.5)
		let tl = new TimelineMax({ repeat: -1, repeatDelay: this.options.delay })
		tl.set(cube.cube.material, { opacity: 0 })
		tl.to(cube.cube.position, 0.8, { y: -0.4, ease: Bounce.easeOut })
		tl.to(cube.cube.scale, 0.8, { y: 1, ease: Bounce.easeOut }, '-=0.8')
		tl.to(cube.cube.material, 0.5, { opacity: 1 }, '-=0.8')
		tl.to(cube.cube.rotation, 0.8, { x: getDegree(-90) }, '+=0.2')
		tl.to(cube.cube.position, 0.3, { y: -0.2 }, '-=0.8')
		tl.to(cube.cube.position, 0.8, { z: -0.5 }, '-=0.8')
		tl.to(cube.cube.position, 0.3, { y: -0.4 }, '-=0.4')
		tl.to(cube.cube.rotation, 0.8, { y: getDegree(-90) })
		tl.to(cube.cube.position, 0.3, { y: -0.2 }, '-=0.8')
		tl.to(cube.cube.position, 0.8, { x: -1 }, '-=0.8')
		tl.to(cube.cube.position, 0.3, { y: -0.4 }, '-=0.4')
		tl.to(cube.cube.rotation, 0.8, { x: 0, ease: Power3.easeOut })
		tl.to(cube.cube.position, 0.8, { z: 0.8, ease: Power3.easeOut }, '-=0.8')
		tl.to(cube.cube.position, 0.6, { y: -4, ease: Power3.easeIn }, '-=0.80')
		tl.to(cube.cube.scale, 0.8, { y: 1.5 }, '-=0.5')
		tl.to(cube.cube.material, 0.25, { opacity: 0 }, '-=0.85')
		tl.timeScale(this.options.duration)
	}

	show() {
		this.el.style.display = 'none'
		this.renderer.domElement.style.display = 'block'
		this.render()
	}

	hide() {
		this.el.style.display = 'block'
		this.renderer.domElement.style.display = 'none'
		cancelAnimationFrame(this.animateId)
	}

	render() {
		this.renderer.render(this.scene, this.camera)
		this.animateId = requestAnimationFrame(this.render.bind(this))
	}
}

function getDegree(degree) {
	return (degree * Math.PI) / 180
}

function Platform(color) {
	this.mesh = new Object3D()
	let geometry = new BoxGeometry(1, 0.2, 1)
	let material = new MeshLambertMaterial({ color })
	this.plateform = new Mesh(geometry, material)
	this.plateform.castShadow = true
	this.mesh.add(this.plateform)
}

function Ground(color) {
	this.mesh = new Object3D()
	let geometry = new PlaneGeometry(20, 20, 1, 1)
	let material = new MeshLambertMaterial({ color })
	let plane = new Mesh(geometry, material)
	plane.receiveShadow = true
	this.mesh.add(plane)
}

function Cube(color) {
	this.mesh = new Object3D()
	let geometry = new BoxGeometry(1, 1, 1)
	let material = new MeshLambertMaterial({ color, transparent: true })
	this.cube = new Mesh(geometry, material)
	this.mesh.add(this.cube)
}

export default BimLoading
