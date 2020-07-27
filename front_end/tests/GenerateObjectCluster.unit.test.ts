//TODO: Allow testing of THREE js modules...
/*
import * as THREE from 'three';
import * as chai from 'chai';
const expect = chai.expect;

import generateObjectCluster from '../src/typescript/World/Helpers/GenerateObjectCluster';

describe('GenerateObjectCluster Helper', () => {
  describe('For a single mesh...', () => {
    describe('At one position...', () => {
      it('should return a single mesh and bounding box', () => {
        const numMeshes = 1;
        const object = generateObject(numMeshes);

        const numPositions = 1;
        const positions = randomPositions(numPositions);

        const actualClusters = generateObjectCluster(object, positions);

        expect(actualClusters.length).to.equal(numMeshes);
        expect(actualClusters[0].boundingBoxes.length).to.equal(numPositions);
      });
    });
    describe('At many positions...', () => {
      it('should return a single mesh and bounding box', () => {
        const numMeshes = 1;
        const object = generateObject(numMeshes);

        const numPositions = 5;
        const positions = randomPositions(numPositions);

        const actualClusters = generateObjectCluster(object, positions);

        expect(actualClusters.length).to.equal(numMeshes);
        expect(actualClusters[0].boundingBoxes.length).to.equal(numPositions);
      });
    });
  });
  describe('For n meshes...', () => {
    describe('At one position...', () => {
      it('should return n meshes and 1 bounding box', () => {
        const numMeshes = 5;
        const object = generateObject(numMeshes);

        const numPositions = 1;
        const positions = randomPositions(numPositions);

        const actualClusters = generateObjectCluster(object, positions);

        expect(actualClusters.length).to.equal(numMeshes);
        expect(actualClusters[0].boundingBoxes.length).to.equal(numPositions);
      });
    });
    describe('At m positions...', () => {
      it('should return n meshes and m bounding box', () => {
        const numMeshes = 5;
        const object = generateObject(numMeshes);

        const numPositions = 5;
        const positions = randomPositions(numPositions);

        const actualClusters = generateObjectCluster(object, positions);

        expect(actualClusters.length).to.equal(numMeshes);
        expect(actualClusters[0].boundingBoxes.length).to.equal(numPositions);
      });
    });
  });
});

function generateObject(numMeshes: number) {
  const object = new THREE.Object3D();

  for (let i = 0; i < numMeshes; i++) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({color: 'blue'});
    const mesh = new THREE.Mesh(geometry, material);
    object.add(mesh);
  }

  return object;
}

function randomPositions(numPositions: number) {
  const positions: THREE.Vector3[] = [];

  const random = () => Math.random() * 10;

  for (let i = 0; i < numPositions; i++) {
    positions.push(new THREE.Vector3(random(), random(), random()));
  }

  return positions;
}

*/
