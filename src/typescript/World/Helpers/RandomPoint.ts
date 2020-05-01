import * as THREE from 'three';
import setOnPlane from './SetOnPlane';

/**
 * Finds a random point given the constraint of not being in exclusionAreas.
 *
 * @param ground Ground
 * @param xCenter The center x coordinate of the cluster.
 * @param zCenter The center z coordinate of the cluster.
 * @param xSpread The distance the cluster spreads out from the origin in x.
 * @param zSpread The distance the cluster spreads out from the origin in z.
 * @param exclusionAreas The areas where the returned point cannot be in.
 */
export default function (
  ground: THREE.Mesh,
  xCenter: number,
  zCenter: number,
  xSpread: number,
  zSpread: number,
  exclusionAreas: THREE.Box3[] | undefined = undefined
) {
  // TODO: Improve the logic to remove the while loop (i.e. do this analytically)
  const pt = new THREE.Vector3();

  do {
    pt.x = xCenter + Math.random() * xSpread * (Math.random() > 0.5 ? -1 : 1);
    pt.z = zCenter + Math.random() * zSpread * (Math.random() > 0.5 ? -1 : 1);
    pt.y = setOnPlane(ground, null, pt.x, pt.z);
  } while (isInExclusionArea(pt, exclusionAreas));

  return pt;
}

function isInExclusionArea(
  point: THREE.Vector3,
  exclusionAreas: THREE.Box3[] | undefined
) {
  if (exclusionAreas === undefined) return false;
  return exclusionAreas.some(area => area.containsPoint(point));
}
