import * as THREE from 'three';

export default function boundingBox(object: THREE.Object3D): THREE.Box3 {
  return new THREE.Box3().setFromObject(object);
}
