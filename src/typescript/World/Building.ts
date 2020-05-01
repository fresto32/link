import * as THREE from 'three';
import Resources from '../Resources';
import Time from '../Utils/Time';
import Avatar from './Avatar';
import ObjectDimensions from './Helpers/ObjectDimensions';
import ObjectBoundingBox from './Helpers/ObjectBoundingBox';

/**
 * Creates a building.
 */
export default class Building {
  /** Container */
  container: THREE.Object3D;
  /** Resources */
  readonly resources: Resources;
  /** Debug */
  readonly config: {debug: boolean};
  /** Debug */
  readonly debug: dat.GUI;
  /** Ground */
  readonly ground: THREE.Mesh;

  // Building Functionality
  /** Number of width sections */
  readonly numWidthSections: number;
  /** Number of depth sections */
  readonly numDepthSections: number;
  /** Number of height sections */
  readonly numHeightSections: number;

  // Dimensions of building models
  /** Floor Dimensions */
  readonly floorDimensions: THREE.Vector3;
  /** Roof Dimensions */
  readonly roofDimensions: THREE.Vector3;
  /** Wall Dimensions */
  readonly wallDimensions: THREE.Vector3;

  // Hiding upper floor objects on avatar entry functionality
  /** Non ground floor objects */
  upperFloorObjects: THREE.Object3D[];
  /** Container Bounding Box */
  boundingBox: THREE.Box3 | undefined;

  constructor(_params: {
    ground: THREE.Mesh;
    resources: Resources;
    config: {debug: boolean};
    debug: dat.GUI;
    buildingProperties: {
      numWidthSections: number;
      numHeightSections: number;
      numDepthSections: number;
    };
  }) {
    // Container
    this.container = new THREE.Object3D();
    this.container.matrixAutoUpdate = false;

    // Params
    this.ground = _params.ground;
    this.resources = _params.resources;
    this.config = _params.config;
    this.debug = _params.debug;

    // Setup Properties
    this.numWidthSections = _params.buildingProperties.numWidthSections;
    this.numDepthSections = _params.buildingProperties.numDepthSections;
    this.numHeightSections = _params.buildingProperties.numHeightSections;
    this.upperFloorObjects = [];

    // Setup model dimensions...
    this.floorDimensions = ObjectDimensions(
      this.resources.models.cabinFloor.scene
    );
    this.roofDimensions = ObjectDimensions(
      this.resources.models.cabinRoof.scene
    );
    this.wallDimensions = ObjectDimensions(
      this.resources.models.cabinWall.scene
    );

    // Setup
    this.setWalls();
    this.setRoof();
    this.setFloor();
    this.setGables();
  }

  /**
   * Set Walls
   *
   * Setting the walls of building. A row of walls is produced for all sides and
   * at every level.
   */
  setWalls() {
    const allModels = this.resources.models;

    const models = {
      wall: allModels.cabinWall.scene.clone(true),
      door: allModels.cabinDoor.scene.clone(true),
      window: allModels.cabinWindow.scene.clone(true),
      windowLarge: allModels.cabinWindowLarge.scene.clone(true),
    };

    let doorPlaced = false;

    /** Returns a function that returns a random model from models. */
    const randomModel = (
      level: number,
      rotation: number,
      translateX: number,
      translateZ: number
    ) => {
      const chanceWall = 0.4;
      const chanceWindowLarge = 0.55;
      let chanceWindow = 0.7;
      let chanceDoor = 0.3;
      if (doorPlaced || level > 0) {
        chanceWindow += chanceDoor;
        chanceDoor = 0;
      }

      return () => {
        const chance = Math.random();

        let model: THREE.Object3D;
        if (chance < chanceWall) {
          model = models.wall.clone(true);
        } else if (chance < chanceWindowLarge) {
          model = models.windowLarge.clone(true);
        } else if (chance < chanceWindow) {
          model = models.window.clone(true);
        } else if (!doorPlaced && level === 0) {
          model = models.door.clone(true);
          doorPlaced = true;
        } else {
          model = models.window.clone(true);
        }

        model.position.copy(new THREE.Vector3(0, 0, 0));
        model.translateZ(translateZ);
        model.translateX(translateX);
        model.rotateY(rotation);

        return model;
      };
    };

    const numLevels = this.numHeightSections;

    for (let level = 0; level < numLevels; level++) {
      const height = level * this.wallDimensions.y;

      // Setting walls of each side...
      {
        // Setting walls of +z sides
        const width = (ndx: number) => ndx * this.wallDimensions.x;
        const condition = (ndx: number) => ndx < this.numWidthSections;
        const depth = () => (this.numDepthSections - 1) * this.wallDimensions.x;
        this.addRowOfObjects(
          randomModel(level, 0, 0, 0),
          height,
          depth,
          width,
          condition
        );
      }
      {
        // Setting walls of -z side
        const depth = () => -this.wallDimensions.x;
        const width = (ndx: number) => ndx * this.wallDimensions.x;
        const condition = (ndx: number) => ndx < this.numWidthSections;
        this.addRowOfObjects(
          randomModel(level, Math.PI, this.wallDimensions.x, 0),
          height,
          depth,
          width,
          condition
        );
      }
      {
        // Setting walls of +x side
        const depth = (ndx: number) => ndx * this.wallDimensions.x;
        const width = () => this.numWidthSections * this.wallDimensions.x;
        const condition = (ndx: number) => ndx < this.numDepthSections;
        this.addRowOfObjects(
          randomModel(level, Math.PI / 2, 0, 0),
          height,
          depth,
          width,
          condition
        );
      }
      {
        // Setting walls of -x side
        const depth = (ndx: number) => ndx * this.wallDimensions.x;
        const width = () => 0;
        const condition = (ndx: number) => ndx < this.numDepthSections;
        this.addRowOfObjects(
          randomModel(level, -Math.PI / 2, 0, -this.wallDimensions.x),
          height,
          depth,
          width,
          condition
        );
      }
    }
  }

  /**
   * Set Roof
   */
  setRoof() {
    const models = this.resources.models;
    const roofModel = models.cabinRoof.scene.children[0].clone();

    const roofLevels = Math.floor(this.numWidthSections / 2);

    for (let roofLevel = 0; roofLevel < roofLevels; roofLevel++) {
      const height =
        this.numHeightSections * this.wallDimensions.y +
        roofLevel * this.wallDimensions.y;

      {
        // Set +x side sections
        const width = () =>
          (this.numWidthSections - 1 - roofLevel) * this.wallDimensions.x;
        const depth = (ndx: number) => ndx * this.wallDimensions.x;
        const model = () => roofModel.clone();
        const condition = (ndx: number) => ndx < this.numDepthSections;

        this.addRowOfObjects(model, height, depth, width, condition);
      }
      {
        // Set -x side sections
        const width = () => (1 + roofLevel) * this.wallDimensions.x;
        const depth = (ndx: number) => ndx * this.wallDimensions.x;
        const model = () => roofModel.clone().rotateY(Math.PI);
        // Since roofModel's center of rotation is its top left corner, we have
        // to adjust the start point by -1.
        const condition = (ndx: number) => ndx < this.numDepthSections - 1;
        this.addRowOfObjects(model, height, depth, width, condition, -1);
      }
    }

    // If there are an odd number of width sections, we need to fill in the
    // hole at the top of the building with a cental roof...
    if (this.numWidthSections % 2 === 1) {
      const width = () => roofLevels * this.wallDimensions.x;
      const height =
        // Y distance of walled levels
        this.numHeightSections * this.wallDimensions.y +
        // Y distance of the roof
        roofLevels * this.wallDimensions.y;
      const model = () => models.cabinRoofCenter.scene.clone(true);
      const depth = (ndx: number) => ndx * this.wallDimensions.x;
      const condition = (ndx: number) => ndx < this.numDepthSections;
      this.addRowOfObjects(model, height, depth, width, condition);
    }
  }

  /**
   * Set Gables
   */
  setGables() {
    const models = this.resources.models;

    const windows = [
      models.cabinWindow.scene.children[0],
      models.cabinWindowLarge.scene.children[0],
    ];

    const levels = Math.floor(this.numWidthSections / 2);

    for (let level = 0; level < levels; level++) {
      const height =
        // Height from the floor to the highest walled level
        this.numHeightSections * this.wallDimensions.y +
        // Height from the prior roof level to this roof level
        level * this.roofDimensions.y;

      const elements =
        level === 0 ? this.numWidthSections : this.numWidthSections - 2 * level;

      {
        // +z side
        const depth = () => (this.numDepthSections - 1) * this.wallDimensions.x;
        const width = (ndx: number) => (ndx + level) * this.wallDimensions.x;
        const model = (ndx: number) => {
          if (ndx === 0 || ndx + 1 === elements) {
            // We are at one of the horizontal ends of the gable, add in corners...
            const side = models.cabinSide.scene.children[0].clone(true);
            if (ndx === 0) {
              // Mirror on z axis so the front is facing forward...
              side.applyMatrix4(new THREE.Matrix4().makeScale(1, 1, -1));
              // side.position.copy(new THREE.Vector3(width, height, depth));
              // Rotate so that we fill the triangular hole correctly...
              side.rotateY(Math.PI);
              // In rotating the object, we have effectively translated it because
              // the center of rotation is along its side, so to compensate for
              // this translation...
              side.translateX(this.wallDimensions.x);
            }
            return side;
          } else {
            const i = Math.floor(Math.random() * windows.length);
            return windows[i].clone(true);
          }
        };
        const condition = (ndx: number) => ndx < elements;
        this.addRowOfObjects(model, height, depth, width, condition);
      }
      {
        // -z side
        const depth = () => -this.wallDimensions.x;
        const width = (ndx: number) => (ndx + level) * this.wallDimensions.x;
        const model = (ndx: number) => {
          if (ndx === 0 || ndx + 1 === elements) {
            // We are at one of the horizontal ends of the gable, add in corners...
            const side = models.cabinSide.scene.children[0].clone(true);
            if (ndx === 0) {
              // Mirror on z axis so the front is facing forward...
              side.applyMatrix4(new THREE.Matrix4().makeScale(1, 1, -1));
              // side.position.copy(new THREE.Vector3(width, height, depth));
              // Rotate so that we fill the triangular hole correctly...
              side.rotateY(Math.PI);
              // In rotating the object, we have effectively translated it because
              // the center of rotation is along its side, so to compensate for
              // this translation...
              side.translateX(this.wallDimensions.x);
            } else {
              // Flip them...
              side.applyMatrix4(new THREE.Matrix4().makeScale(1, 1, -1));
            }
            return side;
          } else {
            const i = Math.floor(Math.random() * windows.length);
            const window = windows[i].clone(true);
            window.rotateY(Math.PI);
            window.translateX(-this.wallDimensions.x);
            return window;
          }
        };
        const condition = (ndx: number) => ndx < elements;
        this.addRowOfObjects(model, height, depth, width, condition);
      }
    }

    // If there are an odd number of width sections, we need to fill in the
    // gable at the top of the building of the central roof...
    if (this.numWidthSections % 2 === 1) {
      const width = levels * this.wallDimensions.x;
      const height =
        // Height from the floor to the highest walled level
        this.numHeightSections * this.wallDimensions.y +
        // Height from the walled level to this roof level
        levels * this.wallDimensions.y;

      const model = models.cabinSideCenter.scene.clone(true);

      const galbeMinusZ = model.clone(true);
      galbeMinusZ.rotateY(Math.PI);
      galbeMinusZ.position.copy(
        new THREE.Vector3(
          width + this.wallDimensions.x,
          height,
          -this.wallDimensions.x
        )
      );
      const gablePlusZ = model.clone(true);
      gablePlusZ.position.copy(
        new THREE.Vector3(
          width,
          height,
          (this.numDepthSections - 1) * this.wallDimensions.x
        )
      );

      this.addToContainer(galbeMinusZ, height > 0);
      this.addToContainer(gablePlusZ, height > 0);
    }
  }

  computeBoundingBox() {
    this.boundingBox = ObjectBoundingBox(this.container);
  }

  setAvatarEntryInteraction(avatar: Avatar, time: Time) {
    if (this.boundingBox === undefined)
      this.boundingBox = ObjectBoundingBox(this.container);

    time.on('tick', () => {
      if (this.boundingBox === undefined) return;

      const avatarPosition = avatar.pirateCaptain.position;

      const showUpperFloor = !this.boundingBox.containsPoint(avatarPosition);
      this.upperFloorObjects.forEach(object => {
        object.visible = showUpperFloor;
      });
    });
  }

  /**
   * Set Floor
   */
  setFloor() {
    const floorModel = this.resources.models.cabinFloor.scene.children[0];

    // reason: inline width, depth, and height variables
    // prettier-ignore
    for (let numHeight = 0; numHeight < this.numHeightSections; numHeight++) {
      for (let numWidth = 0; numWidth < this.numWidthSections; numWidth++) {
        for (let numDepth = 0; numDepth < this.numDepthSections; numDepth++) {
          const width  = numWidth  * this.wallDimensions.x;
          const depth  = numDepth  * this.wallDimensions.x;
          const height = numHeight * this.wallDimensions.y;

          const floor = floorModel.clone();
          floor.position.copy(new THREE.Vector3(width, height, depth));
          this.addToContainer(floor, height > 0);
        }
      }
    }
  }

  /**
   * Adds a row of objects at specified positions.
   *
   * @param model Function that returns model to be placed at ndx.
   * @param height Height position of model.
   * @param depth Depth position of model.
   * @param width Width position of model.
   * @param condition Condition of loop.
   * @param initiation Initiation value of loop.
   */
  addRowOfObjects(
    model: (ndx: number) => THREE.Object3D,
    height: number,
    depth: (ndx: number) => number,
    width: (ndx: number) => number,
    condition: (ndx: number) => boolean,
    initiation = 0
  ) {
    for (let i = initiation; condition(i); i++) {
      const element = model(i).clone();
      element.position.add(new THREE.Vector3(width(i), height, depth(i)));
      this.addToContainer(element, height > 0);
    }
  }

  /**
   * Adds object to this container. Places a bounding box around the object if
   * we are debugging.
   *
   * @param object Object to add to this container.
   */
  addToContainer(object: THREE.Object3D, isUpperFloor: boolean) {
    this.container.add(object);

    if (isUpperFloor) this.upperFloorObjects.push(object);

    if (!this.config.debug) {
      object.updateMatrix();
      const helper = new THREE.BoxHelper(object);
      this.container.add(helper);
    }
  }
}
