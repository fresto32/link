import * as THREE from 'three';
import * as chai from 'chai';
const expect = chai.expect;

import boundingBox from './BoundingBox';

describe('Bounding Box Helper', () => {
  it('should return the same as Box3.setFromObject(...)', () => {
    const width = 10;
    const height = 10;
    const depth = 10;

    const geometry = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geometry);

    const expectedBox = new THREE.Box3().setFromObject(mesh);

    const actualBox = boundingBox(mesh);

    expect(actualBox.equals(expectedBox)).to.be.true;
  });
});
