import {prop} from '@typegoose/typegoose';

import BuildingSettings from './Building';
import ClusterSettings from './Cluster';
import UnaryLandmarkSettings from './UnaryLandmark';

export default class SpawnIslandSettings {
  @prop({required: true})
  ground!: {
    texture: string;
    emissive: string;
    width: number;
    depth: number;
  };

  @prop({required: true})
  border!: {
    model: string;
  };

  @prop({required: true})
  unaryLandmarks!: UnaryLandmarkSettings[];

  @prop({required: true})
  clusters!: ClusterSettings[];

  @prop({required: true})
  buildings!: BuildingSettings[];
}
