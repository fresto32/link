import * as THREE from 'three';
import Resources from '../Resources';
import Objects from './Objects';
import objectDimensions from './Helpers/ObjectDimensions';
import setOnPlane from './Helpers/SetOnPlane';
import generateObjectCluster from './Helpers/GenerateObjectCluster';
import grassTufts from './GrassTufts';
import Building from './Building';
import RandomPoint from './Helpers/RandomPoint';
import {flattenPlaneToBoxes} from './Helpers/FlattenPlane';

export default class SpawnIsland {
  /** Background Mesh */
  ground!: THREE.Mesh;
  /** Buildings */
  buildings!: Building[];
  /** Resources */
  readonly resources: Resources;
  /** Debug */
  readonly config: Config;
  /** Debug */
  readonly debug: dat.GUI;
  /** Objects */
  readonly objects: Objects;
  /** Areas that ought to be flat and contain no shrubbery */
  exclusionAreas!: THREE.Box3[];

  constructor(_params: {
    resources: Resources;
    config: Config;
    debug: dat.GUI;
    objects: Objects;
  }) {
    // Params
    this.resources = _params.resources;
    this.config = _params.config;
    this.debug = _params.debug;
    this.objects = _params.objects;

    // Setting up member variables
    this.exclusionAreas = [];

    // Setting up scenegraph
    this.setBuildings();
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

    // Rotate plane to be orthogonal to y axis. This is baked into the ground's
    // vertices so that calls to setOnPlane(...) do not require further
    // manipulation to make this plane's vertices axis aligned with some object.
    const rotation = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
    geometry.applyMatrix4(rotation);

    // Create a hilly ground but keep a flat region for buildings.
    geometry.vertices.forEach(v => {
      v.y = Math.random() * 30;
    });

    flattenPlaneToBoxes(this.ground, this.exclusionAreas);
  }

  /**
   * Set Border
   *
   * The border is a single sided plane that is slightly larger than the
   * background plane.
   */
  setBorder() {
    const fenceVertical = this.resources.models.fence.scene.children[0].clone();
    setScale(fenceVertical);
    const fenceHorizontal = fenceVertical.clone().rotateY(Math.PI / 2);

    const dimensions = objectDimensions(fenceHorizontal);

    const fenceSections = [
      new THREE.Object3D(),
      new THREE.Object3D(),
      new THREE.Object3D(),
      new THREE.Object3D(),
    ];

    // Build fences for each side of the map...
    // +z side
    for (let i = -145; i < 150; i += dimensions.z) {
      const fence = fenceVertical.clone();
      setOnPlane(this.ground, fence, i, 100, 'z', 'x');
      fenceSections[0].add(fence);
    }
    // -z side
    for (let i = -145; i < 150; i += dimensions.z) {
      const fence = fenceVertical.clone();
      setOnPlane(this.ground, fence, i, -100, 'z', 'x');
      fenceSections[1].add(fence);
    }
    // +x side
    for (let i = -100; i < 100; i += dimensions.z) {
      const fence = fenceHorizontal.clone();
      setOnPlane(this.ground, fence, 150, i, 'z', 'z');
      fenceSections[2].add(fence);
    }
    // -x side
    for (let i = -100; i < 100; i += dimensions.z) {
      const fence = fenceHorizontal.clone();
      setOnPlane(this.ground, fence, -150, i, 'z', 'z');
      fenceSections[3].add(fence);
    }

    // fence sections added individually so their bounding boxes span narrow
    // segments rather than the whole map.
    fenceSections.forEach(section => {
      this.objects.add(section, {isCollidable: true});
    });
  }

  /**
   * Set Pirate Boat
   *
   * Sets a pirate boat in the upper right quadrant.
   */
  setPirateBoat() {
    const shipDark = this.resources.models.shipDark.scene.children[0];
    setScale(shipDark);
    setOnPlane(this.ground, shipDark, 75, 50);
    this.objects.add(shipDark, {isCollidable: true});
  }

  /**
   * Set Palm Trees
   *
   * Sets some palm trees in the bottom right quadrant
   */
  setPalmTrees() {
    const items = this.resources.models;
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
    const shipWreck = this.resources.models.shipWreck.scene.children[0];
    setScale(shipWreck);
    shipWreck.rotateY(Math.PI / 1.5);
    setOnPlane(this.ground, shipWreck, -75, -50);
    this.objects.add(shipWreck, {isCollidable: true});
  }

  /**
   * Set Tower
   *
   * Sets a tower in the upper left quadrant.
   */
  setTower() {
    const tower = this.resources.models.tower.scene.children[0];
    setScale(tower);
    setOnPlane(this.ground, tower, -75, 50);
    this.objects.add(tower, {isCollidable: true});
  }

  /**
   * Set Rock Formations
   *
   * Sets rock formations around the map to add more scenery
   */
  setRockFormations() {
    const items = this.resources.models;
    const rocks: THREE.Object3D[] = [
      items.formationLargeRock.scene.children[0],
      items.formationRock.scene.children[0],
    ];
    const stones: THREE.Object3D[] = [
      items.formationLargeStone.scene.children[0],
      items.formationStone.scene.children[0],
    ];
    this.setModelCluster(rocks, 30, 2, 0, 0, 150, 100, this.exclusionAreas);
    this.setModelCluster(stones, 30, 1.5, 0, 0, 150, 100, this.exclusionAreas);
  }

  /**
   * Set Grass Tufts
   *
   * Adapted from threex.grass. Creates tufts of grass randomly on the map.
   */
  setGrassTufts() {
    this.objects.add(
      grassTufts(
        this.resources.textures.grassTuft,
        this.ground,
        1,
        2,
        10000,
        150,
        100,
        this.exclusionAreas
      )
    );
  }

  /**
   * Set Buildings
   */
  setBuildings() {
    this.buildings = [];

    const buildingDimensions = [
      {
        numWidthSections: 1,
        numDepthSections: 1,
        numHeightSections: 1,
        xPosition: 20,
        zPosition: 30,
      },
      {
        numWidthSections: 1,
        numDepthSections: 1,
        numHeightSections: 1,
        xPosition: 10,
        zPosition: 30,
      },
      {
        numWidthSections: 3,
        numDepthSections: 2,
        numHeightSections: 1,
        xPosition: -20,
        zPosition: 30,
      },
      {
        numWidthSections: 2,
        numDepthSections: 2,
        numHeightSections: 1,
        xPosition: 20,
        zPosition: 50,
      },
      {
        numWidthSections: 5,
        numDepthSections: 5,
        numHeightSections: 2,
        xPosition: -20,
        zPosition: 50,
      },
    ];

    buildingDimensions.forEach(dimension => {
      const house = new Building({
        ground: this.ground,
        resources: this.resources,
        config: this.config,
        debug: this.debug,
        buildingProperties: {
          numWidthSections: dimension.numWidthSections,
          numDepthSections: dimension.numDepthSections,
          numHeightSections: dimension.numHeightSections,
        },
      });

      house.container.position.z = dimension.zPosition;
      house.container.position.x = dimension.xPosition;
      house.container.scale.copy(new THREE.Vector3(6, 6, 6));
      house.container.updateMatrix();
      house.computeBoundingBox();

      this.buildings.push(house);
      this.exclusionAreas.push(house.boundingBox!);
      this.objects.add(house.container);
    });
  }

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
    zSpread = 1,
    exclusionAreas: THREE.Box3[] | undefined = undefined
  ) {
    setScales(models, setScale);

    models.forEach(model => {
      const positions: THREE.Vector3[] = [];

      for (let i = 0; i < numObjectsPerModel; i++) {
        const randomPoint = RandomPoint(
          this.ground,
          xCenter,
          zCenter,
          xSpread,
          zSpread,
          exclusionAreas
        );
        positions.push(randomPoint);
      }

      const mergedGeometries = generateObjectCluster(model, positions);

      mergedGeometries.forEach(geometry => {
        this.objects.add(geometry);
      });
    });
  }
}

// Helpers

/**
 * Sets common scale to object
 *
 * @param object object to be scaled
 */
function setScale(object: THREE.Object3D, scale = 4) {
  object.scale.set(scale, scale, scale);
}
/**
   * Sets common scale to objects
 *
 * @param objects objects to be scaled
 */
function setScales(objects: THREE.Object3D[], scale = 4) {
  objects.forEach(o => setScale(o, scale));
}
