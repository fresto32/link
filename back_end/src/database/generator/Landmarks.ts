import ResourcesSettings from 'src/models/types/Resources';
import UnaryLandmarkSettings from 'src/models/types/UnaryLandmark';
import ClusterSettings from 'src/models/types/Cluster';

interface Landmark {
  sources: {name: string; source: string}[];
  scale: number;
  clusterProperties?: {
    numObjects: number;
    xSpread: number;
    zSpread: number;
    obeyExclusionAreas: boolean;
  };
}

export default class Landmarks {
  /** Potential landmarks */
  private potentialLandmarks: Landmark[];
  /** Allowable positions for landmarks */
  private positionsOfLandmarks: {x: number; z: number}[];
  /** Landmarks that will exist in the card */
  private chosenLandmarks: Landmark[];

  constructor() {
    this.potentialLandmarks = [];
    this.positionsOfLandmarks = [];
    this.chosenLandmarks = [];

    this.setPositions();
    this.setPotentialLandmarks();
    this.setChosenLandmarks();
  }

  private setPositions() {
    this.positionsOfLandmarks.push(
      {
        x: 75,
        z: 30,
      },
      {
        x: 75,
        z: -30,
      },
      {
        x: -75,
        z: 30,
      },
      {
        x: -75,
        z: -30,
      }
    );
  }

  private setPotentialLandmarks() {
    this.potentialLandmarks.push(
      {
        sources: [
          {name: 'shipDark', source: 'src/models/pirateKit/ship_dark.gltf'},
        ],
        scale: 4,
      },
      {
        sources: [
          {name: 'shipWreck', source: 'src/models/pirateKit/ship_wreck.gltf'},
        ],
        scale: 4,
      },
      {
        sources: [{name: 'tower', source: 'src/models/pirateKit/tower.gltf'}],
        scale: 4,
      },
      {
        sources: [
          {name: 'palmLong', source: 'src/models/pirateKit/palm_long.gltf'},
          {name: 'palmShort', source: 'src/models/pirateKit/palm_short.gltf'},
        ],
        scale: 4,
        clusterProperties: {
          numObjects: 30,
          xSpread: 30,
          zSpread: 20,
          obeyExclusionAreas: true,
        },
      },
      {
        sources: [
          {
            name: 'flower_beige1',
            source: 'src/models/natureKit/flower_beige1.gltf',
          },
          {
            name: 'flower_beige2',
            source: 'src/models/natureKit/flower_beige2.gltf',
          },
          {
            name: 'flower_beige3',
            source: 'src/models/natureKit/flower_beige3.gltf',
          },

          {
            name: 'flower_red1',
            source: 'src/models/natureKit/flower_red1.gltf',
          },
          {
            name: 'flower_red2',
            source: 'src/models/natureKit/flower_red2.gltf',
          },
          {
            name: 'flower_red3',
            source: 'src/models/natureKit/flower_red3.gltf',
          },

          {
            name: 'flower_blue1',
            source: 'src/models/natureKit/flower_blue1.gltf',
          },
          {
            name: 'flower_blue2',
            source: 'src/models/natureKit/flower_blue2.gltf',
          },
          {
            name: 'flower_blue3',
            source: 'src/models/natureKit/flower_blue3.gltf',
          },
        ],
        scale: 8,
        clusterProperties: {
          numObjects: 10,
          xSpread: 30,
          zSpread: 20,
          obeyExclusionAreas: true,
        },
      },
      {
        sources: [
          {name: 'logs', source: 'src/models/natureKit/logs_stackLarge.gltf'},
        ],
        scale: 20,
      },
      {
        sources: [
          {name: 'pumpkin', source: 'src/models/natureKit/pumpkin.gltf'},
        ],
        scale: 20,
      },
      {
        sources: [
          {
            name: 'tent',
            source: 'src/models/natureKit/tent_detailedClosed.gltf',
          },
        ],
        scale: 20,
      },
      {
        sources: [
          {name: 'snowman', source: 'src/models/holidayKit/snowmanFancy.glb'},
        ],
        scale: 4,
        clusterProperties: {
          numObjects: 5,
          xSpread: 5,
          zSpread: 5,
          obeyExclusionAreas: true,
        },
      },
      {
        sources: [
          {name: 'snowman', source: 'src/models/holidayKit/snowmanFancy.glb'},
        ],
        scale: 20,
      },
      {
        sources: [
          {
            name: 'trainLocomotive',
            source: 'src/models/holidayKit/trainLocomotive.glb',
          },
        ],
        scale: 50,
      }
    );
  }

  private setChosenLandmarks() {
    this.chosenLandmarks = this.potentialLandmarks
      // Randomly sort elements...
      .sort(() => 0.5 - Math.random())
      // Choose the first n elements...
      .slice(0, this.positionsOfLandmarks.length);
  }

  public setLandmarks(
    resources: ResourcesSettings,
    unaryLandmarks: UnaryLandmarkSettings[],
    clusters: ClusterSettings[]
  ) {
    for (let i = 0; i < this.positionsOfLandmarks.length; i++) {
      const landmark = this.chosenLandmarks[i];

      if (landmark.clusterProperties === undefined) {
        unaryLandmarks.push({
          model: landmark.sources[0].name,
          scale: landmark.scale,
          position: {
            x: this.positionsOfLandmarks[i].x,
            z: this.positionsOfLandmarks[i].z,
          },
        });
      } else {
        clusters.push({
          models: landmark.sources.map(c => c.name),
          numObjects: landmark.clusterProperties.numObjects,
          scale: landmark.scale,
          position: {
            xCenter: this.positionsOfLandmarks[i].x,
            zCenter: this.positionsOfLandmarks[i].z,
            xSpread: landmark.clusterProperties.xSpread,
            zSpread: landmark.clusterProperties.zSpread,
          },
          obeyExclusionAreas: landmark.clusterProperties.obeyExclusionAreas,
        });
      }

      resources.items.push(...landmark.sources);
    }
  }
}
