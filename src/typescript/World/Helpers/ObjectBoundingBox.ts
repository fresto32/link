import * as THREE from 'three';

export default function ObjectBoundingBox(object: THREE.Object3D): THREE.Box3 {
  const boundingBox = new THREE.BoxHelper(object);
  if (boundingBox.geometry.boundingBox === null)
    boundingBox.geometry.computeBoundingBox();
  return boundingBox.geometry.boundingBox!;
}
