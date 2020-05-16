import * as THREE from 'three';
import * as chai from 'chai';
const expect = chai.expect;

import randomPoint from '../src/typescript/World/Helpers/RandomPoint';

describe('randomPoint Helper', () => {
  describe('without exclusion areas', () => {
    it('should return a valid point', () => {
      const plane = setUpPlane();

      const point = randomPoint(plane, 0, 0, 10, 10);

      expect(point).to.not.be.null;
    });

    it('should return a point within spread values', () => {
      const plane = setUpPlane();

      const xSpread = 2;
      const zSpread = 2;

      for (let i = 0; i < 100; i++) {
        const point = randomPoint(plane, 0, 0, xSpread, zSpread);

        expect(Math.abs(point.x)).to.be.lessThan(xSpread);
        expect(Math.abs(point.z)).to.be.lessThan(zSpread);

        expect(point.y).to.be.closeTo(0, 0.00000001);
      }
    });
  });

  describe('with exclusions areas', () => {
    it('should return a valid point', () => {
      const plane = setUpPlane();

      const exclusionArea = [
        new THREE.Box3(
          new THREE.Vector3(-1, 0, -1),
          new THREE.Vector3(1, 0, 1)
        ),
      ];

      const point = randomPoint(plane, 0, 0, 10, 10, exclusionArea);

      expect(point).to.not.be.null;
    });

    it('should return a point within spread values but not in a exclusion zone', () => {
      const plane = setUpPlane();

      const exclusionArea = [
        new THREE.Box3(
          new THREE.Vector3(-1, -100, -1),
          new THREE.Vector3(1, 100, 1)
        ),
      ];

      const xSpread = 2;
      const zSpread = 2;

      for (let i = 0; i < 100; i++) {
        const point = randomPoint(plane, 0, 0, xSpread, zSpread, exclusionArea);

        expect(Math.abs(point.x)).to.be.lessThan(xSpread, 'x > xSpread');
        expect(Math.abs(point.z)).to.be.lessThan(zSpread, 'z > zSpread');

        expect(point.y).to.be.closeTo(0, 0.00000001);

        expect(exclusionArea[0].containsPoint(point)).to.be.false;
      }
    });

    it('should return a point within spread values but not in two exclusion zones', () => {
      const plane = setUpPlane();

      const exclusionArea = [
        new THREE.Box3(
          new THREE.Vector3(-1, -100, -1),
          new THREE.Vector3(1, 100, 1)
        ),
        new THREE.Box3(
          new THREE.Vector3(-2, -100, -2),
          new THREE.Vector3(1, 100, 1)
        ),
      ];

      const xSpread = 2;
      const zSpread = 2;

      for (let i = 0; i < 100; i++) {
        const point = randomPoint(plane, 0, 0, xSpread, zSpread, exclusionArea);

        expect(Math.abs(point.x)).to.be.lessThan(xSpread, 'x > xSpread');
        expect(Math.abs(point.z)).to.be.lessThan(zSpread, 'z > zSpread');

        expect(point.y).to.be.closeTo(0, 0.00000001);

        expect(exclusionArea[0].containsPoint(point)).to.be.false;
        expect(exclusionArea[1].containsPoint(point)).to.be.false;
      }
    });

    it('should return a point within spread values but not in zero exclusion zones', () => {
      const plane = setUpPlane();

      const exclusionArea: THREE.Box3[] = [];

      const xSpread = 2;
      const zSpread = 2;

      for (let i = 0; i < 100; i++) {
        const point = randomPoint(plane, 0, 0, xSpread, zSpread, exclusionArea);

        expect(Math.abs(point.x)).to.be.lessThan(xSpread, 'x > xSpread');
        expect(Math.abs(point.z)).to.be.lessThan(zSpread, 'z > zSpread');

        expect(point.y).to.be.closeTo(0, 0.00000001);
      }
    });
  });
});

function setUpPlane() {
  const geometry = new THREE.PlaneGeometry(20, 20, 1, 2);
  const rotation = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
  geometry.applyMatrix4(rotation);

  return new THREE.Mesh(geometry);
}
