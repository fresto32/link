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
import SpawnIslandSettings from '../Settings/SpawnIsland';

export default class SpawnIsland {
  // TODO: Make ground and buildings private/readonly. Create readonly setters
  // for them.
  /** Background Mesh */
  public ground!: THREE.Mesh;
  /** Buildings */
  public buildings!: Building[];
  /** Resources */
  private readonly resources: Resources;
  /** Debug */
  private readonly config: Config;
  /** Debug */
  private readonly debug: dat.GUI;
  /** Objects */
  private readonly objects: Objects;
  /** Settings */
  private readonly settings: SpawnIslandSettings;
  /** Areas that ought to be flat and contain no shrubbery */
  private readonly exclusionAreas: THREE.Box3[];

  constructor(_params: {
    resources: Resources;
    config: Config;
    debug: dat.GUI;
    objects: Objects;
    settings: SpawnIslandSettings;
  }) {
    // Params
    this.resources = _params.resources;
    this.config = _params.config;
    this.debug = _params.debug;
    this.objects = _params.objects;
    this.settings = _params.settings;

    // Setting up member variables
    this.exclusionAreas = [];

    // Setting up scenegraph
    this.setBuildings();
    this.setGround();
    this.setBorder();
    this.setUnaryLandmarks();
    this.setClusters();
    this.setGrassTufts();
  }

  /**
   * Set Ground
   *
   * The ground for the spawn island is a single sided plane.
   */
  private setGround() {
    const texture = this.resources.textures[this.settings.ground.texture];
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.x = 10;
    texture.repeat.y = 10;

    const backgroundMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      emissive: this.settings.ground.emissive,
    });

    const geometry = new THREE.PlaneGeometry(
      this.settings.ground.width,
      this.settings.ground.depth,
      5,
      5
    );
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
  private setBorder() {
    const model = this.resources.models[this.settings.border.model];
    const fenceVertical = model.scene.children[0].clone();
    setScale(fenceVertical);
    const fenceHorizontal = fenceVertical.clone().rotateY(Math.PI / 2);

    const fenceDimensions = objectDimensions(fenceHorizontal);

    const addFenceLine = (_params: {
      model: THREE.Object3D;
      initialisation: number;
      condition: (ndx: number) => boolean;
      x: (ndx: number) => number;
      z: (ndx: number) => number;
      objectRotationAxis: 'z' | 'x'; // fences shouldn't be rotated on 'y'.
      rotateRelativeTo: 'z' | 'x'; // fences shouldn't be rotated relative to 'y'.
    }) => {
      const positions: THREE.Vector3[] = [];

      for (
        let i = _params.initialisation;
        _params.condition(i);
        i += fenceDimensions.z
      ) {
        const fence = _params.model.clone();
        setOnPlane(
          this.ground,
          fence,
          _params.x(i),
          _params.z(i),
          _params.objectRotationAxis,
          _params.rotateRelativeTo
        );
        positions.push(fence.position);
      }
      const clusters = generateObjectCluster(_params.model, positions, null, {
        plane: this.ground,
        objectRotationAxis: _params.objectRotationAxis,
        rotateRelativeTo: _params.rotateRelativeTo,
      });
      clusters.forEach(cluster => {
        this.objects.add(cluster.mesh, {
          isCollidable: true,
          collisionBoundingBoxes: cluster.boundingBoxes,
        });
      });
    };

    // Build fences for each side of the map...
    // +z side
    addFenceLine({
      model: fenceVertical,
      initialisation: -145,
      condition: (ndx: number) => ndx < 155,
      x: (ndx: number) => ndx,
      z: () => 100,
      objectRotationAxis: 'z',
      rotateRelativeTo: 'x',
    });
    // -z side
    addFenceLine({
      model: fenceVertical,
      initialisation: -145,
      condition: (ndx: number) => ndx < 155,
      x: (ndx: number) => ndx,
      z: () => -100,
      objectRotationAxis: 'z',
      rotateRelativeTo: 'x',
    });
    // +x side
    addFenceLine({
      model: fenceHorizontal,
      initialisation: -100,
      condition: (ndx: number) => ndx < 100,
      x: () => 150,
      z: (ndx: number) => ndx,
      objectRotationAxis: 'z',
      rotateRelativeTo: 'z',
    });
    // -x side
    addFenceLine({
      model: fenceHorizontal,
      initialisation: -100,
      condition: (ndx: number) => ndx < 100,
      x: () => -150,
      z: (ndx: number) => ndx,
      objectRotationAxis: 'z',
      rotateRelativeTo: 'z',
    });
  }

  /**
   * Sets all the unary landmarks in settings.
   */
  private setUnaryLandmarks() {
    for (const landmark of this.settings.unaryLandmarks) {
      const model = this.resources.models[landmark.model].scene.children[0];
      setScale(model, landmark.scale);
      if (landmark.rotation) model.rotateY(landmark.rotation);
      setOnPlane(this.ground, model, landmark.position.x, landmark.position.z);
      this.objects.add(model, {isCollidable: true});
    }
  }

  /**
   * Sets all the clusters in settings.
   *
   * Clusters may or may not be landmarks.
   */
  private setClusters() {
    const items = this.resources.models;

    for (const cluster of this.settings.clusters) {
      const models: THREE.Object3D[] = [];
      cluster.models.forEach(m => models.push(items[m].scene.children[0]));
      this.setModelCluster(
        models,
        cluster.numObjects,
        cluster.scale,
        cluster.position.xCenter,
        cluster.position.zCenter,
        cluster.position.xSpread,
        cluster.position.zSpread,
        cluster.obeyExclusionAreas ? this.exclusionAreas : undefined
      );
    }
  }

  /**
   * Set Grass Tufts
   *
   * Adapted from threex.grass. Creates tufts of grass randomly on the map.
   */
  private setGrassTufts() {
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
  private setBuildings() {
    this.buildings = [];

    this.settings.buildings.forEach(dimension => {
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

      house.container.position.x = dimension.position.x;
      house.container.position.z = dimension.position.z;
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
  private setModelCluster(
    models: THREE.Object3D[],
    numObjectsPerModel: number,
    setScale = 1,
    xCenter = 0,
    zCenter = 0,
    xSpread = 1,
    zSpread = 1,
    exclusionAreas: THREE.Box3[] | undefined = undefined,
    isCollidable = true
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
        this.objects.add(geometry.mesh, {
          isCollidable: isCollidable,
          collisionBoundingBoxes: geometry.boundingBoxes,
        });
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
