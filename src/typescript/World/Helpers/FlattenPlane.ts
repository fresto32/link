import * as THREE from 'three';
import faceInPlaneContainingPoint from './FaceInPlaneContainingPoint';

/**
 * Flattens the plane so that the floor of each box lies on a plane that is
 * flat in this region.
 *
 * @param plane The plane to be flattened.
 * @param boxes The boxes of whose floor the plane will be flattened to.
 */
export function flattenPlaneToBoxes(plane: THREE.Mesh, boxes: THREE.Box3[]) {
  boxes.forEach(box => {
    const min = box.min;
    const max = box.max;
    //
    // C: (minX, maxZ)    D: (maxX, maxZ)
    //          x__________________x
    //          |                  |
    //          |                  |
    //          |                  |
    //          |   Floor of Box   |
    //          |                  |
    //          |                  |
    //          x__________________x
    // A: (minX, minZ)    B: (maxX, minZ)
    //

    const pts: THREE.Vector3[] = [
      new THREE.Vector3(min.x, min.y, min.z), // pt A
      new THREE.Vector3(max.x, min.y, min.z), // pt B
      new THREE.Vector3(min.x, min.y, max.z), // pt C
      new THREE.Vector3(max.x, min.y, max.z), // pt D
    ];

    flattenPlaneToPoints(plane, pts, min.y);
  });
}

/**
 * Flattens the plane at each point to height.
 *
 * @param plane The plane to be flattened.
 * @param pts The points on the plane that should be of height height.
 * @param height The height of the flattened region.
 */
export function flattenPlaneToPoints(
  plane: THREE.Mesh,
  pts: THREE.Vector3[],
  height: number
) {
  pts.forEach(pt => {
    const faceInPlaneContainingPt = faceInPlaneContainingPoint(
      plane,
      pt.x,
      pt.z
    );

    if (faceInPlaneContainingPt === null)
      throw console.error('Plane does not contain ' + pt + '.');

    if (plane.geometry instanceof THREE.BufferGeometry)
      throw console.error('Plane buffer geometry not supported.');

    plane.geometry.vertices[faceInPlaneContainingPt.a].y = height;
    plane.geometry.vertices[faceInPlaneContainingPt.b].y = height;
    plane.geometry.vertices[faceInPlaneContainingPt.c].y = height;
  });
}
