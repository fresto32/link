import CANNON from 'cannon';
import * as THREE from 'three';

import Time from '../Utils/Time';
import Controls from '../Controls';

export default class Physics {
  // Utilities
  /** Time */
  readonly time: Time;

  // Functionality
  /** Config */
  readonly config: Config;
  /** Debug Foler */
  debugFolder!: dat.GUI;
  /** World */
  world!: CANNON.World;
  /** Controls */
  controls: Controls;

  // Physics Functionality
  /** Avatar */
  avatar!: {
    position: THREE.Vector3;
    boundingBox?: THREE.Box3;
  };
  collisionBoundingBoxes: THREE.Box3[];

  constructor(_params: {time: Time; config: Config; controls: Controls}) {
    this.time = _params.time;
    this.config = _params.config;
    this.controls = _params.controls;

    this.collisionBoundingBoxes = [];
    this.setAvatar();
  }

  /**
   * Set Avatar
   */
  setAvatar() {
    this.avatar = {position: new THREE.Vector3()};
    this.avatar.position.set(0, 0, 0);

    const speed = 1;

    this.time.on('tick', () => {
      if (!this.avatar.boundingBox || this.avatarIsColliding()) return;

      // Controls
      if (!this.config.touch) {
        if (this.controls.actions.up) this.avatar.position.z -= speed;
        if (this.controls.actions.down) this.avatar.position.z += speed;
        if (this.controls.actions.left) this.avatar.position.x -= speed;
        if (this.controls.actions.right) this.avatar.position.x += speed;
      } else {
        const angle = this.controls.touch.joysticks.left.angle!.value;
        if (angle === 0) return;
        else if (angle > 1.4 && angle < 2.8) this.avatar.position.z -= speed;
        else if (angle > -1.6 && angle < -0.2) this.avatar.position.z += speed;
        else if (angle > -0.2 && angle < 1.4) this.avatar.position.x += speed;
        else this.avatar.position.x -= speed;
      }
    });
  }

  setAvatarBoundingBox(_boundingBox: THREE.Box3) {
    this.avatar.boundingBox = _boundingBox.clone();
  }

  /**
   * Add Collision Bounding Boxes
   *
   * @param _boundingBoxes Bounding boxes to which the avatar cannot enter.
   */
  addCollisionBoundingBox(_boundingBoxes: THREE.Box3[]) {
    this.collisionBoundingBoxes.push(..._boundingBoxes);
  }

  /**
   * Determines if _box is colliding with any collisionBoundingBoxes.
   */
  avatarIsColliding() {
    if (!this.avatar.boundingBox) {
      throw console.error('No avatar bounding box.');
    }

    const avatarBoundingBox = this.avatar.boundingBox!;

    const avatarMidPoint = new THREE.Vector3().copy(avatarBoundingBox.min);
    avatarMidPoint.add(avatarBoundingBox.max.clone().multiplyScalar(0.5));

    return this.collisionBoundingBoxes.some(box => {
      return (
        box.containsPoint(this.avatar.boundingBox!.min) ||
        box.containsPoint(this.avatar.boundingBox!.max) ||
        box.containsPoint(avatarMidPoint)
      );
    });
  }
}
