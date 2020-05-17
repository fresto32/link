import ApplicationSettings from './Settings/Application';
import ResourcesSettings from './Settings/Resources';
import WorldSettings from './Settings/World';

export default class SettingsGenerator implements ApplicationSettings {
  config: Config;
  resources: ResourcesSettings;
  world: WorldSettings;

  constructor() {
    this.config = {debug: true, showBoundingBoxes: false, touch: false};

    this.resources = {items: []};

    this.world = {
      prompt: {
        text: '',
      },
      options: [],
      sounds: {
        itemSettings: [],
      },
      spawnIsland: {
        ground: {
          texture: 'grass',
          emissive: 'green',
          width: 320,
          depth: 220,
        },
        border: {
          model: 'fence',
        },
        unaryLandmarks: [],
        clusters: [],
        buildings: [],
      },
    };

    this.setStaticResources();
    this.setPrompt();
    this.setOptions();
    this.setSounds();
    this.setUnaryLandmarks();
    this.setClusters();
    this.setBuildings();
    this.setSkybox();
  }

  private setStaticResources() {
    // Reason: consistent formatting of resources items
    // prettier-ignore
    this.resources.items.push(
      // Fence
      {name: 'fence', source: 'src/models/natureKit/fence_double.gltf'},
      // Grass
      {name: 'grass', source: 'src/models/floor/grasslight-small.jpg', type: 'texture'},
      {name: 'grassTuft', source: 'src/models/floor/grass01.png', type: 'texture'},
      // Pirate Captain
      {name: 'pirateCaptain', source: 'src/models/pirateKit/pirate_captain.gltf'},
    );
  }

  private setPrompt() {
    this.world.prompt.text = 'What is an example of an O(n) sorting algoritm?';
  }

  private setOptions() {
    this.world.options.push(
      {
        text: 'Merge sort',
        picture: 'mergeSort',
        isCorrectOption: false,
        position: {
          x: 75,
          z: 30,
        },
      },
      {
        text: 'Radix sort',
        picture: 'radixSort',
        isCorrectOption: true,
        position: {
          x: 75,
          z: -30,
        },
      },
      {
        text: 'Quick sort',
        picture: 'quickSort',
        isCorrectOption: false,
        position: {
          x: -75,
          z: 30,
        },
      },
      {
        text: 'Insertion sort',
        picture: 'insertionSort',
        isCorrectOption: false,
        position: {
          x: -75,
          z: -30,
        },
      }
    );

    // Reason: consistent formatting of resources items
    // prettier-ignore
    this.resources.items.push(
      {name: 'mergeSort', source: 'src/models/options/merge_sort.png', type: 'texture'},
      {name: 'quickSort', source: 'src/models/options/quick_sort.png', type: 'texture'},
      {name: 'insertionSort', source: 'src/models/options/insertion_sort.png', type: 'texture'},
      {name: 'radixSort', source: 'src/models/options/radix_sort.png', type: 'texture'}
    );
  }

  private setSounds() {
    this.world.sounds.itemSettings.push(
      {
        name: 'positiveTone',
        sounds: ['src/sounds/positive_tone.mp3'],
        minDelta: 1000,
        volumeMin: 10,
        volumeMax: 10,
        rateMin: 10,
        rateMax: 10,
      },
      {
        name: 'glitch',
        sounds: ['src/sounds/glitch.mp3'],
        minDelta: 1000,
        volumeMin: 10,
        volumeMax: 10,
        rateMin: 10,
        rateMax: 10,
      }
    );
  }

  private setUnaryLandmarks() {
    this.world.spawnIsland.unaryLandmarks.push(
      {
        model: 'shipDark',
        scale: 4,
        position: {
          x: 75,
          z: 50,
        },
      },
      {
        model: 'shipWreck',
        scale: 4,
        rotation: Math.PI / 1.5,
        position: {
          x: -75,
          z: -50,
        },
      },
      {
        model: 'tower',
        scale: 4,
        position: {
          x: -75,
          z: 50,
        },
      }
    );

    this.resources.items.push(
      {name: 'shipDark', source: 'src/models/pirateKit/ship_dark.gltf'},
      {name: 'shipWreck', source: 'src/models/pirateKit/ship_wreck.gltf'},
      {name: 'tower', source: 'src/models/pirateKit/tower.gltf'}
    );
  }

  private setClusters() {
    this.world.spawnIsland.clusters.push(
      {
        models: ['palmShort', 'palmLong'],
        numObjects: 80,
        scale: 4,
        position: {
          xCenter: 75,
          zCenter: -50,
          xSpread: 60,
          zSpread: 40,
        },
        obeyExclusionAreas: false,
      },
      {
        models: ['formationRock', 'formationLargeRock'],
        numObjects: 30,
        scale: 2,
        position: {
          xCenter: 0,
          zCenter: 0,
          xSpread: 150,
          zSpread: 100,
        },
        obeyExclusionAreas: true,
      },
      {
        models: ['formationStone', 'formationLargeStone'],
        numObjects: 30,
        scale: 1.5,
        position: {
          xCenter: 0,
          zCenter: 0,
          xSpread: 150,
          zSpread: 100,
        },
        obeyExclusionAreas: true,
      }
    );
    // Reason: consistent formatting of resources items
    // prettier-ignore
    this.resources.items.push(
      {name: 'palmLong', source: 'src/models/pirateKit/palm_long.gltf'},
      {name: 'palmShort', source: 'src/models/pirateKit/palm_short.gltf'},
      {name: 'formationRock', source: 'src/models/pirateKit/formation_rock.gltf'},
      {name: 'formationLargeRock', source: 'src/models/pirateKit/formationLarge_rock.gltf'},
      {name: 'formationStone', source: 'src/models/pirateKit/formation_stone.gltf'},
      {name: 'formationLargeStone', source: 'src/models/pirateKit/formationLarge_stone.gltf'}
    );
  }

  private setBuildings() {
    this.world.spawnIsland.buildings.push(
      {
        numWidthSections: 1,
        numDepthSections: 1,
        numHeightSections: 1,
        position: {
          x: 20,
          z: 30,
        },
      },
      {
        numWidthSections: 1,
        numDepthSections: 1,
        numHeightSections: 1,
        position: {
          x: 10,
          z: 30,
        },
      },
      {
        numWidthSections: 3,
        numDepthSections: 2,
        numHeightSections: 1,
        position: {
          x: -20,
          z: 30,
        },
      },
      {
        numWidthSections: 2,
        numDepthSections: 2,
        numHeightSections: 1,
        position: {
          x: 20,
          z: 50,
        },
      },
      {
        numWidthSections: 5,
        numDepthSections: 5,
        numHeightSections: 2,
        position: {
          x: -20,
          z: 50,
        },
      }
    );

    // Reason: consistent formatting of resources items
    // prettier-ignore
    this.resources.items.push(
      {name: 'cabinWall', source: 'src/models/holidayKit/cabinWall.glb'},
      {name: 'cabinFloor', source: 'src/models/holidayKit/cabinFloor.glb'},
      {name: 'cabinRoof', source: 'src/models/holidayKit/cabinRoof.glb'},
      {name: 'cabinRoofCenter', source: 'src/models/holidayKit/cabinRoofCenter.glb'},
      {name: 'cabinRoofFlat', source: 'src/models/holidayKit/cabinRoofFlat.glb'},
      {name: 'cabinDoor', source: 'src/models/holidayKit/cabinDoor.glb'},
      {name: 'cabinSide', source: 'src/models/holidayKit/cabinSide.glb'},
      {name: 'cabinSideCenter', source: 'src/models/holidayKit/cabinSideCenter.glb'},
      {name: 'cabinWindow', source: 'src/models/holidayKit/cabinWindow.glb'},
      {name: 'cabinWindowLarge', source: 'src/models/holidayKit/cabinWindowLarge.glb'}
    );
  }

  private setSkybox() {
    // Reason: consistent formatting of resources items
    // prettier-ignore
    this.resources.items.push(
      {name: 'skyboxBk', source: 'src/models/skybox/5/bk.jpg', type: 'texture'},
      {name: 'skyboxDn', source: 'src/models/skybox/5/dn.jpg', type: 'texture'},
      {name: 'skyboxFt', source: 'src/models/skybox/5/ft.jpg', type: 'texture'},
      {name: 'skyboxLf', source: 'src/models/skybox/5/lf.jpg', type: 'texture'},
      {name: 'skyboxRt', source: 'src/models/skybox/5/rt.jpg', type: 'texture'},
      {name: 'skyboxUp', source: 'src/models/skybox/5/up.jpg', type: 'texture'}
    )
  }
}
