import * as THREE from 'three';
import * as chai from 'chai';
const expect = chai.expect;

import objectDimensions from '../src/typescript/World/Helpers/ObjectDimensions';

describe('Object Dimensions Helper', () => {
  describe('Object at origin', () => {
    it('should return the box size', () => {
      const width = 10;
      const height = 10;
      const depth = 10;

      const expectedWidth = width;
      const expectedHeight = height;
      const expectedDepth = depth;

      const geometry = new THREE.BoxGeometry(width, height, depth);
      const mesh = new THREE.Mesh(geometry);

      const dimensions = objectDimensions(mesh);

      expect(dimensions.x).to.equal(expectedWidth);
      expect(dimensions.y).to.equal(expectedHeight);
      expect(dimensions.z).to.equal(expectedDepth);
    });
  });

  describe('Object not at origin', () => {
    it('should return the box size', () => {
      const width = 10;
      const height = 10;
      const depth = 10;

      const expectedWidth = width;
      const expectedHeight = height;
      const expectedDepth = depth;

      const geometry = new THREE.BoxGeometry(width, height, depth);
      const mesh = new THREE.Mesh(geometry);

      mesh.position.x = 10;
      mesh.position.y = 10;
      mesh.position.z = 10;

      const dimensions = objectDimensions(mesh);

      expect(dimensions.x).to.equal(expectedWidth);
      expect(dimensions.y).to.equal(expectedHeight);
      expect(dimensions.z).to.equal(expectedDepth);
    });
  });
});
