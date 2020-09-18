import * as THREE from 'three';
import * as chai from 'chai';
import * as sinon from 'sinon';
const expect = chai.expect;

import generateObjectCluster from './GenerateObjectCluster';
import setOnPlane from './SetOnPlane';

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
  describe('For parent object having a child object instead of a child mesh...', () => {
    it('should return n meshes and m bounding box', () => {
      const numMeshesPerObject = 10;
      const object = generateObject(numMeshesPerObject);
      object.add(generateObject(numMeshesPerObject));

      const numPositions = 5;
      const positions = randomPositions(numPositions);

      const actualClusters = generateObjectCluster(object, positions);

      expect(actualClusters.length).to.equal(numMeshesPerObject * 2);
      expect(actualClusters[0].boundingBoxes.length).to.equal(numPositions);
    });
  });
  describe('For an invalid object child type...', () => {
    it('should error out', () => {
      const numMeshes = 10;
      const object = generateObject(numMeshes);
      object.children[0].type = 'Invalid Type';

      const numPositions = 5;
      const positions = randomPositions(numPositions);

      expect(
        generateObjectCluster.bind(generateObjectCluster, object, positions)
      ).to.throw('Unexpected type of Invalid Type.');
    });
  });
  describe('For the case where the parent is a mesh...', () => {
    describe('At one position...', () => {
      it('should 1 meshes and 1 bounding box', () => {
        const numMeshes = 1;
        const mesh = generateObject(numMeshes).children[0];

        const numPositions = 1;
        const positions = randomPositions(numPositions);

        const actualClusters = generateObjectCluster(mesh, positions);

        expect(actualClusters.length).to.equal(numMeshes);
        expect(actualClusters[0].boundingBoxes.length).to.equal(numPositions);
      });
    });
    describe('At m positions...', () => {
      it('should return 1 mesh and m bounding box', () => {
        const numMeshes = 1;
        const mesh = generateObject(numMeshes).children[0];

        const numPositions = 10;
        const positions = randomPositions(numPositions);

        const actualClusters = generateObjectCluster(mesh, positions);

        expect(actualClusters.length).to.equal(numMeshes);
        expect(actualClusters[0].boundingBoxes.length).to.equal(numPositions);
      });
    });
  });
  describe('For a rotation transform...', () => {
    it('should call setOnPlane', () => {
      const setOnPlaneSpy = sinon.spy(setOnPlane);

      const numMeshes = 1;
      const mesh = generateObject(numMeshes).children[0];

      const geometry = new THREE.PlaneGeometry(10, 10, 1, 2);
      const rotation = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
      geometry.applyMatrix4(rotation);

      const plane = new THREE.Mesh(geometry);

      const x = 1;
      const y = 2;
      const z = 3;
      const positions = [new THREE.Vector3(x, y, z)];

      const objectRotationAxis = 'x';
      const rotateRelativeTo = 'y';

      generateObjectCluster(mesh, positions, undefined, {
        plane: plane,
        objectRotationAxis: objectRotationAxis,
        rotateRelativeTo: rotateRelativeTo,
      });

      expect(
        generateObjectCluster.bind(
          generateObjectCluster,
          mesh,
          positions,
          undefined,
          {
            plane: plane,
            objectRotationAxis: objectRotationAxis,
            rotateRelativeTo: rotateRelativeTo,
          }
        )
      ).to.not.throw;
    });
  });
});

function generateObject(numMeshes: number) {
  const object = new THREE.Object3D();

  for (let i = 0; i < numMeshes; i++) {
    const geometry = new THREE.BufferGeometry().fromGeometry(
      new THREE.BoxGeometry(1, 1, 1)
    );
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
