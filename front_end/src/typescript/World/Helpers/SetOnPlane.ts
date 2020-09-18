import * as THREE from 'three';
import faceInPlaneContainingPoint from './FaceInPlaneContainingPoint';

/**
 * Finds the corresponding y on a flat or undulating plane given x and z
 * coordinates. If object is supplied, the object's position is updated to
 * reflect these x, y, and z coordinates. If objectRotationAxis and
 * rotateRelativeTo are specified, then the object is rotated on
 * objectRotationAxis by an angle relative to the plane axis of
 * rotateRelativeTo.
 *
 * @param plane Any mesh with a THREE.Geometry that does not overlap itself
 * (i.e. is plane-like). Thus, plane can be a mesh of THREE.PlaneGeometry with
 * custom vertices.
 * @param object Object to be placed on the plane.
 * @param x X coordinate on the plane.
 * @param z Z coordinate on the plane.
 * @param objectRotationAxis If specified, the axis of the object which the
 * object will rotate about.
 * @param rotateRelativeTo If specified, the plane axis which the object will be
 * rotated by (i.e. the object will be parallel to this axis).
 * @returns y coordinate on the plane that corresponds to x and z.
 */
export default function setOnPlane(
  plane: THREE.Mesh,
  object: THREE.Object3D | undefined = undefined,
  x: number,
  z: number,
  objectRotationAxis: 'x' | 'y' | 'z' | '' = '',
  rotateRelativeTo: 'x' | 'y' | 'z' | '' = ''
): number {
  if (plane.geometry instanceof THREE.BufferGeometry) {
    throw new Error('Buffer planes are not currently supported.');
  }

  // Find the face that contains the x and z of position...
  const containingFace = faceInPlaneContainingPoint(plane, x, z);

  if (containingFace === undefined) {
    throw new Error('Position (x,z) is not found in plane.');
  }

  const faceVertex1 = plane.geometry.vertices[containingFace!.a];
  const faceVertex2 = plane.geometry.vertices[containingFace!.b];
  const faceVertex3 = plane.geometry.vertices[containingFace!.c];

  const planeOfContainingFace = new THREE.Plane();
  planeOfContainingFace.setFromCoplanarPoints(
    faceVertex1,
    faceVertex2,
    faceVertex3
  );

  // Handle object rotation...
  if (object && objectRotationAxis !== '' && rotateRelativeTo !== '') {
    const normal = new THREE.Vector2();
    const rotationAxis = new THREE.Vector3(0, 0, 0);

    if (objectRotationAxis === 'x') rotationAxis.x = 1;
    else if (objectRotationAxis === 'y') rotationAxis.y = 1;
    else rotationAxis.z = 1; // objectRotationAxis is 'z'.

    if (rotateRelativeTo === 'x') {
      normal.x = planeOfContainingFace.normal.x;
      normal.y = planeOfContainingFace.normal.y;
    } else if (rotateRelativeTo === 'y') {
      normal.x = planeOfContainingFace.normal.x;
      normal.y = planeOfContainingFace.normal.z;
    } else {
      // rotateRelativeTo is 'z'
      normal.x = -planeOfContainingFace.normal.z; // - to account for mirroring
      normal.y = planeOfContainingFace.normal.y;
    }

    object.rotateOnAxis(rotationAxis, normal.angle() - Math.PI / 2);
  }

  // Equation of a plane through a point (x1, y1, z1) whose normal is (a, b, c)
  // is:
  //    a * ( x - x1 ) + b * ( y - y1 ) + c * ( z - z1 ) = 0
  //
  // Solving for y....
  //
  //    y = (a * (x - x1) + c * (z - z1)) / -b + y1   [1]
  //
  // Reference: https://web.ma.utexas.edu/users/m408m/Display12-5-3.shtml

  // Setting up consistent variable names as in equation [1]...
  const a = planeOfContainingFace.normal.x;
  const b = planeOfContainingFace.normal.y;
  const c = planeOfContainingFace.normal.z;

  const x1 = faceVertex1.x;
  const y1 = faceVertex1.y;
  const z1 = faceVertex1.z;

  const y = (a * (x - x1) + c * (z - z1)) / -b + y1; // [1]

  object?.position.set(x, y, z);

  return y;
}
