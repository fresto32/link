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
    this.setCameraControls();
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

      const impulse = to2dDirectionVector(eulerDirection).normalize();

      impulse.multiplyScalar(speed);

      this.avatar.position.add(impulse);
    };

    const touchMove = (angle: number, speed: number) => {
      if (angle === 0) return;

      angle -= Math.PI / 2 - this.avatar.direction.y;

      const impulse = to2dDirectionVector(new THREE.Euler(0, angle, 0));

      impulse.normalize();
      impulse.multiplyScalar(speed);

      this.avatar.position.add(impulse);
    };

    const movementSpeed = 0.5;
    const rotationSpeed = 0.1;
    const boxCenter = new THREE.Vector3();
    const boxToAvatarNormal = new THREE.Vector3();
    this.time.on('tick', () => {
      if (!this.avatar.boundingBox) return;

      // handle collisions...
      const offendingBox = this.avatarCollidingWithBox();
      if (offendingBox !== undefined) {
        offendingBox.getCenter(boxCenter);

        boxToAvatarNormal.subVectors(this.avatar.position, boxCenter);
        boxToAvatarNormal.y = 0;
        boxToAvatarNormal.normalize();
        boxToAvatarNormal.multiplyScalar(movementSpeed * 0.2);

        this.avatar.position.add(boxToAvatarNormal);
        return;
      }

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
          move(movement, strafe, movementSpeed);
        }

        if (actions.left) rotate(direction.left, rotationSpeed);
        if (actions.right) rotate(direction.right, rotationSpeed);
      } else {
        const angle = this.controls.touch.joysticks.left.angle!.value;
        touchMove(angle, movementSpeed);
      }
    });
  }

  /**
   * Set Camera Controls
   *
   * Keep camera's azimuth angle to be oriented towards avatar's direction.
   */
  setCameraControls() {
    this.time.on('tick', () => {
      this.controls.camera.azimuthAngle = this.avatar.direction.y;
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
  avatarCollidingWithBox(): undefined | THREE.Box3 {
    if (!this.avatar.boundingBox) {
      throw console.error('No avatar bounding box.');
    }

    const avatarBoundingBox = this.avatar.boundingBox!;

    const avatarMidPoint = new THREE.Vector3().copy(avatarBoundingBox.min);
    avatarMidPoint.add(avatarBoundingBox.max.clone().multiplyScalar(0.5));

    let offendingBox: THREE.Box3 | undefined = undefined;

    this.collisionBoundingBoxes.some(box => {
      if (box.intersectsBox(this.avatar.boundingBox!)) {
        offendingBox = box.clone();
        return true;
      }
      return false;
    });

    return offendingBox;
  }
}

/**
 * Converts a Euler to a directional vector.
 */
function to2dDirectionVector(euler: THREE.Euler) {
  // Same as finding the side lengths of a triangle with angle euler.y with
  // adjacent side as z and opposite side as x since we are in a 2D plane.
  return new THREE.Vector3(-Math.sin(euler.y), 0, -Math.cos(euler.y));
}
