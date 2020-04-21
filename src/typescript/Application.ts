import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
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
  /** Light */
  lights: THREE.DirectionalLight[]
  /** Orbit Controls */
  orbitControls: OrbitControls

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
    this.setLight()
    this.setOrbitControls()
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
      this.renderer.setSize(this.sizes.viewport.width, 
                            this.sizes.viewport.height,
                            false)

      if (this.config.debug)
      {
        this.scene.add(new THREE.AxesHelper(50))
      }
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

    this.scene.add(this.camera.container)

    this.time.on('tick', () => 
    {
      if (this.world.avatar !== undefined)
      {
        this.camera.oldTarget.copy(this.camera.target)
        this.camera.target.copy(this.world.avatar.pirateCaptain.position)
      }
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
   * Set Light
   */
  setLight()
  {
    this.lights = []

    let lightDebugFolder: dat.GUI
    if (this.debug) lightDebugFolder = this.debug.addFolder('light')

    let positions = 
    [
      new THREE.Vector3(-48, 80, -25),
      new THREE.Vector3(48, 80, 25),
    ]

    for (let i = 0; i < 2; i++)
    {
      const light = new THREE.DirectionalLight('white', 2.4)
      light.position.copy(positions[i])
      light.lookAt(0, 0, 0)
      this.lights.push(light)
      this.scene.add(light)
      if (this.debug)
      {
        const lightDebug = lightDebugFolder.addFolder('light ' + i)
        lightDebug.add(light.position, 'x').name('position x').step(0.001).min(-200).max(200).listen()
        lightDebug.add(light.position, 'y').name('position y').step(0.001).min(-200).max(200).listen()
        lightDebug.add(light.position, 'z').name('position z').step(0.001).min(-200).max(200).listen()
        lightDebug.add(light, 'intensity').step(0.001).min(-10).max(10).listen()
      }
    }
  }

  /**
   * Set Orbit Controls
   */
  setOrbitControls()
  {
    this.orbitControls = new OrbitControls(this.camera.instance, this.renderer.domElement);

    this.time.on('tick', () =>
    {
      this.orbitControls.target.copy(this.camera.target)
      this.orbitControls.update()
    })
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