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
  unaryLandmarks: UnaryLandmarkSettings[];
  clusters: ClusterSettings[];
  buildings: BuildingSettings[];
}
