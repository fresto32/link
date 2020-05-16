import * as THREE from 'three';
import boundingBox from './BoundingBox';

export default function objectDimensions(
  object: THREE.Object3D
): THREE.Vector3 {
  const size = new THREE.Vector3();
  boundingBox(object).getSize(size);
  return size;
}
