import * as THREE from 'three';

export default class Objects {
  // Utilities
  /** Config */
  readonly config: Config;

  // Objects Functionality
  /** Container */
  readonly container: THREE.Object3D;
  /** Items */
  readonly items: THREE.Object3D[];

  constructor(_params: {config: Config}) {
    // Options
    this.config = _params.config;

    // Set up
    this.container = new THREE.Object3D();
    this.container.matrixAutoUpdate = false;

    this.items = [];
  }

  add(
    _object: THREE.Object3D,
    _params?: {
      isDynamic?: boolean;
      position?: THREE.Vector3;
      rotation?: THREE.Euler;
    }
  ) {
    const position = _params?.position?.clone() || _object.position;
    const rotation = _params?.rotation?.clone() || _object.rotation;

    _object.position.copy(position);
    _object.rotation.copy(rotation);

    this.container.add(_object);

    if (this.config.showBoundingBoxes) {
      const boundingBox = new THREE.BoxHelper(_object);
      this.container.add(boundingBox);
    }

    if (!_params?.isDynamic) stopMatrixAutoUpdates(_object, true);

    this.items.push(_object);

    return _object;
  }
}

function stopMatrixAutoUpdates(_parent: THREE.Object3D, _recursive: boolean) {
  _parent.matrixAutoUpdate = false;
  _parent.updateMatrix();

  if (_recursive) {
    for (const _child of _parent.children) {
      stopMatrixAutoUpdates(_child, true);
    }
  }
}
