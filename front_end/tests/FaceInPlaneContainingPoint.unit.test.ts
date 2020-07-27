import * as THREE from 'three';
import * as chai from 'chai';
const expect = chai.expect;

import faceInPlaneContainingPoint from '../src/typescript/World/Helpers/FaceInPlaneContainingPoint';

describe('Face Containing Point Helper', () => {
  describe('Single Face', () => {
    it('should return expected face if position in plane', () => {
      const plane = setUpPlane();

      if (plane.geometry instanceof THREE.BufferGeometry) {
        throw Error('Plane geometry is type BufferGeometry');
      }

      const expectedFace = plane.geometry.faces[0];

      // Find all 3 vertices of the face...
      const vertexA = plane.geometry.vertices[expectedFace.a];
      const vertexB = plane.geometry.vertices[expectedFace.b];
      const vertexC = plane.geometry.vertices[expectedFace.c];

      let peakVertex: THREE.Vector3 | undefined = undefined;
      let baseVertices: [THREE.Vector3, THREE.Vector3] | undefined = undefined;
      if (vertexA.z === vertexB.z) {
        peakVertex = vertexC;
        baseVertices = [vertexA, vertexB];
      } else if (vertexA.z === vertexC.z) {
        peakVertex = vertexB;
        baseVertices = [vertexA, vertexC];
      } else {
        // Vertices B and C must compose the triangle's base
        peakVertex = vertexA;
        baseVertices = [vertexB, vertexC];
      }

      const x = (baseVertices[0].x + baseVertices[1].x) / 2;
      const z = baseVertices[0].z + 0.01 * peakVertex.z;

      const actualFace = faceInPlaneContainingPoint(plane, x, z);

      expect(actualFace).to.equal(expectedFace);
    });

    it('should return null if position outside plane', () => {
      const planeWidth = 10;
      const planeDepth = 10;
      const plane = setUpPlane(planeWidth, planeDepth);

      if (plane.geometry instanceof THREE.BufferGeometry) {
        throw Error('Plane geometry is type BufferGeometry');
      }

      // The maximum x in plane is planeWidth / 2, so x = planeWidth should be
      // outside the plane...
      const x = planeWidth;

      // Similarly, for z...
      const z = planeDepth;

      const actualFace = faceInPlaneContainingPoint(plane, x, z);

      expect(actualFace).to.be.null;
    });
  });

  describe('Every face in plane', () => {
    it('should return each expected face', () => {
      const plane = setUpPlane();

      if (plane.geometry instanceof THREE.BufferGeometry) {
        throw Error('Plane geometry is type BufferGeometry');
      }

      for (let i = 0; i < plane.geometry.faces.length; i++) {
        const expectedFace = plane.geometry.faces[i];

        // Find all 3 vertices of the face...
        const vertexA = plane.geometry.vertices[expectedFace.a];
        const vertexB = plane.geometry.vertices[expectedFace.b];
        const vertexC = plane.geometry.vertices[expectedFace.c];

        let peakVertex: THREE.Vector3 | undefined = undefined;
        let baseVertices:
          | [THREE.Vector3, THREE.Vector3]
          | undefined = undefined;
        if (vertexA.z === vertexB.z) {
          peakVertex = vertexC;
          baseVertices = [vertexA, vertexB];
        } else if (vertexA.z === vertexC.z) {
          peakVertex = vertexB;
          baseVertices = [vertexA, vertexC];
        } else {
          // Vertices B and C must have same z
          peakVertex = vertexA;
          baseVertices = [vertexB, vertexC];
        }

        const x = (baseVertices[0].x + baseVertices[1].x) / 2;
        const z = baseVertices[0].z + 0.01 * peakVertex.z;

        const actualFace = faceInPlaneContainingPoint(plane, x, z);

        expect(actualFace).to.equal(expectedFace);
      }
    });
  });
});

function setUpPlane(width = 10, depth = 10) {
  const geometry = new THREE.PlaneGeometry(width, depth, 1, 2);
  const rotation = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
  geometry.applyMatrix4(rotation);

  return new THREE.Mesh(geometry);
}
