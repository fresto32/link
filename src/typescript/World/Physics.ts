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
      front,
      back,
      left,
      right,
    }

    const rotate = (rotate: direction, speed: number) => {
      if (rotate === direction.front || rotate === direction.back) {
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

    const move = (
      move: direction | undefined,
      strafe: direction | undefined,
      speed: number
    ) => {
      if (move === direction.left || move === direction.right) {
        throw console.error('Cannot move left or right.');
      }
      if (strafe === direction.front || strafe === direction.back) {
        throw console.error('Cannot strafe forwards or backwards.');
      }

      const eulerDirection = this.avatar.direction.clone();

      // 8 Movement directions...
      if (move === direction.front && strafe === direction.left) {
        eulerDirection.y += Math.PI / 4;
      } else if (move === direction.front && strafe === direction.right) {
        eulerDirection.y -= Math.PI / 4;
      } else if (move === direction.back && strafe === direction.left) {
        eulerDirection.y += Math.PI;
        eulerDirection.y -= Math.PI / 4;
      } else if (move === direction.back && strafe === direction.right) {
        eulerDirection.y += Math.PI;
        eulerDirection.y += Math.PI / 4;
      } else if (strafe === direction.left) {
        eulerDirection.y += Math.PI / 2;
      } else if (strafe === direction.right) {
        eulerDirection.y -= Math.PI / 2;
      } else if (move === direction.back) {
        eulerDirection.y += Math.PI;
      } else {
        // NO OP - just forward direction.
      }

      // Convert Euler to directional vector...
      // Same as finding the side lengths of a triangle with angle
      // eulerDirection.y with adjacent side as z and opposite side as x since
      // we are, effectively, in a 2D plane.
      const impulse = new THREE.Vector3(
        -Math.sin(eulerDirection.y),
        0,
        -Math.cos(eulerDirection.y)
      );

      impulse.multiplyScalar(speed);

      this.avatar.position.add(impulse);
    };

    this.time.on('tick', () => {
      const speed = 0.5;
      if (!this.avatar.boundingBox) return;
      if (this.avatarIsColliding()) console.log('colliding');

      // Controls
      if (!this.config.touch) {
        const actions = this.controls.actions;

        let movement: direction | undefined = undefined;
        if (actions.up) movement = direction.front;
        else if (actions.down) movement = direction.back;

        let strafe: direction | undefined = undefined;
        if (actions.strafeLeft) strafe = direction.left;
        else if (actions.strafeRight) strafe = direction.right;

        if (movement !== undefined || strafe !== undefined) {
          move(movement, strafe, speed);
        }

        if (actions.left) rotate(direction.left, speed / 5);
        if (actions.right) rotate(direction.right, speed / 5);
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
