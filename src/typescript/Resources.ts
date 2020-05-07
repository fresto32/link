/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from 'three';

import Loader from './Utils/Loader';
import EventEmitter from './Utils/EventEmitter';

export default class Resources extends EventEmitter {
  /** Loader to load all item and texture resources */
  loader: Loader;
  /** Items that are currently loaded */
  models: {
    [key: string]: {
      scene: THREE.Group;
      scenes: THREE.Group[];
      animations: any;
      cameras: THREE.Camera[];
      asset: any;
      parser: any;
      userData: any;
    };
  };
  /** Textures that are currently loaded */
  textures: {
    [key: string]: THREE.Texture;
  };

  constructor() {
    super();

    this.loader = new Loader();
    this.models = {};
    this.textures = {};

    // Reason: Consistency of formating objects improves readability...
    // prettier-ignore
    this.loader.load([
      /**
       * Models
       * */
      // Pirate Kit
      {name: 'shipDark', source: 'src/models/pirateKit/ship_dark.gltf'},
      {name: 'palmLong', source: 'src/models/pirateKit/palm_long.gltf'},
      {name: 'palmShort', source: 'src/models/pirateKit/palm_short.gltf'},
      {name: 'shipWreck', source: 'src/models/pirateKit/ship_wreck.gltf'},
      {name: 'tower', source: 'src/models/pirateKit/tower.gltf'},
      {name: 'formationLargeStone', source: 'src/models/pirateKit/formationLarge_stone.gltf'},
      {name: 'formationLargeRock', source: 'src/models/pirateKit/formationLarge_rock.gltf'},
      {name: 'formationRock', source: 'src/models/pirateKit/formation_rock.gltf'},
      {name: 'formationStone', source: 'src/models/pirateKit/formation_stone.gltf'},
      {name: 'pirateCaptain', source: 'src/models/pirateKit/pirate_captain.gltf'},

      // Nature Kit
      {name: 'fence', source: 'src/models/natureKit/fence_double.gltf'},

      // Holiday Kit
      {name: 'cabinWall', source: 'src/models/holidayKit/cabinWall.glb'},
      {name: 'cabinFloor', source: 'src/models/holidayKit/cabinFloor.glb'},
      {name: 'cabinRoof', source: 'src/models/holidayKit/cabinRoof.glb'},
      {name: 'cabinRoofCenter', source: 'src/models/holidayKit/cabinRoofCenter.glb'},
      {name: 'cabinRoofFlat', source: 'src/models/holidayKit/cabinRoofFlat.glb'},
      {name: 'cabinDoor', source: 'src/models/holidayKit/cabinDoor.glb'},
      {name: 'cabinSide', source: 'src/models/holidayKit/cabinSide.glb'},
      {name: 'cabinSideCenter', source: 'src/models/holidayKit/cabinSideCenter.glb'},
      {name: 'cabinWindow', source: 'src/models/holidayKit/cabinWindow.glb'},
      {name: 'cabinWindowLarge', source: 'src/models/holidayKit/cabinWindowLarge.glb'},

      /**
       * Textures
       * */
      // Grass
      {name: 'grass', source: 'src/models/floor/grasslight-small.jpg', type: 'texture'},
      {name: 'grassTuft', source: 'src/models/floor/grass01.png', type: 'texture'},

      // Sky Box
      {name: 'skyboxBk', source: 'src/models/skybox/5/bay_bk.jpg', type: 'texture'},
      {name: 'skyboxDn', source: 'src/models/skybox/5/bay_dn.jpg', type: 'texture'},
      {name: 'skyboxFt', source: 'src/models/skybox/5/bay_ft.jpg', type: 'texture'},
      {name: 'skyboxLf', source: 'src/models/skybox/5/bay_lf.jpg', type: 'texture'},
      {name: 'skyboxRt', source: 'src/models/skybox/5/bay_rt.jpg', type: 'texture'},
      {name: 'skyboxUp', source: 'src/models/skybox/5/bay_up.jpg', type: 'texture'},

      /**
       * Options Pictures
       * */
      {name: 'mergeSort', source: 'src/models/options/merge_sort.png', type: 'texture'},
      {name: 'quickSort', source: 'src/models/options/quick_sort.png', type: 'texture'},
      {name: 'insertionSort', source: 'src/models/options/insertion_sort.png', type: 'texture'},
      {name: 'radixSort', source: 'src/models/options/radix_sort.png', type: 'texture'},
    ]);

    this.loader.on('fileEnd', (_resource: any, _data: any) => {
      if (_resource.type === 'texture') {
        this.textures[`${_resource.name}`] = _data;
      } else {
        this.models[_resource.name] = _data;
      }

      // Trigger progress
      this.trigger('progress', [this.loader.loaded / this.loader.toLoad]);
    });

    this.loader.on('end', () => {
      // Trigger ready
      this.trigger('ready', null);
    });
  }
}