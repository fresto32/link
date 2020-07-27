import * as THREE from 'three';
import Time from '../Utils/Time';
import Resources from '../Resources';
import Physics from './Physics';
import SpawnIsland from './SpawnIsland';
import setOnPlane from './Helpers/SetOnPlane';
import boundingBox from './Helpers/BoundingBox';

export default class Avatar {
  /** Container */
  public readonly container: THREE.Object3D;
  /** Resources */
  private readonly resources: Resources;
  /** Time */
  private readonly time: Time;
  /** Physics */
  private readonly physics: Physics;
  /** Ground */
  private readonly ground: THREE.Mesh;
  /** SpawnIsland */
  private readonly spawnIsland: SpawnIsland;
  /** Pirate Captain */
  public readonly pirateCaptain!: THREE.Object3D;

  constructor(_params: {
    time: Time;
    resources: Resources;
    physics: Physics;
    ground: THREE.Mesh;
    spawnIsland: SpawnIsland;
  }) {
    // Container
    this.container = new THREE.Object3D();
    this.container.matrixAutoUpdate = true;

    // Parameters
    this.time = _params.time;
    this.resources = _params.resources;
    this.physics = _params.physics;
    this.ground = _params.ground;
    this.spawnIsland = _params.spawnIsland;

    // Setting up scenegraph
    this.pirateCaptain = this.resources.models.pirateCaptain.scene.children[0];
    this.setPirateCaptain();
    this.setSpawnIslandInteractions();
  }

  /**
   * Set Pirate Captain
   *
   * A pirate captain is used as the main model of the avatar.
   */
  private setPirateCaptain() {
    this.pirateCaptain.scale.set(4, 4, 4);
    this.pirateCaptain.position.copy(this.physics.avatar.position);
    this.container.add(this.pirateCaptain);

    this.time.on('tick', () => {
      this.physics.setAvatarBoundingBox(boundingBox(this.pirateCaptain));

      const x = this.physics.avatar.position.x;
      const z = this.physics.avatar.position.z;
      setOnPlane(this.ground, this.pirateCaptain, x, z);

      this.pirateCaptain.rotation.copy(this.physics.avatar.direction);
    });
  }

  /**
   * Set Spawn Island Interactions
   *
   * The interactions between avatar and spawn island objects.
   */
  private setSpawnIslandInteractions() {
    this.spawnIsland.buildings.forEach(building =>
      building.setAvatarEntryInteraction(this, this.time)
    );
  }
}
