import * as THREE from 'three';
import Signpost from './Signpost';

export default class Option extends Signpost {
  /** Viewing Bounding Box */
  viewingBoundingBox!: THREE.Box3;

  constructor(_params: {text: string; picture: THREE.Texture | null}) {
    super(_params);

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
    this.plankMaterial.emissive = new THREE.Color('gray');
    this.poleMaterial.emissive = new THREE.Color('brown');
  }

  /**
   * Turn Off Signpost Light
   */
  switchSignpostLightOff() {
    this.plankMaterial.emissive = new THREE.Color('black');
    this.poleMaterial.emissive = new THREE.Color('black');
  }
}
