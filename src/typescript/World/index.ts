import * as THREE from 'three';
import Time from '../Utils/Time';
import Sizes from '../Utils/Sizes';
import Resources from '../Resources';

import Controls from '../Controls';
import Physics from './Physics';
import Objects from './Objects';
import Signpost from './Signpost';
import OptionSignpost from './OptionSignpost';
import SpawnIsland from './SpawnIsland';
import Avatar from './Avatar';
import setOnPlane from './Helpers/SetOnPlane';
import Sounds from './Sounds';

export default class {
  // Utilities
  /** Time */
  private readonly time: Time;
  /** Sizes */
  private readonly sizes: Sizes;
  /** Resources */
  private readonly resources: Resources;

  // Functionality
  /** Config */
  private readonly config: Config;
  /** Debug */
  private readonly debug: dat.GUI;
  /** Renderer */
  private readonly renderer: THREE.WebGLRenderer;

  // World Functionality
  /** Container */
  public readonly container: THREE.Object3D;
  /** Controls */
  public readonly controls!: Controls;
  /** Avatar */
  public avatar!: Avatar;
  /** Physics */
  private physics!: Physics;
  /** Objects */
  private objects!: Objects;
  /** Spawn Island */
  private spawnIsland!: SpawnIsland;
  /** Question Prompt */
  private prompt!: Signpost;
  /** Options */
  private options!: OptionSignpost[];
  /** Sounds */
  private sounds!: Sounds;

  /**
   * Constructor
   */
  constructor(_params: {
    time: Time;
    sizes: Sizes;
    resources: Resources;
    config: Config;
    debug: dat.GUI;
    renderer: THREE.WebGLRenderer;
    controls: Controls;
  }) {
    // Options
    this.time = _params.time;
    this.sizes = _params.sizes;
    this.resources = _params.resources;
    this.config = _params.config;
    this.debug = _params.debug;
    this.renderer = _params.renderer;
    this.controls = _params.controls;

    // Container
    this.container = new THREE.Object3D();
    this.container.matrixAutoUpdate = false;

    // Set up
    this.setup();
  }

  /** Sets up world */
  private setup() {
    // Setup
    this.setSounds();

    this.resources.on('ready', () => {
      this.setPhysics();

      // Objects
      this.setObjects();
      this.setSpawnIsland();
      this.setAvatar();
      this.setPrompt();
      this.setOptions();
      this.setSkybox();
    });
  }

  /**
   * Set Sounds
   */
  private setSounds() {
    this.sounds = new Sounds({time: this.time, debug: this.debug});
  }

  /**
   * Set Physics
   */
  private setPhysics() {
    this.physics = new Physics({
      time: this.time,
      config: this.config,
      controls: this.controls,
    });
  }

  /**
   * Set Prompt
   */
  private setPrompt() {
    this.prompt = new Signpost({
      text: 'What is an example of an O(n) sorting algoritm?',
      picture: null,
      textTextureAnisotropy: this.renderer.capabilities.getMaxAnisotropy(),
    });
    setOnPlane(this.spawnIsland.ground, this.prompt.container, 0, -10);
    this.objects.add(this.prompt.container, {isCollidable: true});
  }

  /**
   * Set Options
   */
  private setOptions() {
    this.options = [
      new OptionSignpost({
        text: 'Merge sort',
        picture: this.resources.textures.mergeSort,
        textTextureAnisotropy: this.renderer.capabilities.getMaxAnisotropy(),
        isCorrectOption: false,
        sounds: this.sounds,
        time: this.time,
        sizes: this.sizes,
      }),
      new OptionSignpost({
        text: 'Radix sort',
        picture: this.resources.textures.radixSort,
        textTextureAnisotropy: this.renderer.capabilities.getMaxAnisotropy(),
        isCorrectOption: true,
        sounds: this.sounds,
        time: this.time,
        sizes: this.sizes,
      }),
      new OptionSignpost({
        text: 'Quick sort',
        picture: this.resources.textures.quickSort,
        textTextureAnisotropy: this.renderer.capabilities.getMaxAnisotropy(),
        isCorrectOption: false,
        sounds: this.sounds,
        time: this.time,
        sizes: this.sizes,
      }),
      new OptionSignpost({
        text: 'Insertion sort',
        picture: this.resources.textures.insertionSort,
        textTextureAnisotropy: this.renderer.capabilities.getMaxAnisotropy(),
        isCorrectOption: false,
        sounds: this.sounds,
        time: this.time,
        sizes: this.sizes,
      }),
    ];

    setOnPlane(this.spawnIsland.ground, this.options[0].container, 75, 30);
    setOnPlane(this.spawnIsland.ground, this.options[1].container, 75, -30);
    setOnPlane(this.spawnIsland.ground, this.options[2].container, -75, 30);
    setOnPlane(this.spawnIsland.ground, this.options[3].container, -75, -30);

    this.options.forEach(o => {
      o.container.rotateY(Math.PI * 2 * Math.random());
      this.objects.add(o.container, {isCollidable: true});

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
   * Sets Objects
   */
  private setObjects() {
    this.objects = new Objects({config: this.config, physics: this.physics});
    this.container.add(this.objects.container);
  }

  /**
   * Set Spawn Island
   */
  private setSpawnIsland() {
    this.spawnIsland = new SpawnIsland({
      resources: this.resources,
      config: this.config,
      debug: this.debug,
      objects: this.objects,
    });
    this.container.add(this.spawnIsland.ground);
  }

  /**
   * Set Avatar
   */
  private setAvatar() {
    this.avatar = new Avatar({
      time: this.time,
      resources: this.resources,
      physics: this.physics,
      ground: this.spawnIsland.ground,
      spawnIsland: this.spawnIsland,
    });
    this.container.add(this.avatar.container);
  }

  /**
   * Set Skybox
   */
  private setSkybox() {
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
}
