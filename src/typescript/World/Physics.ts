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
    direction: THREE.Euler;
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
    this.avatar = {
      position: new THREE.Vector3(),
      direction: new THREE.Euler(),
    };

    enum direction {
      forward,
      backward,
      left,
      right,
    }

    const rotate = (rotate: direction, speed: number) => {
      if (rotate === direction.forward || rotate === direction.backward) {
        throw console.error('Cannot rotate forwards or backwards.');
      }

      if (rotate === direction.left) {
        this.avatar.direction.y += speed;
      } else if (rotate === direction.right) {
        this.avatar.direction.y -= speed;
      } else {
        throw console.error('Unreachable code.');
      }
    };

    const move = (move: direction, speed: number) => {
      if (move === direction.left || move === direction.right) {
        throw console.error('Cannot move left or right.');
      }

      // Convert Euler to directional vector...
      // Same as finding the side lengths of a triangle with angle
      // this.avatar.direction.y with adjacent side as z and opposite side as x
      // since we are, effectively, in a 2D plane.
      const impulse = new THREE.Vector3(
        -Math.sin(this.avatar.direction.y),
        0,
        -Math.cos(this.avatar.direction.y)
      );

      if (move === direction.backward) impulse.multiplyScalar(-1);

      impulse.multiplyScalar(speed);

      this.avatar.position.add(impulse);
    };

    const speed = 0.5;

    this.time.on('tick', () => {
      if (!this.avatar.boundingBox) return;
      if (this.avatarIsColliding()) console.log('colliding');

      // Controls
      if (!this.config.touch) {
        if (this.controls.actions.up) move(direction.forward, speed);
        if (this.controls.actions.down) move(direction.backward, speed);
        if (this.controls.actions.left) rotate(direction.left, speed / 5);
        if (this.controls.actions.right) rotate(direction.right, speed / 5);
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
      return box.intersectsBox(this.avatar.boundingBox!);
    });
  }
}
