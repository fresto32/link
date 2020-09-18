import {prop} from '@typegoose/typegoose';

export default class ClusterSettings {
  @prop({required: true})
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
