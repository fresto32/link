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
export default function randomPoint(
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
  pt: THREE.Vector3,
  exclusionAreas: THREE.Box3[] | undefined
) {
  if (exclusionAreas === undefined) return false;

  //* The precision of setOnPlane(...) may lead a pt to have a y that is just
  //* outside some exclusion box (yet the x and z lie in the box). So adjust
  //* this y value to push those points just outside the exclusion box's y value
  //* into it.
  const adjustedPt = pt.clone();
  adjustedPt.y += 0.5;

  return exclusionAreas.some(area => area.containsPoint(adjustedPt));
}
