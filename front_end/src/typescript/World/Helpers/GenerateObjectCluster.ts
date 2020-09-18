import * as THREE from 'three';
import {BufferGeometryUtils} from './ThreeHelpers/BufferGeometryUtils';
import setOnPlane from './SetOnPlane';

/**
 * Encapsulates the mesh of one item of an object cluster with unified geometry.
 * Also, exposes the individual bounding boxes of each object in the mesh - to
 * be used for collision calculations, for example.
 */
interface Cluster {
  mesh: THREE.Mesh;
  boundingBoxes: THREE.Box3[];
}

/**
 * Generates an array of meshes that contain a collection of object rendered at
 * each position of objectPositions. Returned meshes are optimised for
 * performance - geometries are merged and minimal materials used.
 *
 * In other words, if an object is placed at 50 locations and the object
 * contains 3 meshes, a total of 3 meshes will be returned.
 *
 * @param object The object that is to be clustered.
 * @param objectPositions The positions where each object should reside in the
 * generated meshes.
 * @param globalTransform The transform to be applied to each object before
 * their placement in a mesh. To apply the current matrix of object, pass null.
 * @param rotationTransform If specified, rotates each individual object to the
 * same degree as rotateRelativeTo axis on the face of a plane at the
 * objectPosition rotating the object. The axis which the object rotates about
 * is objectRotationAxis.
 * @returns A Cluster for each child object of object.
 */
export default function generateObjectCluster(
  object: THREE.Object3D,
  objectPositions: THREE.Vector3[],
  globalTransform?: THREE.Matrix4,
  rotationTransform?: {
    plane: THREE.Mesh;
    objectRotationAxis: 'x' | 'y' | 'z';
    rotateRelativeTo: 'x' | 'y' | 'z';
  }
): Cluster[] {
  // Since we are supplying positions via objectPositions, we don't want any
  // residual positions in object to affect later transformations.
  if (!globalTransform) {
    object.position.copy(new THREE.Vector3(0, 0, 0));
  }
  object.updateMatrix();

  globalTransform = globalTransform || object.matrix;

  // unifiedMeshes refers to those new meshes which contain a single geometry
  // that encapsulates an object at each position of objectPositions.
  const unifiedMeshes: Cluster[] = [];

  object.children.forEach(child => {
    if (child.type === 'Object3D' || child.type === 'Group') {
      // Handle children of object that are more collections of meshs (i.e.
      // THREE.Group or THREE.Object3D)...
      unifiedMeshes.push(
        ...generateObjectCluster(
          child,
          objectPositions,
          globalTransform,
          rotationTransform
        )
      );
    } else if (child.type === 'Mesh') {
      // Handle children of object that are themselves meshes...
      unifiedMeshes.push(
        ...setObjectsInMeshes(
          [child as THREE.Mesh],
          objectPositions,
          globalTransform!,
          rotationTransform
        )
      );
    } else {
      throw new Error('Unexpected type of ' + child.type + '.');
    }
  });

  if (object.type === 'Mesh') {
    // Handle the case where the object itself is a mesh...
    unifiedMeshes.push(
      ...setObjectsInMeshes(
        [object as THREE.Mesh],
        objectPositions,
        globalTransform,
        rotationTransform
      )
    );
  }

  return unifiedMeshes;
}

/**
 * Sets each geometry in objectMeshes to each position in objectPositions in
 * a new mesh. Optimised for performance - geometries are merged and minimal
 * materials used.
 *
 * @param objectMeshes The meshes that contain geometries for amalgamation and
 * the object's material.
 * @param objectPositions The positions where each object should reside in the
 * generated meshes.
 * @param globalTransform The transform to be applied to each object before
 * their placement in a mesh. To apply the current matrix of object, pass null.
 * @param rotationTransform If specified, rotates each individual object to the
 * same degree as rotateRelativeTo axis on the face of a plane at the
 * objectPosition rotating the object. The axis which the object rotates about
 * is objectRotationAxis.
 */
function setObjectsInMeshes(
  objectMeshes: THREE.Mesh[],
  objectMeshPositions: THREE.Vector3[],
  globalTransform: THREE.Matrix4,
  rotationTransform?: {
    plane: THREE.Mesh;
    objectRotationAxis: 'x' | 'y' | 'z';
    rotateRelativeTo: 'x' | 'y' | 'z';
  }
): Cluster[] {
  const unifiedMeshes: Cluster[] = [];

  objectMeshes.forEach(mesh => {
    unifiedMeshes.push(
      setObjectsInMesh(
        mesh,
        objectMeshPositions,
        globalTransform,
        rotationTransform
      )
    );
  });

  return unifiedMeshes;
}

/**
 * Sets the geometry in objectMesh to each position in objectPositions in
 * a new mesh. Optimised for performance - geometries are merged and minimal
 * materials used.
 *
 * @param objectMesh The mesh that contains the geometry to be used at each
 * position in objectPositions (also contains the material).
 * @param objectPositions The positions where each object should reside in the
 * generated meshes.
 * @param globalTransform The transform to be applied to each object before
 * their placement in a mesh. To apply the current matrix of object, pass null.
 * @param rotationTransform If specified, rotates each individual object to the
 * same degree as rotateRelativeTo axis on the face of a plane at the
 * objectPosition rotating the object. The axis which the object rotates about
 * is objectRotationAxis.
 */
function setObjectsInMesh(
  objectMesh: THREE.Mesh,
  positions: THREE.Vector3[],
  globalTransform: THREE.Matrix4,
  rotationTransform?: {
    plane: THREE.Mesh;
    objectRotationAxis: 'x' | 'y' | 'z';
    rotateRelativeTo: 'x' | 'y' | 'z';
  }
): Cluster {
  const geometries: THREE.BufferGeometry[] = [];
  const collisionBoxes: THREE.Box3[] = [];

  // Apply each transformation to a model at every position...
  positions.forEach(position => {
    let mesh = objectMesh;

    if (rotationTransform) {
      mesh = objectMesh.clone();
      setOnPlane(
        rotationTransform.plane,
        mesh,
        position.x,
        position.z,
        rotationTransform.objectRotationAxis,
        rotationTransform.rotateRelativeTo
      );
    }

    mesh.updateMatrix();
    const objectTransform = mesh.matrix;
    if (rotationTransform) objectTransform.setPosition(0, 0, 0);

    const positionTransform = new THREE.Matrix4();
    positionTransform.setPosition(position);

    const geometry = (mesh.geometry as THREE.BufferGeometry).clone();
    geometry.applyMatrix4(objectTransform);
    geometry.applyMatrix4(globalTransform);
    geometry.applyMatrix4(positionTransform);

    geometries.push(geometry);

    geometry.computeBoundingBox();
    collisionBoxes.push(geometry.boundingBox!);
  });

  const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
    geometries,
    false
  );

  /* istanbul ignore next */
  return {
    mesh: new THREE.Mesh(
      mergedGeometry ? mergedGeometry : undefined,
      objectMesh.material
    ),
    boundingBoxes: collisionBoxes,
  };
}
