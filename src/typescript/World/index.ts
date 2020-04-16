import * as THREE from 'three'
import Time from '../Utils/Time'
import Sizes from '../Utils/Sizes'
import Resources from '../Resources'
import Camera from '../Camera'

import Controls from './Controls'
import Physics from './Physics'
import Signpost from './Signpost'
import SpawnIsland from './SpawnIsland'
import Avatar from './Avatar'

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
  /** Controls */
  controls: Controls
  /** Physics */
  physics: Physics
  /** Spawn Island */
  spawnIsland: SpawnIsland
  /** Avatar */
  avatar: Avatar
  /** Question Prompt */
  prompt: Signpost
  /** Options */
  options: Signpost[]

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

    // Container
    this.container = new THREE.Object3D()
    this.container.matrixAutoUpdate = false

    // Set up
    this.setup()
  }

  /** Sets up world */
  setup()
  {
    // Setup
    this.setControls()

    this.resources.on('ready', () => 
    {
      this.setPhysics()

      // Objects
      this.setSpawnIsland()
      this.setAvatar()
      this.setPrompt()
      this.setOptions()

      // Positions
      this.setPositions()
    })
  }
  
  /**
   * Set Controls
   */
  setControls()
  {
    this.controls = new Controls({
      time: this.time,
      sizes: this.sizes,
      config: this.config,
      debug: this.debug
    })
  }
  
  /**
   * Set Physics
   */
  setPhysics()
  {
    this.physics = new Physics({
      time: this.time,
      sizes: this.sizes,
      config: this.config,
      debug: this.debug,
      controls: this.controls
    })
  }

  /**
   * Set Prompt
   */
  setPrompt()
  {
    this.prompt = new Signpost('What is an example of an O(n) sorting algoritm?')
    this.container.add(this.prompt.container)
  }

  /**
   * Set Options
   */
  setOptions()
  {
    this.options = 
    [
      new Signpost('Merge sort'),
      new Signpost('Radix sort'),
      new Signpost('Quick sort'),
      new Signpost('Insertion sort')
    ]

    this.options[0].container.position.set(75, 0, 30)
    this.options[1].container.position.set(75, 0, -30)
    this.options[2].container.position.set(-75, 0, 30)
    this.options[3].container.position.set(-75, 0, -30)

    this.options.forEach(o => this.container.add(o.container))
  }

  /**
   * Set Spawn Island
   */
  setSpawnIsland()
  {
    this.spawnIsland = new SpawnIsland({resources: this.resources})
    this.container.add(this.spawnIsland.container)
  }

  /**
   * Set Avatar
   */
  setAvatar()
  {
    this.avatar = new Avatar({
      time: this.time, 
      resources: this.resources, 
      physics: this.physics
    })
    this.container.add(this.avatar.container)
  }

  /**
   * Sets the positions of each object in the world
   */
  setPositions()
  {
    this.spawnIsland.container.position.set(0, -10, 0)
    this.prompt.container.position.set(0, 0, -5)
  }
}