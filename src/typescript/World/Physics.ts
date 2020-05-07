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
  };

  constructor(_params: {time: Time; config: Config; controls: Controls}) {
    this.time = _params.time;
    this.config = _params.config;
    this.controls = _params.controls;

    // Set up
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
}
