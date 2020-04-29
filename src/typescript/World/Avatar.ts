import * as THREE from 'three';
import Time from '../Utils/Time';
import Resources from '../Resources';
import Physics from './Physics';
import setOnPlane from './Helpers/SetOnPlane';

export default class Avatar {
  /** Container */
  container: THREE.Object3D;
  /** Resources */
  readonly resources: Resources;
  /** Time */
  readonly time: Time;
  /** Pirate Captain */
  pirateCaptain!: THREE.Object3D;
  /** Physics */
  readonly physics: Physics;
  /** Ground */
  readonly ground: THREE.Mesh;

  constructor(_params: {
    time: Time;
    resources: Resources;
    physics: Physics;
    ground: THREE.Mesh;
  }) {
    // Container
    this.container = new THREE.Object3D();
    this.container.matrixAutoUpdate = true;

    // Parameters
    this.time = _params.time;
    this.resources = _params.resources;
    this.physics = _params.physics;
    this.ground = _params.ground;

    // Setting up scenegraph
    this.setPirateCaptain();
  }

  /**
   * Set Pirate Captain
   *
   * A pirate captain is used as the main model of the avatar.
   */
  setPirateCaptain() {
    this.pirateCaptain = this.resources.items.pirateCaptain.scene.children[0];
    this.pirateCaptain.scale.set(4, 4, 4);
    this.pirateCaptain.position.copy(this.physics.avatar.position);
    this.container.add(this.pirateCaptain);

    this.time.on('tick', () => {
      const x = this.physics.avatar.position.x;
      const z = this.physics.avatar.position.z;
      setOnPlane(this.ground, this.pirateCaptain, x, z);
    });
  }
}
