import * as THREE from 'three'
import Time from './Utils/Time'
import Sizes from './Utils/Sizes'

export default class Camera
{
  // Utilities
  /** Time */
  time: Time
  /** Sizes */
  sizes: Sizes

  // Functionality
  /** Config */
  config: {debug: boolean}
  /** Debug */
  debug: dat.GUI
  /** Debug Folder */
  debugFolder: dat.GUI
  /** Renderer */
  renderer: THREE.WebGLRenderer

  // Container
  container: THREE.Object3D

  // Camera details
  instance: THREE.PerspectiveCamera
  target: THREE.Vector3
  oldTarget: THREE.Vector3
  targetOffset: THREE.Vector3

  constructor(
    _params: {
      time: Time,
      sizes: Sizes,
      config: {debug: boolean},
      debug: dat.GUI,
      renderer: THREE.WebGLRenderer
    })
  {
    // Options
    this.time = _params.time
    this.sizes = _params.sizes
    this.config = _params.config
    this.debug = _params.debug
    this.renderer = _params.renderer

    // Set up
    this.container = new THREE.Object3D()
    this.container.matrixAutoUpdate = false

    if (this.debug)
    {
      this.debugFolder = this.debug.addFolder('camera')
      this.debugFolder.open()
    }

    this.target = new THREE.Vector3(0, 0, 0)
    this.oldTarget = new THREE.Vector3(0, 0, 0)
    this.targetOffset = new THREE.Vector3(0, 6.2, 0)

    this.setInstance()
  }

  /**
   * Creates and sets up the camera instance
   */
  setInstance()
  {
    this.instance = 
      new THREE.PerspectiveCamera(
        60,  // fov
        this.sizes.viewport.aspect,
        0.1, // near
        601) // far
    
    this.instance.position.x = 0.75
    this.instance.position.y = 1.3
    this.instance.position.z = -15

    this.instance.lookAt(this.target.add(this.targetOffset))


    this.sizes.on('resize', () => 
    {
      this.instance.aspect = this.sizes.viewport.aspect
      this.instance.updateProjectionMatrix()
    })

    this.time.on('tick', () =>
    {
      this.instance.lookAt(this.target.add(this.targetOffset))
      const deltaX = this.target.x - this.oldTarget.x
      const deltaY = this.target.y - this.oldTarget.y

      this.instance.position.x += deltaX
      this.instance.position.y += deltaY
    })

    if (this.debug)
    {
      this.debugFolder.add(this.instance.position, 'x').name('position x').step(0.001).min(-20).max(20).listen()
      this.debugFolder.add(this.instance.position, 'y').name('position y').step(0.001).min(-20).max(20).listen()
      this.debugFolder.add(this.instance.position, 'z').name('position z').step(0.001).min(-20).max(20).listen()

      this.debugFolder.add(this.targetOffset, 'x').name('offset x').step(0.001).min(-20).max(20).listen()
      this.debugFolder.add(this.targetOffset, 'y').name('offset y').step(0.001).min(-20).max(20).listen()
      this.debugFolder.add(this.targetOffset, 'z').name('offset z').step(0.001).min(-20).max(20).listen()
    }
  }
}