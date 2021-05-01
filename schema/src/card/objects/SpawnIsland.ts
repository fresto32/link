import {Severity, modelOptions, prop} from '@typegoose/typegoose';
import BuildingSettings from './Building';
import ClusterSettings from './Cluster';
import UnaryLandmarkSettings from './UnaryLandmark';

@modelOptions({options: {allowMixed: Severity.ALLOW}})
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

  @prop({required: true, type: () => [UnaryLandmarkSettings]})
  unaryLandmarks!: UnaryLandmarkSettings[];

  @prop({required: true, type: () => [ClusterSettings]})
  clusters!: ClusterSettings[];

  @prop({required: true, type: () => [BuildingSettings]})
  buildings!: BuildingSettings[];
}
