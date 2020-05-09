import * as THREE from 'three';
import Time from './Utils/Time';
import Sizes from './Utils/Sizes';
import CameraControls from 'camera-controls';

export default class Camera {
  // Utilities
  /** Time */
  readonly time: Time;
  /** Sizes */
  readonly sizes: Sizes;

  // Functionality
  /** Config */
  readonly config: Config;
  /** Debug */
  readonly debug: dat.GUI;
  /** Debug Folder */
  readonly debugFolder!: dat.GUI;
  /** Renderer */
  readonly renderer: THREE.WebGLRenderer;

  // Container
  container: THREE.Object3D;

  // Camera details
  instance!: THREE.PerspectiveCamera;
  target: THREE.Vector3;
  oldTarget: THREE.Vector3;

  /** Orbit Controls */
  cameraControls!: CameraControls;

  constructor(_params: {
    time: Time;
    sizes: Sizes;
    config: Config;
    debug: dat.GUI;
    renderer: THREE.WebGLRenderer;
  }) {
    // Options
    this.time = _params.time;
    this.sizes = _params.sizes;
    this.config = _params.config;
    this.debug = _params.debug;
    this.renderer = _params.renderer;

    // Set up
    this.container = new THREE.Object3D();
    this.container.matrixAutoUpdate = false;

    if (this.debug) {
      this.debugFolder = this.debug.addFolder('camera');
      this.debugFolder.open();
    }

    this.target = new THREE.Vector3(0, 0, 0);
    this.oldTarget = new THREE.Vector3(0, 0, 0);

    this.instance = new THREE.PerspectiveCamera(
      60, // fov
      this.sizes.viewport.aspect,
      0.1, // near
      580
    ); // far

    this.setupCamera();
  }

  /**
   * Creates and sets up the camera instance
   */
  setupCamera() {
    this.instance.position.x = 0;
    this.instance.position.y = 8;
    this.instance.position.z = 5;

    CameraControls.install({THREE: THREE});

    this.cameraControls = new CameraControls(
      this.instance,
      this.renderer.domElement
    );
    this.cameraControls.setTarget(0, 7.5, 0);

    this.sizes.on('resize', () => {
      this.instance.aspect = this.sizes.viewport.aspect;
      this.instance.updateProjectionMatrix();
    });

    const yOffset = 5;

    this.time.on('tick', () => {
      this.cameraControls.moveTo(
        this.target.x,
        this.target.y + yOffset,
        this.target.z
      );
      this.cameraControls.update(this.time.delta);
    });

    if (this.debug) {
      this.debugFolder
        .add(this.instance.position, 'x')
        .name('position x')
        .step(0.001)
        .min(-20)
        .max(20)
        .listen();
      this.debugFolder
        .add(this.instance.position, 'y')
        .name('position y')
        .step(0.001)
        .min(-20)
        .max(20)
        .listen();
      this.debugFolder
        .add(this.instance.position, 'z')
        .name('position z')
        .step(0.001)
        .min(-20)
        .max(20)
        .listen();

      this.debugFolder
        .add(this.instance, 'near')
        .name('near')
        .min(0)
        .max(100)
        .listen()
        .onChange(() => this.instance.updateProjectionMatrix());
      this.debugFolder
        .add(this.instance, 'far')
        .name('far')
        .min(0)
        .max(1000)
        .listen()
        .onChange(() => this.instance.updateProjectionMatrix());
    }
  }
}
