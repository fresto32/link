import * as THREE from 'three';
import Physics from './Physics';
import boundingBox from './Helpers/BoundingBox';

export default class Objects {
  // Utilities
  /** Config */
  readonly config: Config;

  // Objects Functionality
  /** Container */
  readonly container: THREE.Object3D;
  /** Items */
  readonly items: THREE.Object3D[];
  /** Physics */
  readonly physics: Physics;

  constructor(_params: {config: Config; physics: Physics}) {
    // Options
    this.config = _params.config;
    this.physics = _params.physics;

    // Set up
    this.container = new THREE.Object3D();
    this.container.matrixAutoUpdate = false;

    this.items = [];
  }

  add(
    _object: THREE.Object3D,
    _params?: {
      isDynamic?: boolean;
      isCollidable?: boolean;
      collisionBoundingBoxes?: THREE.Box3[];
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

    if (_params?.isCollidable) {
      if (_params?.collisionBoundingBoxes === undefined) {
        this.physics.addCollisionBoundingBox([boundingBox(_object)]);
      } else {
        this.physics.addCollisionBoundingBox(_params.collisionBoundingBoxes);
      }
    }

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
