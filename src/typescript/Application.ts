import * as THREE from 'three'
import * as dat from 'dat.gui'
import Time from './Utils/Time'
import Sizes from './Utils/Sizes'
import Resources from './Resources'
import Camera from './Camera'
import World from './World'

/**
 * Encapsulates all information required to run the application.
 */
export default class Application
{
  /** Canvas */
  $canvas: HTMLCanvasElement

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
  /** Scene */
  scene: THREE.Scene
  /** Camera */
  camera: Camera
  /** World */
  world: World

  /**
   * Constructor
   */
  constructor($canvas)
  {
    // Options
    this.$canvas = $canvas

    // Set up
    this.time = new Time()
    this.sizes = new Sizes()
    this.resources = new Resources()

    this.setConfig()
    this.setDebug()
    this.setRenderer()
    this.setCamera()
    this.setPasses()
    this.setWorld()
  }
  
  /**
   * Set config
   */
  setConfig()
  {
    if (!this.config) this.config = { debug: window.location.hash === '#debug' }
    else this.config.debug = window.location.hash === '#debug'
  }

  /**
   * Set debug
   */
  setDebug()
  {
    if (this.config.debug) this.debug = new dat.GUI()
  }

  /**
   * Set renderer
   */
  setRenderer()
  {
      // Scene
      this.scene = new THREE.Scene()

      // Pale blue background
      this.scene.background = new THREE.Color(0xAFEEEE)

      // Renderer
      this.renderer = new THREE.WebGLRenderer({
          canvas: this.$canvas,
          alpha: true
      })
      // this.renderer.setClearColor(0x414141, 1)
      this.renderer.setClearColor(0x000000, 1)
      // this.renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 1.5), 2))
      this.renderer.setPixelRatio(2)
      //this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
      this.renderer.physicallyCorrectLights = true
      //this.renderer.gammaOutPut = true
      this.renderer.autoClear = false
  }

  /**
   * Set camera
   */
  setCamera() 
  {
    this.camera = new Camera({
      time: this.time,
      sizes: this.sizes,
      debug: this.debug,
      config: this.config,
      renderer: this.renderer
    })
  }

  /**
   * Set passes
   */
  setPasses()
  {
    this.time.on('tick', () =>
    {
      this.renderer.render(this.scene, this.camera.instance)
    })
    this.sizes.on('resize', () =>
    {
      this.renderer.setSize(this.sizes.viewport.width, 
                            this.sizes.viewport.height,
                            false)
    })
  }

  /**
   * Set world
   */
  setWorld()
  {
    this.world = new World({
      time: this.time,
      sizes: this.sizes,
      resources: this.resources,
      config: this.config,
      debug: this.debug,
      renderer: this.renderer,
      camera: this.camera,
    })
    this.scene.add(this.world.container)
  }

  /**
   * Destructor
   */
  destructor()
  {
    this.time.off('tick')
    this.sizes.off('resize')

    this.renderer.dispose()
    this.debug.destroy()
  }
}