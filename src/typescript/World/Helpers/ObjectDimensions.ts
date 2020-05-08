import * as THREE from 'three';

export default function objectDimensions(
  object: THREE.Object3D
): THREE.Vector3 {
  const dimensions = new THREE.Vector3();
  const boundingBox = new THREE.BoxHelper(object);
  if (boundingBox.geometry.boundingBox === null)
    boundingBox.geometry.computeBoundingBox();
  boundingBox.geometry.boundingBox!.getSize(dimensions);
  return dimensions;
}
