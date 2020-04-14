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
  /** Renderer */
  renderer: THREE.WebGLRenderer

  // Container
  container: THREE.Object3D

  // Camera details
  instance: THREE.PerspectiveCamera
  target: THREE.Vector3

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

    this.target = new THREE.Vector3(0, 0, 0)

    this.setInstance()
  }

  /**
   * Creates and sets up the camera instance
   */
  setInstance()
  {
    this.instance = new THREE.PerspectiveCamera(40,  // fov
                                                this.sizes.viewport.aspect,
                                                0.1, // near
                                                1000) // far
    
    this.instance.position.z = 100
    this.instance.lookAt(this.target)

    this.sizes.on('resize', () => 
    {
      this.instance.aspect = this.sizes.viewport.aspect
      this.instance.updateProjectionMatrix()
    })

    this.time.on('tick', () =>
    {
      // TODO: move camera with tick
    })
  }
}