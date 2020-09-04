import * as THREE from 'three';

/**
 * Finds the THREE.Face in plane that contains x and z. If none found, null is
 * returned.
 *
 * @param plane The plane to find the face containing the x and z coordinates.
 * @param x The x coordinate.
 * @param z The z coordinate.
 */
export default function faceInPlaneContainingPoint(
  plane: THREE.Mesh,
  x: number,
  z: number
): THREE.Face3 | undefined {
  if (plane.geometry instanceof THREE.BufferGeometry) return undefined;

  // Find the face that contains the x and z of position...
  let containingFace: THREE.Face3 | undefined;
  plane.geometry.faces.some(face => {
    /* istanbul ignore next */ // this is already tested above.
    if (plane.geometry instanceof THREE.BufferGeometry) return undefined;
    const vertexA = plane.geometry.vertices[face.a];
    const vertexB = plane.geometry.vertices[face.b];
    const vertexC = plane.geometry.vertices[face.c];

    if (positionContainedInVertices(x, z, vertexA, vertexB, vertexC)) {
      containingFace = face;
      return true;
    }
    return false;
  });

  return containingFace;
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
