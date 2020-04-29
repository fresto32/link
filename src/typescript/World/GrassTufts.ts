import * as THREE from 'three';
import setOnPlane from './Helpers/SetOnPlane';

/**
 * Generates a mesh of grass tufts positioned randomly over ground. Assumes that
 * this cluster has origin of (x = 0, z = 0).
 *
 * @param texture The grass tuft texture.
 * @param ground The plane of the ground (assumes THREE.BufferPlaneGeometry)
 * @param height The height of each grass tuft.
 * @param width The width of each grass tuft.
 * @param numberOfGrassTufts The number of grass tufts to be placed on ground.
 * @param xSpread The x distance the grass tufts can be placed from the origin.
 * @param zSpread The z distance the grass tufts can be placed from the origin.
 */
export default function grassTufts(
  texture: THREE.Texture,
  ground: THREE.Mesh,
  height: number,
  width: number,
  numberOfGrassTufts: number,
  xSpread: number,
  zSpread: number
): THREE.Mesh {
  // create the initial geometry
  const geometry = new THREE.PlaneGeometry(width, height);
  geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, height / 2, 0));

  // Tweak the normal for better lighting
  // - normals from http://http.developer.nvidia.com/GPUGems/gpugems_ch07.html
  // - normals inspired from http://simonschreibt.de/gat/airborn-trees/
  geometry.faces.forEach(face => {
    face.vertexNormals.forEach(normal => {
      normal.set(0, 1, 0).normalize();
    });
  });

  // Randomly position tufts over the map
  const positions: THREE.Vector3[] = [];
  for (let i = 0; i < numberOfGrassTufts; i++) {
    const x = Math.random() * xSpread * (Math.random() > 0.5 ? -1 : 1);
    const z = Math.random() * zSpread * (Math.random() > 0.5 ? -1 : 1);
    const y = setOnPlane(ground, null, x, z);
    positions.push(new THREE.Vector3(x, y, z));
  }

  const material = new THREE.MeshPhongMaterial({
    map: texture,
    color: 'grey',
    emissive: 'darkgreen',
    alphaTest: 0.7,
  });

  // create each tuft and merge their geometry for performance
  const mergedGeometry = new THREE.Geometry();
  for (let i = 0; i < positions.length; i++) {
    const position = positions[i];
    const baseAngle = Math.PI * 2 * Math.random();

    const nPlanes = 2;

    for (let j = 0; j < nPlanes; j++) {
      const angle = baseAngle + (j * Math.PI) / nPlanes;

      // First plane
      const grassPlane = new THREE.Mesh(geometry);
      grassPlane.rotateY(angle);
      grassPlane.position.copy(position);
      grassPlane.updateMatrix();
      mergedGeometry.merge(
        grassPlane.geometry as THREE.Geometry,
        grassPlane.matrix
      );

      // The other side of the plane
      // - impossible to use side : THREE.BothSide as
      //   it would mess up the normals
      const grassOtherPlane = new THREE.Mesh(geometry);
      grassOtherPlane.rotateY(angle + Math.PI);
      grassOtherPlane.position.copy(position);
      mergedGeometry.merge(
        grassOtherPlane.geometry as THREE.Geometry,
        grassOtherPlane.matrix
      );
    }
  }

  // create the mesh
  const mesh = new THREE.Mesh(mergedGeometry, material);
  return mesh;
}
