import * as THREE from 'three';
import Signpost from './Signpost';
import Sounds from './Sounds';
import Firework from './Fireworks';
import Time from '../Utils/Time';
import Sizes from '../Utils/Sizes';

export default class Option extends Signpost {
  /** Viewing Bounding Box */
  viewingBoundingBox!: THREE.Box3;
  /** Is this a correct option? */
  isCorrectOption: boolean;
  /** Has this sign been interacted with already? */
  hasHadInteraction: boolean;
  /** Sounds */
  sounds: Sounds;
  /** Time */
  time: Time;
  /** Sizes */
  sizes: Sizes;

  constructor(_params: {
    text: string;
    picture: THREE.Texture | null;
    textTextureAnisotropy: number;
    isCorrectOption: boolean;
    sounds: Sounds;
    time: Time;
    sizes: Sizes;
  }) {
    super(_params);

    // Parameters
    this.isCorrectOption = _params.isCorrectOption;
    this.sounds = _params.sounds;
    this.time = _params.time;
    this.sizes = _params.sizes;

    // Set Up
    this.hasHadInteraction = false;
    this.setViewingBoundingBox();
  }

  /**
   * Set Viewing Bounding Box
   *
   * The bounding box for which the signpost lights up.
   */
  setViewingBoundingBox() {
    const width = this.distanceBetweenPoles * 3;
    const depth = width * (2 / 3);
    const height = 50;
    const geometry = new THREE.BoxGeometry(width, height, depth);

    const mesh = new THREE.Mesh(geometry);
    mesh.position.z = depth / 2;
    mesh.geometry.computeBoundingBox();

    this.viewingBoundingBox = new THREE.Box3().setFromObject(mesh);
  }

  /**
   * Light Up Signpost
   */
  switchSignpostLightOn() {
    if (this.hasHadInteraction) return;
    this.plankMaterial.emissive = new THREE.Color('gray');
    this.poleMaterial.emissive = new THREE.Color('brown');
  }

  /**
   * Turn Off Signpost Light
   */
  switchSignpostLightOff() {
    if (this.hasHadInteraction) return;
    this.plankMaterial.emissive = new THREE.Color('black');
    this.poleMaterial.emissive = new THREE.Color('black');
  }

  /**
   * InteractionLogic
   */
  interaction() {
    if (this.hasHadInteraction) return;

    if (this.isCorrectOption) {
      // Set material to be emissive
      this.plankMaterial.emissive = new THREE.Color('green');
      this.poleMaterial.emissive = new THREE.Color('green');

      // Play positive sound
      this.sounds.play('positiveTone');

      // Fire fireworks
      const trajectoryHeight = 40;
      const particleSpread = 10;
      const numberOfParticles = 40;
      const fireworks = [
        new Firework({
          sizes: this.sizes,
          time: this.time,
          startingPosition: new THREE.Vector3(
            -this.distanceBetweenPoles / 2,
            0,
            0
          ),
          trajectoryHeight: trajectoryHeight,
          particleSpread: particleSpread,
          numberOfParticles: numberOfParticles,
        }),
        new Firework({
          sizes: this.sizes,
          time: this.time,
          startingPosition: new THREE.Vector3(
            this.distanceBetweenPoles / 2,
            0,
            0
          ),
          trajectoryHeight: trajectoryHeight,
          particleSpread: particleSpread,
          numberOfParticles: numberOfParticles,
        }),
      ];

      // Launch each firework...
      fireworks.forEach(firework => {
        this.container.add(firework.container);
        firework.launch();
      });
    } else {
      this.plankMaterial.emissive = new THREE.Color('red');
      this.poleMaterial.emissive = new THREE.Color('red');
      this.sounds.play('glitch');
    }

    this.hasHadInteraction = true;
  }
}
