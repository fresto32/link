import * as THREE from 'three'
import Time from '../Utils/Time'
import Sizes from '../Utils/Sizes'
import Resources from '../Resources'
import Camera from '../Camera'

import Prompt from './Prompt'

export default class
{
  // Utilities
  /** Time */
  time: Time
  /** Sizes */
  sizes: Sizes
  /** Resources */
  resources: Resources

  // Functionality
  /** Config */
  config: {debug: boolean}
  /** Debug */
  debug: dat.GUI
  /** Renderer */
  renderer: THREE.WebGLRenderer
  /** Camera */
  camera: Camera

  // World Functionality
  /** Container */
  container: THREE.Object3D
  /** Question Prompt */
  prompt: Prompt

  /**
   * Constructor
   */
  constructor(
    _params: {
      time: Time,
      sizes: Sizes,
      resources: Resources,
      config: {debug: boolean},
      debug: dat.GUI,
      renderer: THREE.WebGLRenderer,
      camera: Camera
    })
  {
    // Options
    this.time = _params.time
    this.sizes = _params.sizes
    this.resources = _params.resources
    this.config = _params.config
    this.debug = _params.debug
    this.renderer = _params.renderer
    this.camera = _params.camera

    // Set up
    this.container = new THREE.Object3D()
    this.container.matrixAutoUpdate = false

    // Objects
    this.setSphereExample()
    this.setPrompt()
  }

  setSphereExample()
  {
    const radius = 1
    const widthSegments = 6
    const heightSegments = 6
    const sphereGeometry = new THREE.SphereBufferGeometry(radius, 
                                                          widthSegments, 
                                                          heightSegments)
     
    const material = new THREE.MeshPhongMaterial(
      {
        emissive: 0xFFFF00, 
        shininess: 150
      });
    const mesh = new THREE.Mesh(sphereGeometry, material);
    mesh.scale.set(1, 1, 1);
    this.container.add(mesh);
  }

  setPrompt()
  {
    this.prompt = new Prompt()
    this.container.add(this.prompt.container)
  }
}