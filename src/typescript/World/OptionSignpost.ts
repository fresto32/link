import * as THREE from 'three';
import Signpost from './Signpost';
import Sounds from './Sounds';
import Firework from './Fireworks';
import Time from '../Utils/Time';
import Sizes from '../Utils/Sizes';

export default class Option extends Signpost {
  // TODO Hide viewingBoundingBox from public accessibility
  /** Viewing Bounding Box */
  public viewingBoundingBox!: THREE.Box3;
  /** Is this a correct option? */
  private isCorrectOption: boolean;
  /** Has this sign been interacted with already? */
  private hasHadInteraction: boolean;
  /** Is this signpost's lights on? */
  private isLightOn: boolean;
  /** Sounds */
  private readonly sounds: Sounds;
  /** Time */
  private readonly time: Time;
  /** Sizes */
  private readonly sizes: Sizes;

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
    this.isLightOn = false;
    this.hasHadInteraction = false;
    this.setViewingBoundingBox();
  }

  /**
   * Set Viewing Bounding Box
   *
   * The bounding box for which the signpost lights up.
   */
  private setViewingBoundingBox() {
    const width = this.distanceBetweenPoles * 3;
    const depth = width * (2 / 3);
    const height = 50;
    const geometry = new THREE.BoxGeometry(width, height, depth);

    const mesh = new THREE.Mesh(geometry);
    mesh.geometry.computeBoundingBox();

    this.viewingBoundingBox = new THREE.Box3().setFromObject(mesh);
  }

  /**
   * Light Up Signpost
   */
  public switchSignpostLightOn() {
    if (!this.isLightOn) {
      addSignpostBanner(this.$canvas, this.sizes);

      if (!this.hasHadInteraction) {
        this.plankMaterial.emissive = new THREE.Color('gray');
        this.poleMaterial.emissive = new THREE.Color('brown');
        this.isLightOn = true;
      }
    }
  }

  /**
   * Turn Off Signpost Light
   */
  public switchSignpostLightOff() {
    if (this.isLightOn) {
      removeSignpostBanner(this.$canvas);

      if (!this.hasHadInteraction) {
        this.plankMaterial.emissive = new THREE.Color('black');
        this.poleMaterial.emissive = new THREE.Color('black');
        this.isLightOn = false;
      }
    }
  }

  /**
   * InteractionLogic
   */
  public interaction() {
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

/**
 * Adds the signpost to the client's banner.
 *
 * @param $canvas The canvas to be put on the banner.
 * @param sizes Sizes for determining viewport sizes.
 */
function addSignpostBanner($canvas: HTMLCanvasElement, sizes: Sizes) {
  const $newCanvas = cloneCanvas($canvas);

  const newHeight = sizes.viewport.height / 3;
  const newWidth = newHeight * sizes.viewport.aspect * devicePixelRatio;

  resizeCanvas($newCanvas, newWidth, newHeight);

  $('#banner').append($newCanvas);
}

/**
 * Removes $canvas from the client's banner.
 *
 * @param $canvas The canvas to remove from the client's banner.
 */
function removeSignpostBanner($canvas: HTMLCanvasElement) {
  $('.' + $canvas.className).each((e, i) => i.remove());
}

/**
 * Clones a canvas and its class names.
 */
function cloneCanvas($oldCanvas: HTMLCanvasElement) {
  // create a new canvas...
  const $newCanvas = document.createElement('canvas');
  const context = $newCanvas.getContext('2d') as CanvasRenderingContext2D;

  // set dimensions...
  $newCanvas.width = $oldCanvas.width;
  $newCanvas.height = $oldCanvas.height;

  // apply the old canvas to the new one...
  context.drawImage($oldCanvas, 0, 0);

  // copy over class names...
  $newCanvas.className = $oldCanvas.className;

  //return the new canvas.
  return $newCanvas;
}

/**
 * Resizes $canvas to newWidth and newHeight.
 */
function resizeCanvas(
  $canvas: HTMLCanvasElement,
  newWidth: number,
  newHeight: number
): void {
  const currentWidth = $canvas.width;
  const currentHeight = $canvas.height;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = currentWidth;
  tempCanvas.height = currentHeight;

  const tempContext = tempCanvas.getContext('2d') as CanvasRenderingContext2D;
  tempContext.drawImage($canvas, 0, 0);

  $canvas.width = newWidth;
  $canvas.height = newHeight;

  const context = $canvas.getContext('2d') as CanvasRenderingContext2D;
  context.drawImage(
    tempCanvas,
    0,
    0,
    currentWidth,
    currentHeight,
    0,
    0,
    newWidth,
    newHeight
  );
}
