import * as THREE from 'three';
import Resources from '../Resources';
import ObjectDimensions from './Helpers/ObjectDimensions';
import setOnPlane from './Helpers/SetOnPlane';
import generateObjectCluster from './Helpers/GenerateObjectCluster';
import grassTufts from './GrassTufts';

export default class SpawnIsland {
  /** Container */
  container: THREE.Object3D;
  /** Background Mesh */
  ground!: THREE.Mesh;
  /** Border Mesh */
  border!: THREE.Mesh;
  /** Resources */
  resources: Resources;
  /** Debug */
  debug: dat.GUI;

  constructor(_params: {resources: Resources; debug: dat.GUI}) {
    // Container
    this.container = new THREE.Object3D();
    this.container.matrixAutoUpdate = true;

    // Params
    this.resources = _params.resources;
    this.debug = _params.debug;

    // Setting up scenegraph
    this.setGround();
    this.setBorder();
    this.setPirateBoat();
    this.setPalmTrees();
    this.setShipWreck();
    this.setTower();
    this.setRockFormations();
    this.setGrassTufts();
  }

  /**
   * Set Ground
   *
   * The ground for the spawn island is a single sided plane.
   */
  setGround() {
    const texture = this.resources.textures.grass;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.x = 10;
    texture.repeat.y = 10;

    const backgroundMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      emissive: 'green',
    });

    const geometry = new THREE.PlaneGeometry(320, 220, 5, 5);
    this.ground = new THREE.Mesh(geometry, backgroundMaterial);
    this.ground.rotateX(-Math.PI / 2);
    this.ground.position.y = 0;
    geometry.vertices.forEach(v => {
      v.z = Math.random() * 30;
    });
    this.container.add(this.ground);
  }

  /**
   * Set Border
   *
   * The border is a single sided plane that is slightly larger than the
   * background plane.
   */
  setBorder() {
    const fenceVertical = this.resources.items.fence.scene.children[0].clone();
    this.setScale(fenceVertical);
    const fenceHorizontal = fenceVertical.clone().rotateY(Math.PI / 2);

    const dimensions = ObjectDimensions(fenceHorizontal);

    // Build fences for each side of the map...
    // +z side
    for (let i = -145; i < 150; i += dimensions.z) {
      const fence = fenceVertical.clone();
      setOnPlane(this.ground, fence, i, 100, 'z', 'x');
      this.container.add(fence);
    }
    // -z side
    for (let i = -145; i < 150; i += dimensions.z) {
      const fence = fenceVertical.clone();
      setOnPlane(this.ground, fence, i, -100, 'z', 'x');
      this.container.add(fence);
    }
    // +x side
    for (let i = -100; i < 100; i += dimensions.z) {
      const fence = fenceHorizontal.clone();
      setOnPlane(this.ground, fence, 150, i, 'z', 'z');
      this.container.add(fence);
    }
    // -x side
    for (let i = -100; i < 100; i += dimensions.z) {
      const fence = fenceHorizontal.clone();
      setOnPlane(this.ground, fence, -150, i, 'z', 'z');
      this.container.add(fence);
    }
  }

  /**
   * Set Pirate Boat
   *
   * Sets a pirate boat in the upper right quadrant.
   */
  setPirateBoat() {
    const shipDark = this.resources.items.shipDark.scene.children[0];
    this.setScale(shipDark);
    setOnPlane(this.ground, shipDark, 75, 50);
    this.container.add(shipDark);
  }

  /**
   * Set Palm Trees
   *
   * Sets some palm trees in the bottom right quadrant
   */
  setPalmTrees() {
    const items = this.resources.items;
    const palmModels: THREE.Object3D[] = [
      items.palmShort.scene.children[0],
      items.palmLong.scene.children[0],
    ];
    this.setModelCluster(palmModels, 80, 4, 75, -50, 60, 40);
  }

  /**
   * Set Ship Wreck
   *
   * Sets a ship wreck in the bottom left hand quadrant.
   */
  setShipWreck() {
    const shipWreck = this.resources.items.shipWreck.scene.children[0];
    this.setScale(shipWreck);
    shipWreck.rotateY(Math.PI / 1.5);
    setOnPlane(this.ground, shipWreck, -75, -50);
    this.container.add(shipWreck);
  }

  /**
   * Set Tower
   *
   * Sets a tower in the upper left quadrant.
   */
  setTower() {
    const tower = this.resources.items.tower.scene.children[0];
    this.setScale(tower);
    setOnPlane(this.ground, tower, -75, 50);
    this.container.add(tower);
  }

  /**
   * Set Rock Formations
   *
   * Sets rock formations around the map to add more scenery
   */
  setRockFormations() {
    const items = this.resources.items;
    const rocks: THREE.Object3D[] = [
      items.formationLargeRock.scene.children[0],
      items.formationRock.scene.children[0],
    ];
    const stones: THREE.Object3D[] = [
      items.formationLargeStone.scene.children[0],
      items.formationStone.scene.children[0],
    ];
    this.setModelCluster(rocks, 30, 2, 0, 0, 150, 100);
    this.setModelCluster(stones, 30, 1.5, 0, 0, 150, 100);
  }

  /**
   * Set Grass Tufts
   *
   * Adapted from threex.grass. Creates tufts of grass randomly on the map.
   */
  setGrassTufts() {
    this.container.add(
      grassTufts(
        this.resources.textures.grassTuft,
        this.ground,
        1,
        2,
        10000,
        150,
        100
      )
    );
  }

  // Helpers

  /**
   * Sets a cluster of models in this container. Each model in models is placed
   * in the scene a given numObjectsPerModel number of times at a setScale and
   * x and z spread from x and z centers.
   * @param models The models that are to be clustered.
   * @param numObjectsPerModel The number of objects to be placed per model.
   * @param setScale Set the scale of all models.
   * @param xCenter The center x coordinate of the cluster.
   * @param zCenter The center z coordinate of the cluster.
   * @param xSpread The distance the cluster spreads out from the origin in x.
   * @param zSpread The distance the cluster spreads out from the origin in z.
   */
  setModelCluster(
    models: THREE.Object3D[],
    numObjectsPerModel: number,
    setScale = 1,
    xCenter = 0,
    zCenter = 0,
    xSpread = 1,
    zSpread = 1
  ) {
    this.setScales(models, setScale);

    models.forEach(model => {
      const positions: THREE.Vector3[] = [];

      for (let i = 0; i < numObjectsPerModel; i++) {
        const x =
          xCenter + Math.random() * xSpread * (Math.random() > 0.5 ? -1 : 1);
        const z =
          zCenter + Math.random() * zSpread * (Math.random() > 0.5 ? -1 : 1);

        const y = setOnPlane(this.ground, null, x, z);

        positions.push(new THREE.Vector3(x, y, z));
      }

      const mergedGeometries = generateObjectCluster(model, positions);

      mergedGeometries.forEach(geometry => {
        this.container.add(geometry);
      });
    });
  }

  /**
   * Sets common scale to object
   *
   * @param object object to be scaled
   */
  setScale(object: THREE.Object3D, scale = 4) {
    object.scale.set(scale, scale, scale);
  }
  /**
   * Sets common scale to objects
   *
   * @param objects objects to be scaled
   */
  setScales(objects: THREE.Object3D[], scale = 4) {
    objects.forEach(o => this.setScale(o, scale));
  }
}
