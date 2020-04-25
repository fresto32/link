import CANNON from 'cannon';
import * as THREE from 'three';

import Time from '../Utils/Time';
import Sizes from '../Utils/Sizes';
import Controls from './Controls';

export default class Physics {
  // Utilities
  /** Time */
  time: Time;
  /** Sizes */
  sizes: Sizes;

  // Functionality
  /** Config */
  config: {debug: boolean; touch: boolean};
  /** Debug */
  debug: dat.GUI;
  /** Debug Foler */
  debugFolder!: dat.GUI;
  /** World */
  world!: CANNON.World;
  /** Controls */
  controls: Controls;

  // Physics Functionality
  /** Models */
  models!: {
    container: THREE.Object3D;
    materials: {
      static: THREE.Material;
      dynamic: THREE.Material;
      dynamicSleeping: THREE.Material;
    };
  };
  /** Materials */
  materials!: {
    items: {
      floor: CANNON.Material;
      dummy: CANNON.Material;
      wheel: CANNON.Material;
    };
    contacts: {
      floorDummy: CANNON.ContactMaterial;
      dummyDummy: CANNON.ContactMaterial;
      floorWheel: CANNON.ContactMaterial;
    };
  };
  /** Floor */
  floor!: {
    body: CANNON.Body;
  };
  /** Avatar */
  avatar!: {
    position: THREE.Vector3;
  };

  constructor(_params: {
    time: Time;
    sizes: Sizes;
    config: {debug: boolean; touch: boolean};
    debug: dat.GUI;
    controls: Controls;
  }) {
    this.time = _params.time;
    this.sizes = _params.sizes;
    this.config = _params.config;
    this.debug = _params.debug;
    this.controls = _params.controls;

    // Set up
    if (this.debug) {
      this.debugFolder = this.debug.addFolder('physics');
      this.debugFolder.open();
    }

    // TODO:
    //this.setWorld()
    //this.setModels()
    //this.setMaterials()
    //this.setFloor()

    this.setAvatar();

    this.time.on('tick', () => {
      //this.world.step(1 / 60, this.time.delta, 3)
    });
  }

  setWorld() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, 0, -3.25);
    this.world.allowSleep = true;
    // this.world.gravity.set(0, 0, 0)
    // this.world.broadphase = new CANNON.SAPBroadphase(this.world)
    this.world.defaultContactMaterial.friction = 0;
    this.world.defaultContactMaterial.restitution = 0.2;

    // Debug
    if (this.debug) {
      this.debugFolder
        .add(this.world.gravity, 'z')
        .step(0.001)
        .min(-20)
        .max(20)
        .name('gravity');
    }
  }

  setModels() {
    this.models.container = new THREE.Object3D();
    this.models.container.visible = false;
    this.models.materials.static = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      wireframe: true,
    });
    this.models.materials.dynamic = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
    });
    this.models.materials.dynamicSleeping = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      wireframe: true,
    });

    // Debug
    if (this.debug) {
      this.debugFolder
        .add(this.models.container, 'visible')
        .name('modelsVisible');
    }
  }

  setMaterials() {
    // All materials
    this.materials.items.floor = new CANNON.Material('floorMaterial');
    this.materials.items.dummy = new CANNON.Material('dummyMaterial');
    this.materials.items.wheel = new CANNON.Material('wheelMaterial');

    // Contact between materials
    this.materials.contacts.floorDummy = new CANNON.ContactMaterial(
      this.materials.items.floor,
      this.materials.items.dummy,
      {friction: 0.05, restitution: 0.3, contactEquationStiffness: 1000}
    );
    this.world.addContactMaterial(this.materials.contacts.floorDummy);

    this.materials.contacts.dummyDummy = new CANNON.ContactMaterial(
      this.materials.items.dummy,
      this.materials.items.dummy,
      {friction: 0.5, restitution: 0.3, contactEquationStiffness: 1000}
    );
    this.world.addContactMaterial(this.materials.contacts.dummyDummy);

    this.materials.contacts.floorWheel = new CANNON.ContactMaterial(
      this.materials.items.floor,
      this.materials.items.wheel,
      {friction: 0.3, restitution: 0, contactEquationStiffness: 1000}
    );
    this.world.addContactMaterial(this.materials.contacts.floorWheel);
  }

  setFloor() {
    this.floor.body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: this.materials.items.floor,
    });

    this.world.addBody(this.floor.body);
  }

  setAvatar() {
    this.avatar = {position: new THREE.Vector3()};
    this.avatar.position.set(0, 0, 0);

    const speed = 1;

    this.time.on('tick', () => {
      if (!this.config.touch) {
        if (this.controls.actions.up) this.avatar.position.z -= speed;
        if (this.controls.actions.down) this.avatar.position.z += speed;
        if (this.controls.actions.left) this.avatar.position.x -= speed;
        if (this.controls.actions.right) this.avatar.position.x += speed;
      } else {
        const angle = this.controls.touch.joystick.angle!.value;
        if (angle === 0) return;
        else if (angle > 1.4 && angle < 2.8) this.avatar.position.z -= speed;
        else if (angle > -1.6 && angle < -0.2) this.avatar.position.z += speed;
        else if (angle > -0.2 && angle < 1.4) this.avatar.position.x += speed;
        else this.avatar.position.x -= speed;
      }
    });
  }
}
