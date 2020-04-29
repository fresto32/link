import * as THREE from 'three';

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
 * rotated by.
 * @returns y coordinate on the plane that corresponds to x and z.
 */
export default function setOnPlane(
  plane: THREE.Mesh,
  object: THREE.Object3D | null = null,
  x: number,
  z: number,
  objectRotationAxis: 'x' | 'y' | 'z' | '' = '',
  rotateRelativeTo: 'x' | 'y' | 'z' | '' = ''
): number {
  if (plane.geometry instanceof THREE.BufferGeometry) {
    throw console.error('Buffer planes are not currently supported.');
  }

  const worldAlignedGeometry = plane.geometry.clone();

  /**
   * TODO:
   *
   * Individualized piece of code: Since the plane that we will be selecting is
   * always the SpawnIsland's ground, we align the vertices of the plane as we
   * align the SpawnIsland's ground.
   *
   * In the future, this specificity ought to be removed to allow for greater
   * extensibility.
   */
  const rotationAxis = new THREE.Vector3(1, 0, 0);
  worldAlignedGeometry.vertices.map(vertex => {
    // Rotation of vertex...
    vertex.applyAxisAngle(rotationAxis, Math.PI / 2);
    // Mirroring of vertex (due to mesh rotation)...
    vertex.z = -vertex.z;
  });

  // Find the face that contains the x and z of position...
  let containingFace: THREE.Face3 | null = null;
  const isInPlane = worldAlignedGeometry.faces.some(face => {
    const vertexA = worldAlignedGeometry.vertices[face.a];
    const vertexB = worldAlignedGeometry.vertices[face.b];
    const vertexC = worldAlignedGeometry.vertices[face.c];

    if (positionContainedInVertices(x, z, vertexA, vertexB, vertexC)) {
      containingFace = face.clone();
      return true;
    }
    return false;
  });

  if (!isInPlane) {
    throw console.error('Position (x,z) is not found in plane.');
  }

  const faceVertex1 = worldAlignedGeometry.vertices[containingFace!.a];
  const faceVertex2 = worldAlignedGeometry.vertices[containingFace!.b];
  const faceVertex3 = worldAlignedGeometry.vertices[containingFace!.c];

  const planeOfContainingFace = new THREE.Plane();
  planeOfContainingFace.setFromCoplanarPoints(
    faceVertex1,
    faceVertex2,
    faceVertex3
  );

  // Handle object rotation...
  if (object !== null && objectRotationAxis !== '' && rotateRelativeTo !== '') {
    const normal = new THREE.Vector2();
    const rotationAxis = new THREE.Vector3(0, 0, 0);

    if (objectRotationAxis === 'x') rotationAxis.x = 1;
    else if (objectRotationAxis === 'y') rotationAxis.y = 1;
    else if (objectRotationAxis === 'z') rotationAxis.z = 1;

    if (rotateRelativeTo === 'x') {
      normal.x = planeOfContainingFace.normal.x;
      normal.y = planeOfContainingFace.normal.y;
    } else if (rotateRelativeTo === 'y') {
      normal.x = planeOfContainingFace.normal.x;
      normal.y = planeOfContainingFace.normal.z;
    } else if (rotateRelativeTo === 'z') {
      normal.x = -planeOfContainingFace.normal.z; // - to account for mirroring
      normal.y = planeOfContainingFace.normal.y;
    }

    object.rotateOnAxis(rotationAxis, Math.PI / 2 - normal.angle());
  }

  // Equation of a plane through a point (x1, y1, z1) whose normal is (a, b, c)
  // is:
  //    a * ( x - x1 ) + b * ( y - y1 ) + c * ( z - z1 ) = 0
  //
  // Solving for y....
  //
  //    y = (a * (x - x1) + c * (z - z1)) / b - y1 [1]
  //
  // Reference: https://web.ma.utexas.edu/users/m408m/Display12-5-3.shtml

  // Setting up consistent variable names as in equation [1]...
  const a = planeOfContainingFace.normal.x;
  const b = planeOfContainingFace.normal.y;
  const c = planeOfContainingFace.normal.z;

  const x1 = faceVertex1.x;
  const y1 = faceVertex1.y;
  const z1 = faceVertex1.z;

  const y = (a * (x - x1) + c * (z - z1)) / b - y1; // [1]

  if (object !== null) object.position.set(x, y, z);

  return y;
}

// Since we know that the vertices lie in a plane, we can simplify the problem
// to a 2D triangle problem. If the position lies in the triangle made by
// vertices A, B, C (of mapping (x,z) not (x,y,z)), we can say that position is
// contained in this face.
//
// The problem is solved by solving the system of equations made by the
// Barycentric Coordinates.
//
// Reference: https://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle
function positionContainedInVertices(
  x: number,
  z: number,
  vertexA: THREE.Vector3,
  vertexB: THREE.Vector3,
  vertexC: THREE.Vector3
): boolean {
  const y = z;

  const x0 = vertexA.x;
  const y0 = vertexA.z;

  const x1 = vertexB.x;
  const y1 = vertexB.z;

  const x2 = vertexC.x;
  const y2 = vertexC.z;

  const Area = 0.5 * (-y1 * x2 + y0 * (-x1 + x2) + x0 * (y1 - y2) + x1 * y2);
  const s =
    (1 / (2 * Area)) * (y0 * x2 - x0 * y2 + (y2 - y0) * x + (x0 - x2) * y);
  const t =
    (1 / (2 * Area)) * (x0 * y1 - y0 * x1 + (y0 - y1) * x + (x1 - x0) * y);

  return s >= 0 && s <= 1 && t >= 0 && s <= 1 && s + t <= 1;
}
