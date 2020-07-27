import * as THREE from 'three';
import * as chai from 'chai';
const expect = chai.expect;

import {flattenPlaneToBoxes} from '../src/typescript/World/Helpers/FlattenPlane';

describe('FlattenPlane Helper', () => {
  describe('Empty boxes array', () => {
    describe('Flat plane', () => {
      it('should return the same plane', () => {
        const plane = setUpPlane();

        if (plane.geometry instanceof THREE.BufferGeometry) {
          throw Error('Plane geometry is type BufferGeometry');
        }

        const expectedVertices = plane.geometry.vertices.map(vertex =>
          vertex.clone()
        );

        flattenPlaneToBoxes(plane, []);

        const actualVertices = plane.geometry.vertices;

        expect(actualVertices.length).to.equal(expectedVertices.length);

        for (let i = 0; i < actualVertices.length; i++) {
          expect(actualVertices[i].x).to.be.closeTo(expectedVertices[i].x, 0.1);
          expect(actualVertices[i].y).to.be.closeTo(expectedVertices[i].y, 0.1);
          expect(actualVertices[i].z).to.be.closeTo(expectedVertices[i].z, 0.1);
        }
      });
    });

    describe('Undulating plane', () => {
      it('should return same plane', () => {
        const plane = setUpPlane();
        randomizePlane(plane);

        if (plane.geometry instanceof THREE.BufferGeometry) {
          throw Error('Plane geometry is type BufferGeometry');
        }

        const expectedVertices = plane.geometry.vertices.map(vertex =>
          vertex.clone()
        );

        flattenPlaneToBoxes(plane, []);

        const actualVertices = plane.geometry.vertices;

        expect(actualVertices.length).to.equal(expectedVertices.length);

        for (let i = 0; i < actualVertices.length; i++) {
          expect(actualVertices[i].x).to.be.closeTo(expectedVertices[i].x, 0.1);
          expect(actualVertices[i].y).to.be.closeTo(expectedVertices[i].y, 0.1);
          expect(actualVertices[i].z).to.be.closeTo(expectedVertices[i].z, 0.1);
        }
      });
    });
  });

  describe('Non-empty boxes array', () => {
    describe('Flat plane', () => {
      it('should return the same plane', () => {
        const plane = setUpPlane();

        if (plane.geometry instanceof THREE.BufferGeometry) {
          throw Error('Plane geometry is type BufferGeometry');
        }

        const expectedVertices = plane.geometry.vertices.map(vertex =>
          vertex.clone()
        );

        const box = new THREE.Box3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(5, 5, 0)
        );

        flattenPlaneToBoxes(plane, [box]);

        const actualVertices = plane.geometry.vertices;

        expect(actualVertices.length).to.equal(expectedVertices.length);

        for (let i = 0; i < actualVertices.length; i++) {
          expect(actualVertices[i].x).to.be.closeTo(expectedVertices[i].x, 0.1);
          expect(actualVertices[i].y).to.be.closeTo(expectedVertices[i].y, 0.1);
          expect(actualVertices[i].z).to.be.closeTo(expectedVertices[i].z, 0.1);
        }
      });
    });
    describe('Undulating plane', () => {
      it('should return a plane flattened in the box region, but otherwise the same', () => {
        const plane = setUpPlane();
        randomizePlane(plane);

        if (plane.geometry instanceof THREE.BufferGeometry) {
          throw Error('Plane geometry is type BufferGeometry');
        }

        const expectedVertices = plane.geometry.vertices.map(vertex =>
          vertex.clone()
        );

        const minX = 0;
        const minY = 0;
        const minZ = 0;
        const maxX = 5;
        const maxY = 2;
        const maxZ = 5;

        const box = new THREE.Box3(
          new THREE.Vector3(minX, minY, minZ),
          new THREE.Vector3(maxX, maxY, maxZ)
        );

        flattenPlaneToBoxes(plane, [box]);

        const actualVertices = plane.geometry.vertices;

        expect(actualVertices.length).to.equal(expectedVertices.length);

        for (let i = 0; i < actualVertices.length; i++) {
          const actualX = actualVertices[i].x;
          const actualY = actualVertices[i].y;
          const actualZ = actualVertices[i].z;

          // Reason: keep min and max columns aligned
          // prettier-ignore
          if (
            actualX >= minX && actualX <= maxX &&
            actualZ >= minZ && actualZ <= maxZ
          ) {
            expect(actualY).to.be.closeTo(0, 0.0001);
          }

          expect(actualVertices[i].x).to.be.closeTo(expectedVertices[i].x, 0.1);
          expect(actualVertices[i].z).to.be.closeTo(expectedVertices[i].z, 0.1);
        }
      });
    });
  });
});

function setUpPlane(width = 10, depth = 10) {
  const geometry = new THREE.PlaneGeometry(width, depth, 1, 2);
  const rotation = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
  geometry.applyMatrix4(rotation);

  return new THREE.Mesh(geometry);
}

function randomizePlane(plane: THREE.Mesh) {
  if (plane.geometry instanceof THREE.BufferGeometry) {
    throw Error('Plane geometry is type BufferGeometry');
  }

  plane.geometry.vertices.forEach(vertex => {
    vertex.y += Math.random() * 100;
  });
}
