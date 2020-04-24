import * as THREE from 'three';
import Time from '../Utils/Time';
import Sizes from '../Utils/Sizes';
import Resources from '../Resources';
import Camera from '../Camera';

import Controls from './Controls';
import Physics from './Physics';
import Signpost from './Signpost';
import OptionSignpost from './OptionSignpost';
import SpawnIsland from './SpawnIsland';
import Avatar from './Avatar';
import setOnPlane from './Helpers/SetOnPlane';

export default class {
  // Utilities
  /** Time */
  time: Time;
  /** Sizes */
  sizes: Sizes;
  /** Resources */
  resources: Resources;

  // Functionality
  /** Config */
  config: {debug: boolean};
  /** Debug */
  debug: dat.GUI;
  /** Renderer */
  renderer: THREE.WebGLRenderer;
  /** Camera */
  camera: Camera;

  // World Functionality
  /** Container */
  container: THREE.Object3D;
  /** Controls */
  controls!: Controls;
  /** Physics */
  physics!: Physics;
  /** Spawn Island */
  spawnIsland!: SpawnIsland;
  /** Avatar */
  avatar!: Avatar;
  /** Question Prompt */
  prompt!: Signpost;
  /** Options */
  options!: OptionSignpost[];

  /**
   * Constructor
   */
  constructor(_params: {
    time: Time;
    sizes: Sizes;
    resources: Resources;
    config: {debug: boolean};
    debug: dat.GUI;
    renderer: THREE.WebGLRenderer;
    camera: Camera;
  }) {
    // Options
    this.time = _params.time;
    this.sizes = _params.sizes;
    this.resources = _params.resources;
    this.config = _params.config;
    this.debug = _params.debug;
    this.renderer = _params.renderer;
    this.camera = _params.camera;

    // Container
    this.container = new THREE.Object3D();
    this.container.matrixAutoUpdate = false;

    // Set up
    this.setup();
  }

  /** Sets up world */
  setup() {
    // Setup
    this.setControls();

    this.resources.on('ready', () => {
      this.setPhysics();

      // Objects
      this.setSpawnIsland();
      this.setAvatar();
      this.setPrompt();
      this.setOptions();
      this.setSkybox();

      // Positions
      this.setPositions();
    });
  }

  /**
   * Set Controls
   */
  setControls() {
    this.controls = new Controls({
      time: this.time,
      sizes: this.sizes,
      config: this.config,
      debug: this.debug,
    });
  }

  /**
   * Set Physics
   */
  setPhysics() {
    this.physics = new Physics({
      time: this.time,
      sizes: this.sizes,
      config: this.config,
      debug: this.debug,
      controls: this.controls,
    });
  }

  /**
   * Set Prompt
   */
  setPrompt() {
    this.prompt = new Signpost({
      text: 'What is an example of an O(n) sorting algoritm?',
      picture: null,
    });
    setOnPlane(this.spawnIsland.ground, this.prompt.container, 0, 0);
    this.container.add(this.prompt.container);
  }

  /**
   * Set Options
   */
  setOptions() {
    this.options = [
      new OptionSignpost({
        text: 'Merge sort',
        picture: this.resources.textures.mergeSort,
        isCorrectOption: false,
      }),
      new OptionSignpost({
        text: 'Radix sort',
        picture: this.resources.textures.radixSort,
        isCorrectOption: true,
      }),
      new OptionSignpost({
        text: 'Quick sort',
        picture: this.resources.textures.quickSort,
        isCorrectOption: false,
      }),
      new OptionSignpost({
        text: 'Insertion sort',
        picture: this.resources.textures.insertionSort,
        isCorrectOption: false,
      }),
    ];

    setOnPlane(this.spawnIsland.ground, this.options[0].container, 75, 30);
    setOnPlane(this.spawnIsland.ground, this.options[1].container, 75, -30);
    setOnPlane(this.spawnIsland.ground, this.options[2].container, -75, 30);
    setOnPlane(this.spawnIsland.ground, this.options[3].container, -75, -30);

    this.options.forEach(o => {
      o.container.rotateY(Math.PI * 2 * Math.random());
      this.container.add(o.container);

      // Update the position and rotation of the viewing bounding box.
      o.container.updateMatrix();
      o.viewingBoundingBox.applyMatrix4(o.container.matrix);
    });

    this.time.on('tick', () => {
      this.options.forEach(option => {
        if (
          option.viewingBoundingBox.containsPoint(
            this.avatar.pirateCaptain.position
          )
        ) {
          option.switchSignpostLightOn();

          if (this.controls.actions.interact) {
            option.interaction();
          }
        } else {
          option.switchSignpostLightOff();
        }
      });
    });
  }

  /**
   * Set Spawn Island
   */
  setSpawnIsland() {
    this.spawnIsland = new SpawnIsland({
      resources: this.resources,
      debug: this.debug,
    });
    this.container.add(this.spawnIsland.container);
  }

  /**
   * Set Avatar
   */
  setAvatar() {
    this.avatar = new Avatar({
      time: this.time,
      resources: this.resources,
      physics: this.physics,
      ground: this.spawnIsland.ground,
    });
    this.container.add(this.avatar.container);
  }

  /**
   * Set Skybox
   */
  setSkybox() {
    const materials: THREE.Material[] = [];
    const textures = this.resources.textures;
    materials.push(new THREE.MeshBasicMaterial({map: textures.skyboxFt}));
    materials.push(new THREE.MeshBasicMaterial({map: textures.skyboxBk}));
    materials.push(new THREE.MeshBasicMaterial({map: textures.skyboxUp}));
    materials.push(new THREE.MeshBasicMaterial({map: textures.skyboxDn}));
    materials.push(new THREE.MeshBasicMaterial({map: textures.skyboxRt}));
    materials.push(new THREE.MeshBasicMaterial({map: textures.skyboxLf}));

    // Only render texture on the back side
    materials.forEach(m => (m.side = THREE.BackSide));

    const geometry = new THREE.BoxGeometry(600, 600, 600);
    const mesh = new THREE.Mesh(geometry, materials);
    this.container.add(mesh);
  }

  /**
   * Sets the positions of each object in the world
   */
  setPositions() {
    //
  }
}
