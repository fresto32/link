interface ClusterSettings {
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
}
