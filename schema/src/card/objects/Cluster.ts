import {Severity, modelOptions, prop} from '@typegoose/typegoose';

@modelOptions({options: {allowMixed: Severity.ALLOW}})
export default class ClusterSettings {
  @prop({required: true, type: () => [String]})
  models!: string[];

  @prop({required: true})
  numObjects!: number;

  @prop({required: true})
  scale!: number;

  @prop({required: true})
  position!: {
    xCenter: number;
    zCenter: number;
    xSpread: number;
    zSpread: number;
  };

  @prop({required: true})
  obeyExclusionAreas!: boolean;
}
