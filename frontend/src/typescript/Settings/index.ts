import ApplicationSettings from './Types/Application';
import ResourcesSettings from './Types/Resources';
import WorldSettings from './Types/World';
import Landmarks from './Landmarks';

export default class Settings implements ApplicationSettings {
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

    this.setConstantResources();
    this.setPrompt();
    this.setOptions();
    this.setSounds();
    this.setClusters();
    this.setBuildings();
    this.setSkybox();
    this.setLandmarks();
  }

  private setConstantResources() {
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
          x: 55,
          z: 20,
        },
      },
      {
        text: 'Radix sort',
        picture: 'radixSort',
        isCorrectOption: true,
        position: {
          x: 55,
          z: -20,
        },
      },
      {
        text: 'Quick sort',
        picture: 'quickSort',
        isCorrectOption: false,
        position: {
          x: -55,
          z: 20,
        },
      },
      {
        text: 'Insertion sort',
        picture: 'insertionSort',
        isCorrectOption: false,
        position: {
          x: -55,
          z: -20,
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

  private setClusters() {
    this.world.spawnIsland.clusters.push(
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
      {name: 'formationRock', source: 'src/models/pirateKit/formation_rock.gltf'},
      {name: 'formationLargeRock', source: 'src/models/pirateKit/formationLarge_rock.gltf'},
      {name: 'formationStone', source: 'src/models/pirateKit/formation_stone.gltf'},
      {name: 'formationLargeStone', source: 'src/models/pirateKit/formationLarge_stone.gltf'}
    );
  }

  private setBuildings() {
    const numBuildings = this.randomInt(0, 5);

    for (let i = 0; i < numBuildings; i++) {
      const numWidthSections = this.randomInt(1, 5);
      const numHeightSections = this.randomInt(1, 4);
      const numDepthSections = this.randomInt(1, numWidthSections + 1);

      const maxX = this.world.spawnIsland.ground.width / 2;
      const maxZ = this.world.spawnIsland.ground.depth / 2;

      const positionX = this.randomInt(-0.8 * maxX, 0.8 * maxX);
      const positionZ = this.randomInt(-0.8 * maxZ, 0.8 * maxZ);

      this.world.spawnIsland.buildings.push({
        numWidthSections: numWidthSections,
        numDepthSections: numDepthSections,
        numHeightSections: numHeightSections,
        position: {
          x: positionX,
          z: positionZ,
        },
      });
    }

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
    const num = this.randomInt(1, 46).toString();

    // Reason: consistent formatting of resources items
    // prettier-ignore
    this.resources.items.push(
      {name: 'skyboxBk', source: 'src/models/skybox/' + num + '/bk.jpg', type: 'texture'},
      {name: 'skyboxDn', source: 'src/models/skybox/' + num + '/dn.jpg', type: 'texture'},
      {name: 'skyboxFt', source: 'src/models/skybox/' + num + '/ft.jpg', type: 'texture'},
      {name: 'skyboxLf', source: 'src/models/skybox/' + num + '/lf.jpg', type: 'texture'},
      {name: 'skyboxRt', source: 'src/models/skybox/' + num + '/rt.jpg', type: 'texture'},
      {name: 'skyboxUp', source: 'src/models/skybox/' + num + '/up.jpg', type: 'texture'}
    )
  }

  private setLandmarks() {
    const landmarks = new Landmarks();
    landmarks.setLandmarks(
      this.resources,
      this.world.spawnIsland.unaryLandmarks,
      this.world.spawnIsland.clusters
    );
  }

  private randomInt(min: number, max: number) {
    return min + Math.floor(Math.random() * (max - min));
  }
}
