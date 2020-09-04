import * as THREE from 'three';
import * as chai from 'chai';
const expect = chai.expect;

import setOnPlane from './SetOnPlane';
import {BufferGeometry} from 'three';

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
      for (const vertex of plane.geometry.vertices) vertex.y = 5;

      setOnPlane(plane, object, 0, 0);

      expect(object.position.x).to.equal(0);
      expect(object.position.y).to.equal(5);
      expect(object.position.z).to.equal(0);
    });

    it('should return origin + (0, c, 0) when a plane of normal: y + c = 0 is passed with undefined object', () => {
      const plane = setUpPlane();

      if (plane.geometry instanceof THREE.BufferGeometry) return;
      for (const vertex of plane.geometry.vertices) vertex.y = 5;

      const y = setOnPlane(plane, undefined, 0, 0);

      expect(y).to.equal(5);
    });

    describe('object rotation', () => {
      it('should return the same object position if the plane is flat', () => {
        const plane = setUpPlane();
        const object = new THREE.Object3D();

        if (plane.geometry instanceof THREE.BufferGeometry) return;
        for (const vertex of plane.geometry.vertices) vertex.y = 5;

        const objectRotationAxes: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];
        const rotateRelativeToAxes: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];

        for (const rotationAxis of objectRotationAxes) {
          for (const rotateRelativeToAxis of rotateRelativeToAxes) {
            setOnPlane(plane, object, 0, 0, rotationAxis, rotateRelativeToAxis);
            expect(object.position.x).to.equal(0);
            expect(object.position.y).to.equal(5);
            expect(object.position.z).to.equal(0);
          }
        }
      });
    });
  });

  describe('Plane has BufferGeometry', () => {
    it('should throw error', () => {
      const plane = setUpPlane();
      const object = new THREE.Object3D();

      if (plane.geometry instanceof THREE.BufferGeometry) return;
      for (const vertex of plane.geometry.vertices) vertex.y = 5;

      plane.geometry = new BufferGeometry().fromGeometry(plane.geometry);

      expect(setOnPlane.bind(setOnPlane, plane, object, 0, 0)).to.throw(
        'Buffer planes are not currently supported.'
      );
    });
  });

  describe('x and z are not in plane', () => {
    it('should throw error', () => {
      const plane = setUpPlane();
      const object = new THREE.Object3D();

      if (plane.geometry instanceof THREE.BufferGeometry) return;
      for (const vertex of plane.geometry.vertices) vertex.y = 5;

      expect(setOnPlane.bind(setOnPlane, plane, object, 10000, 10000)).to.throw(
        'Position (x,z) is not found in plane.'
      );
    });
  });

  describe('Testing planes with normal: Ax + By + Cz + c = 0', () => {
    it('should not return NaN', () => {
      const plane = setUpPlane();
      const object = new THREE.Object3D();

      if (plane.geometry instanceof THREE.BufferGeometry) return;
      for (const vertex of plane.geometry.vertices) {
        vertex.y = Math.random() * 30;
      }

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
        for (const vertex of plane.geometry.vertices) {
          if (vertex.x < 0) vertex.y = 0;
          else vertex.y = 10;
        }

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
        for (const vertex of plane.geometry.vertices) {
          if (vertex.x < 0) vertex.y = 0;
          else vertex.y = maxY;
        }

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
        for (const vertex of plane.geometry.vertices) {
          if (vertex.x < 0) vertex.y = 0;
          else vertex.y = 10;
        }

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
