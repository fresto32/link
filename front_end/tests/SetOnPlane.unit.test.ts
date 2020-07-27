import * as THREE from 'three';
import * as chai from 'chai';
const expect = chai.expect;

import setOnPlane from '../src/typescript/World/Helpers/SetOnPlane';

describe('setOnPlane Helper', () => {
  describe('Testing planes with normal: y + c = 0', () => {
    it('should return origin when a plane lying on the y axis is passed', () => {
      const plane = setUpPlane();
      const object = new THREE.Object3D();

      const y = setOnPlane(plane, object, 0, 0);

      expect(y).to.equal(0);
      expect(object.position.x).to.equal(0);
      expect(object.position.y).to.equal(0);
      expect(object.position.z).to.equal(0);
    });

    it('should return origin + (0, c, 0) when a plane of normal: y + c = 0 is passed', () => {
      const plane = setUpPlane();
      const object = new THREE.Object3D();

      if (plane.geometry instanceof THREE.BufferGeometry) return;
      plane.geometry.vertices.forEach(v => {
        v.y = 5;
      });

      setOnPlane(plane, object, 0, 0);

      expect(object.position.x).to.equal(0);
      expect(object.position.y).to.equal(5);
      expect(object.position.z).to.equal(0);
    });
  });

  describe('Testing planes with normal: Ax + By + Cz + c = 0', () => {
    it('should not return NaN', () => {
      const plane = setUpPlane();
      const object = new THREE.Object3D();

      if (plane.geometry instanceof THREE.BufferGeometry) return;
      plane.geometry.vertices.forEach(v => {
        v.y = Math.random() * 30;
      });

      setOnPlane(plane, object, 0, 0);

      expect(object.position).to.not.be.NaN;
      expect(object.position.x).to.not.be.NaN;
      expect(object.position.y).to.not.be.NaN;
      expect(object.position.z).to.not.be.NaN;
    });

    it(
      'should return the average of min and max y for a flat slope when' +
        ' given the origin',
      () => {
        const plane = setUpPlane();
        const object = new THREE.Object3D();

        if (plane.geometry instanceof THREE.BufferGeometry) return;
        plane.geometry.vertices.forEach(v => {
          if (v.x < 0) v.y = 0;
          else v.y = 10;
        });

        setOnPlane(plane, object, 0, 0);

        expect(object.position.x).to.not.be.NaN;
        expect(object.position.y).to.be.closeTo(5, 0.0000001);
        expect(object.position.z).to.not.be.NaN;
      }
    );

    it(
      'should return the 0.5 * max y for a flat slope starting at y = 0 when' +
        ' given the origin',
      () => {
        const plane = setUpPlane();
        const object = new THREE.Object3D();

        const maxY = 10;

        if (plane.geometry instanceof THREE.BufferGeometry) return;
        plane.geometry.vertices.forEach(v => {
          if (v.x < 0) v.y = 0;
          else v.y = maxY;
        });

        setOnPlane(plane, object, 0, 0);

        expect(object.position.x).to.not.be.NaN;
        expect(object.position.y).to.be.closeTo(maxY / 2, 0.0000001);
        expect(object.position.z).to.not.be.NaN;
      }
    );

    it(
      'should return the 0.75 * max y for a flat slope starting at y = 0 when' +
        ' given the a non-origin point',
      () => {
        const plane = setUpPlane();
        const object = new THREE.Object3D();

        const maxY = 10;

        if (plane.geometry instanceof THREE.BufferGeometry) return;
        plane.geometry.vertices.forEach(v => {
          if (v.x < 0) v.y = 0;
          else v.y = 10;
        });

        setOnPlane(plane, object, 2.5, 2.5);

        expect(object.position.x).to.be.closeTo(2.5, 0.0000001);
        expect(object.position.y).to.be.closeTo(maxY * 0.75, 0.0000001);
        expect(object.position.z).to.be.closeTo(2.5, 0.0000001);
      }
    );
  });
});

function setUpPlane() {
  const geometry = new THREE.PlaneGeometry(10, 10, 1, 2);
  const rotation = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
  geometry.applyMatrix4(rotation);

  return new THREE.Mesh(geometry);
}
