import * as THREE from 'three';
import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils';

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
 * @param object The object that is to be clustered.
 * @param objectPositions The positions where each object should reside in the
 * generated meshes.
 * @param globalTransform The transform to be applied to each object before
 * their placement in a mesh. To apply the current matrix of object, pass null.
 * @returns A Cluster for each child object of object.
 */
export default function generateObjectCluster(
  object: THREE.Object3D,
  objectPositions: THREE.Vector3[],
  globalTransform: THREE.Matrix4 | null = null
): Cluster[] {
  // Since we are supplying positions via objectPositions, we don't want any
  // residual positions in object to affect later transformations.
  if (globalTransform === null) {
    object.position.copy(new THREE.Vector3(0, 0, 0));
  }
  object.updateMatrix();

  globalTransform = globalTransform || object.matrix;

  // unifiedMeshes refers to those new meshes which contain a single geometry
  // that encapsulates an object at each position of objectPositions.
  const unifiedMeshes: Cluster[] = [];

  object.children.forEach(child => {
    if (child.type !== 'Mesh') {
      // Handle children of object that are more collections of meshs (i.e.
      // THREE.Group or THREE.Object3D)...
      unifiedMeshes.push(
        ...generateObjectCluster(child, objectPositions, globalTransform)
      );
    } else if (child.type === 'Mesh') {
      // Handle children of object that are themselves meshes...
      unifiedMeshes.push(
        ...setObjectsInMeshes(
          [child as THREE.Mesh],
          objectPositions,
          globalTransform!
        )
      );
    } else {
      throw console.error('Unexpected type of ' + child.type + ' .');
    }
  });

  if (object.type === 'Mesh') {
    // Handle the case where the object itself is a mesh...
    unifiedMeshes.push(
      ...setObjectsInMeshes(
        [object as THREE.Mesh],
        objectPositions,
        globalTransform
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
 */
function setObjectsInMeshes(
  objectMeshes: THREE.Mesh[],
  objectMeshPositions: THREE.Vector3[],
  globalTransform: THREE.Matrix4
): Cluster[] {
  const unifiedMeshes: Cluster[] = [];

  objectMeshes.forEach(mesh => {
    unifiedMeshes.push(
      setObjectsInMesh(mesh, objectMeshPositions, globalTransform)
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
 */
function setObjectsInMesh(
  objectMesh: THREE.Mesh,
  positions: THREE.Vector3[],
  globalTransform: THREE.Matrix4
): Cluster {
  const geometries: THREE.BufferGeometry[] = [];
  const collisionBoxes: THREE.Box3[] = [];

  // Apply each transformation to a model at every position...
  positions.forEach(position => {
    objectMesh.updateMatrix();
    const objectTransform = objectMesh.matrix;

    const positionTransform = new THREE.Matrix4();
    positionTransform.setPosition(position);

    const geometry = (objectMesh.geometry as THREE.BufferGeometry).clone();
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

  return {
    mesh: new THREE.Mesh(mergedGeometry, objectMesh.material),
    boundingBoxes: collisionBoxes,
  };
}
