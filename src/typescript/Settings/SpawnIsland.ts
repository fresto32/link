export default interface SpawnIslandSettings {
  ground: {
    texture: string;
    emissive: string;
    width: number;
    depth: number;
  };
  border: {
    model: string;
  };
  unaryLandmarks: {
    model: string;
    scale: number;
    rotation?: number;
    position: {
      x: number;
      z: number;
    };
  }[];
  clusters: {
    models: string[];
    numObjects: number;
    scale: number;
    position: {
      xCenter: number;
      zCenter: number;
      xSpread: number;
      zSpread: number;
    };
    obeyExclusionAreas: boolean;
  }[];
  buildings: {
    numWidthSections: number;
    numDepthSections: number;
    numHeightSections: number;
    position: {
      x: number;
      z: number;
    };
  }[];
}
