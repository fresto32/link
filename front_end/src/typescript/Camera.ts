import CameraControls from 'camera-controls';
import * as THREE from 'three';
import Sizes from './Utils/Sizes';
import Time from './Utils/Time';

export default class Camera {
  // Container
  public readonly container: THREE.Object3D;

  // Utilities
  /** Time */
  private readonly time: Time;
  /** Sizes */
  private readonly sizes: Sizes;

  // Functionality
  /** Config */
  private readonly config: Config;
  /** Debug */
  private readonly debug: dat.GUI;
  /** Debug Folder */
  private readonly debugFolder!: dat.GUI;
  /** Renderer */
  private readonly renderer: THREE.WebGLRenderer;

  // Camera details
  // TODO: Make instance private, but set up a readonly getter.
  public readonly instance!: THREE.PerspectiveCamera;
  public readonly target: THREE.Vector3;
  public readonly oldTarget: THREE.Vector3;

  /** Orbit Controls */
  // TODO: Make cameraControls private, but set up a readonly getter.
  public cameraControls!: CameraControls;

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
  private setupCamera() {
    this.instance.position.x = 0;
    this.instance.position.y = 8;
    this.instance.position.z = 5;

    CameraControls.install({THREE: THREE});

    this.cameraControls = new CameraControls(
      this.instance,
      this.renderer.domElement
    );
    this.cameraControls.setTarget(0, 7.5, 0);

    this.cameraControls.touches.two = CameraControls.ACTION.TOUCH_ROTATE;

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
